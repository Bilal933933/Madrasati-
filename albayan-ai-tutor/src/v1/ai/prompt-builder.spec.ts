import { PromptBuilder } from './prompt-builder.js';
import type { StudentContext } from '../student-context/context.types.js';
import type { RagResult } from '../knowledge/rag.service.js';

describe('PromptBuilder', () => {
  const builder = new PromptBuilder();

  const context: StudentContext = {
    student: {
      id: 42,
      name: 'أحمد محمد',
      email: 'ahmed@school.com',
      role: 'student',
    },
    placement: {
      gradeId: 8,
      gradeName: 'ثالث ثانوي',
      stageName: 'ثانوي',
      semesterName: 'الفصل الثاني',
      currentSubjectId: 5,
      currentSubjectName: 'الأحياء',
    },
    progress: {
      completedCount: 45,
      perSubject: [{ subjectId: 5, subjectName: 'الأحياء', completed: 30 }],
      lastLesson: { id: 15, title: 'التمثيل الضوئي', courseName: 'النبات' },
      dailyStreak: 5,
    },
    performance: {
      attemptsCount: 10,
      passedCount: 8,
      averageScore: 76.5,
      bestScore: 95,
      weakestExamType: 'lesson',
    },
    weakAreas: [{ lessonId: 7, lessonTitle: 'الوراثة', errorCount: 3 }],
    achievements: [{ id: 1, title: 'متعلّم منظم', unlockedAt: '2024-02-05' }],
  };

  const rag: RagResult = {
    lessons: [
      { id: 15, title: 'التمثيل الضوئي', summary: 'تحويل الضوء لطاقة' },
    ],
    contentWindow: 'محتوى عن التمثيل الضوئي',
    sources: [{ lessonId: 15, lessonTitle: 'التمثيل الضوئي' }],
  };

  it('يدمج السياق والمحتوى ويتضمن قواعد عدم التخمين', () => {
    const prompt = builder.build(context, rag);

    expect(prompt).toContain('أحمد محمد');
    expect(prompt).toContain('ثالث ثانوي');
    expect(prompt).toContain('الأحياء');
    expect(prompt).toContain('45');
    expect(prompt).toContain('76.5');
    expect(prompt).toContain('الوراثة');
    expect(prompt).toContain('5');
    expect(prompt).toContain('التمثيل الضوئي');
    expect(prompt).toContain('لا تخترع معلومات');
  });

  it('يأمر بالتدرّج عبر الطبقات وذكر المصدر', () => {
    const prompt = builder.build(context, rag);

    expect(prompt).toContain('ثلاث طبقات');
    expect(prompt).toContain('الدرس على المنصة');
    expect(prompt).toContain('الكتاب المدرسي');
    expect(prompt).toContain('المراجع العامة');
    expect(prompt).toContain('(من كتاب كيف تتقن النحو)');
    expect(prompt).toContain('(من الكتاب المدرسي)');
  });

  it('يجعل الكتاب المدرسي هو الفيصل عند أي تعارض', () => {
    const prompt = builder.build(context, rag);

    expect(prompt).toContain('الحقيقة المطلقة');
    expect(prompt).toContain('الفيصل عند أي تعارض');
    expect(prompt).toContain('فاعتمد ما في الكتاب المدرسي');
    expect(prompt).toContain('لا تخالف الكتاب المدرسي');
  });

  it('يقلب ترتيب الابتداء: من الكتاب المدرسي ثم الدرس ثم المراجع', () => {
    const prompt = builder.build(context, rag);

    const idxTextbook = prompt.indexOf('ابدأ إجابتك من الكتاب المدرسي');
    const idxLesson = prompt.indexOf('ثم أثرِها من الدرس');
    const idxRefs = prompt.indexOf('المراجع العامة عند وجود تفصيل إضافي');

    expect(idxTextbook).toBeGreaterThan(-1);
    expect(idxLesson).toBeGreaterThan(idxTextbook);
    expect(idxRefs).toBeGreaterThan(idxLesson);
  });

  it('يأمر بإبراز التفاصيل الإضافية في قسم منفصل', () => {
    const prompt = builder.build(context, rag);

    expect(prompt).toContain('تفاصيل إضافية عن موضوع السؤال');
    expect(prompt).toContain('أشكاله، أقسامه من حيث الإعراب');
    expect(prompt).toContain('قسم منفصل');
    expect(prompt).toContain('اشرحها');
  });
});
