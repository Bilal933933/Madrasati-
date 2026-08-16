import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import type { Content, Schema } from '@google/genai';

interface StructuredOptions {
  system: string;
  userText: string;
  schema: Schema;
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

@Injectable()
export class GeminiService {
  private readonly ai: GoogleGenAI;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('GEMINI_API_KEY');
    this.model = config.get<string>('GEMINI_MODEL') ?? 'gemini-3.1-flash-lite';
    this.maxTokens = Number(config.get<number>('GEMINI_MAX_TOKENS') ?? 1024);

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY غير مضبوطة في .env');
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * يدفق الإجابة chunk-by-chunk من Gemini عبر @google/genai.
   * يستقبل تاريخ المحادثة متعدد الأدوار (user/model) مع السؤال الحالي
   * في آخر element — لا يُحمَّل الرد كاملًا في الذاكرة.
   */
  async *stream(
    system: string,
    history: ChatTurn[],
    currentQuestion: string,
  ): AsyncGenerator<string> {
    const contents: Content[] = history.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    }));
    contents.push({ role: 'user', parts: [{ text: currentQuestion }] });

    const attempts = 3;
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      let yielded = false;
      try {
        const stream = await this.ai.models.generateContentStream({
          model: this.model,
          contents,
          config: {
            systemInstruction: system,
            maxOutputTokens: this.maxTokens,
          },
        });

        for await (const chunk of stream) {
          if (chunk.text) {
            yielded = true;
            yield chunk.text;
          }
        }
        return;
      } catch (error) {
        // انقطاع بعد بدء البث لا يُعوض بإعادة المحاولة (سيكرر المستخدم نصًا
        // جزئيًا فيظهر مكررًا) — يُرمى الخطأ ليُرسل للعميل ويُعرض بوضوح.
        if (yielded || !isRetryableStreamError(error) || attempt === attempts) {
          throw error;
        }
        lastError = error;
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * attempt + Math.floor(Math.random() * 500)),
        );
      }
    }
    throw lastError;
  }

  /**
   * مخرجات منظمة 100%: يُجبِر النموذج على إرجاع JSON مطابق لـ schema
   * عبر responseMimeType + responseSchema، ثم يمرّره JSON.parse.
   */
  async generateStructured<T>(options: StructuredOptions): Promise<T> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: options.userText,
      config: {
        systemInstruction: options.system,
        responseMimeType: 'application/json',
        responseSchema: options.schema,
        maxOutputTokens: this.maxTokens,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('النموذج لم يُعدّ مخرجات JSON صالحة.');
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error('تعذّر تحليل استجابة JSON الواردة من النموذج.');
    }
  }
}

/**
 * هل الخطأ عابرًا فيستحق إعادة محاولة الدفق؟ Gemini قد يرفض مؤقتًا بضغط
 * عالٍ (UNAVAILABLE/503) أو استنفاد حصة (429) — لا نعيد المحاولة في أخطاء
 * أخرى (مفاتيح، حظر، مدخلات) لأنها لن تنجح بالتكرار.
 */
function isRetryableStreamError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';
  return (
    message.includes('UNAVAILABLE') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    /got status: (429|5\d\d)/.test(message) ||
    /"code":(429|503)/.test(message)
  );
}
