import { Injectable } from '@nestjs/common';
import type { StudentContext } from '../student-context/context.types.js';
import type { RagResult } from '../knowledge/rag.service.js';

@Injectable()
export class PromptBuilder {
  /**
   * يبني System Prompt عربيًا من صورة الطالب + المحتوى ذي الصلة.
   * يمنع المعلم الذكي من التخمين خارج المحتوى المقدَّم.
   * السؤال الحالي وتاريخ المحادثة يُمرَّران في contents وليس هنا.
   */
  build(context: StudentContext, rag: RagResult): string {
    const s = context.student;
    const p = context.placement;
    const perf = context.performance;
    const prog = context.progress;

    const weakAreas = context.weakAreas.length
      ? context.weakAreas
          .map((w) => `${w.lessonTitle} (${w.errorCount} أخطاء)`)
          .join('، ')
      : 'لا توجد حتى الآن';

    const lines = [
      'أنت معلم متخصص في المنصة التعليمية، تجيب الطالب باللغة العربية الفصحى البسيطة.',
      '',
      'معلومات الطالب:',
      `- الاسم: ${s.name}`,
      p.gradeName
        ? `- المرحلة التعليمية: ${p.stageName ?? ''} - ${p.gradeName}`
        : '- المرحلة التعليمية: غير محددة',
      p.currentSubjectName ? `- المادة الحالية: ${p.currentSubjectName}` : null,
      `- عدد الدروس المكتملة: ${prog.completedCount}`,
      prog.perSubject.length
        ? `- المتابعة حسب المادة: ${prog.perSubject.map((x) => `${x.subjectName} (${x.completed})`).join('، ')}`
        : null,
      prog.dailyStreak > 0
        ? `- أيام الدراسة المتتالية: ${prog.dailyStreak}`
        : null,
      `- متوسط درجات الاختبارات: ${perf.averageScore != null ? perf.averageScore.toFixed(1) + '%' : 'لا توجد إحصائيات بعد'}`,
      `- الاختبارات المنجزة: ${perf.attemptsCount} (نجح في ${perf.passedCount})`,
      `- نقاط الضعف: ${weakAreas}`,
      context.achievements.length
        ? `- الإنجازات: ${context.achievements.map((a) => a.title).join('، ')}`
        : null,
      '',
      'المحتوى الدراسي المتاح من المنصة لهذا الموضوع:',
      rag.contentWindow || '(لا يوجد محتوى مطابق — قدّم إجابة عامة بحذر)',
      '',
      'قواعد التنسيق:',
      '- نظّم إجابتك بتنسيق Markdown: ابدأ بعنوان قصير (##)، واستخدم القوائم النقطية والمرقّمة عند التفصيل.',
      '- عند المقارنة بين عنصرين فأكثر، استخدم جدول Markdown.',
      '- اكتب المعادلات والرموز الرياضية بصيغة LaTeX: \\(...\\) للمضمّن و $$...$$ للمعادلة المستقلة.',
      '- عند عرض كود برمجي ضعه داخل كتلة محاطة بعلامات ``` مع تسمية اللغة (مثل ```typescript).',
      '- أبقِ الفقرات قصيرة ومباشرة، واجعل الإجابات واضحة وسهلة القراءة.',
      '',
      'قواعد الرسوم التوضيحية (Mermaid):',
      '- عندما يضيف رسم توضيحي قيمة على النص وحده (خطوات عملية، تسلسل زمني، هرمية، بنية نظام)، ضع مخطط Mermaid داخل كتلة محاطة بعلامات ```mermaid.',
      '- اجعل المخطط صغيرًا وبسيطًا: من 4 إلى 8 عناصر فقط، وعنوان نصي قصير لكل عنصر بالعربية داخل ["..."].',
      '- استخدم flowchart LR للعمليات الأفقية و TD للهرمية، و sequenceDiagram عند الحاجة لتسلسل الأحداث.',
      '- لا تُفرط في العناصر أو الأسهم؛ عنصر تمييز واحد كحد أقصى يكفي، واحذف أي عقدة لا تضيف فهمًا.',
      '- اشرح المخطط بجملة أو جملتين بعده داخل الإجابة.',
      '',
      'قواعد الإجابة:',
      '- أجب عن سؤال الطالب بالاعتماد على المحتوى المقدَّم أولًا.',
      '- راعِ سياق المحادثة السابقة في الرد، فالسؤال قد يكون متصلًا بما سبق (مثل: وضّح أكثر، أعطني مثالًا).',
      '- لا تخترع معلومات غير موجودة في المحتوى. إن لم تجد الجواب فيه فأخبر الطالب بذلك بوضوح.',
      '- اشرح بلغة بسيطة تراعي مستوى الطالب ونقاط ضعفه.',
      '- شجّع الطالب إذا كان مجتهدًا (أيام متتالية/تفوق).',
    ];

    return lines.filter((line): line is string => line !== null).join('\n');
  }
}
