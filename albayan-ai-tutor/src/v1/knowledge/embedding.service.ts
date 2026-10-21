import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { LoggerService } from '../common/logger/logger.service.js';

/**
 * يولّد متجهات نصية عبر Gemini Embedding:
 * - MRL عبر outputDimensionality (768 بُعداً) لتوفير مساحة التخزين.
 * - دفعات (batch) داخل الطلب الواحد، مع توازٍ محدود خارجياً لإحترام RPS.
 * - إعادة محاولة مع تراجع أسي للفشل العابر (429/5xx).
 */
@Injectable()
export class EmbeddingService {
  private readonly ai: GoogleGenAI;
  private readonly model: string;
  private readonly dimensions: number;
  private readonly batchSize: number;
  private readonly retries: number;
  private readonly baseDelayMs: number;

  constructor(
    config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const apiKey = config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY غير مضبوطة في .env');
    }
    this.ai = new GoogleGenAI({ apiKey });

    this.model =
      config.get<string>('EMBEDDING_MODEL') ?? 'gemini-embedding-001';
    this.dimensions = Number(config.get<number>('EMBEDDING_DIMENSIONS') ?? 768);
    this.batchSize = Math.max(
      1,
      Number(config.get<number>('EMBEDDING_BATCH_SIZE') ?? 25),
    );
    this.retries = Math.max(
      0,
      Number(config.get<number>('EMBEDDING_RETRIES') ?? 3),
    );
    this.baseDelayMs = Math.max(
      50,
      Number(config.get<number>('EMBEDDING_RETRY_DELAY_MS') ?? 500),
    );
  }

  /** متجه لسؤال/نص واحد. */
  async embed(text: string): Promise<number[]> {
    const vectors = await this.embedBatch([text]);
    return vectors[0];
  }

  /**
   * متجهات لعدة نصوص — يقسمها دفعات ويبث التوازي بحذر (بلا انفجار RPS).
   * يُرجع مصفوفة بنفس ترتيب المدخلات؛ يفشل الدفعة كاملة عند تجاوز المحاولات.
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    const result: number[][] = [];
    const delay = async (ms: number): Promise<void> => {
      await new Promise((r) => setTimeout(r, ms));
    };

    for (let i = 0; i < texts.length; i += this.batchSize) {
      const slice = texts.slice(i, i + this.batchSize);
      result.push(...(await this.embedOnce(slice)));
      // فترة راحة قصيرة بين الدفعات لتفادي حد المعدل.
      if (i + this.batchSize < texts.length) {
        await delay(this.baseDelayMs);
      }
    }
    return result;
  }

  private async embedOnce(texts: string[]): Promise<number[][]> {
    let attempt = 0;

    while (true) {
      try {
        const response = await this.ai.models.embedContent({
          model: this.model,
          contents: texts,
          config: {
            outputDimensionality: this.dimensions,
          },
        });
        const embeddings = response.embeddings ?? [];
        const vectors = embeddings.map((e) => e.values ?? []);
        if (vectors.length !== texts.length) {
          throw new Error(
            `استجابة embeddings ناقصة: توقّع ${texts.length} وحصل على ${vectors.length}`,
          );
        }
        return vectors;
      } catch (err) {
        attempt += 1;
        if (attempt > this.retries) {
          throw err;
        }
        const delayMs = this.baseDelayMs * 2 ** attempt;
        this.logger.warn(
          { event: 'embedding.retry' },
          'فشل دفعة embedding — إعادة محاولة',
          {
            attempt,
            delayMs,
            error: err instanceof Error ? err.message : String(err),
          },
        );
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
}
