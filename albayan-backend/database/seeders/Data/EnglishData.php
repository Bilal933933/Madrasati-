<?php

namespace Database\Seeders\Data;

/**
 * اللغة الإنجليزية — الصف الرابع الابتدائي، الفصل الأول.
 * وحدة «Let's Learn English» بخمسة دروس كاملة الرحلة، كل درس خمس فقرات.
 */
class EnglishData
{
    public static function plans(): array
    {
        return [
            [
                'grade' => 'primary_4',
                'semester' => 1,
                'subject' => 'اللغة الإنجليزية',
                'unit' => "Let's Learn English",
                'description' => 'مفردات وجُمل بسيطة للتواصل اليومي: المدرسة والأرقام والأسرة والحيوانات والألوان.',
                'lessons' => [
                    self::lessonMySchool(),
                    self::lessonNumbers(),
                    self::lessonMyFamily(),
                    self::lessonAnimals(),
                    self::lessonColours(),
                ],
            ],
        ];
    }

    /* ------------------------- 1. My School ------------------------- */

    private static function lessonMySchool(): array
    {
        return [
            'title' => 'My School / مدرستي',
            'summary' => "نتعلّم أسماء الأماكن والأدوات في المدرسة باللغة الإنجليزية ونتواصل بجمل بسيطة.",
            'objectives' => [
                "'نحفظ مفردات المدرسة: classroom، book، pen، board.",
                'أكوّن جملة إنجليزية بسيطة عن مدرستي.',
                'أستمع إلى جملة قصيرة وأستخرج منها المعلومة.',
            ],
            'video' => LessonSpec::VIDEO,
            'pre' => [
                LessonSpec::mcq('كلمة «كتاب» بالإنجليزية هي...', ['book', 'pen', 'bag', 'table'], 0, 'Book تعني كتاب.'),
                LessonSpec::tf("The word «classroom» means room of class.", true, 'Classroom = فصل دراسي.'),
                LessonSpec::mcq('ما معنى «pen»؟', ['قلم', 'كتاب', 'حقيبة', 'طباشير'], 0, 'Pen = قلم جاف.'),
            ],
            'paragraphs' => [
                LessonSpec::paragraph(
                    'كلمات الفصل الدراسي',
                    LessonSpec::body(
                        "نحفظ أسماء ما حولنا في الفصل: book (كتاب)، pen (قلم)، pencil (رصاص)، board (سبورة)، desk (مقعد/منضدة)، bag (حقيبة).",
                        ['This is a book.', 'That is a pen.', 'I have a pencil.'],
                        'اربط كل كلمة بالشيء الذي تراه أمامك حتى تثبت في الذاكرة.',
                        ['كرر كل كلمة ثلاث مرات بصوت مسموع.', 'أشر إلى الشيء عند نطق اسمه.', 'اكتب الكلمة تحت كل شيء في دفترك.'],
                    ),
                    [
                        LessonSpec::mcq('الكلمة الإنجليزية لكلمة «سبورة» هي...', ['board', 'book', 'bag', 'door'], 0, 'Board = سبورة.'),
                        LessonSpec::tf("The word «pencil» means stop." , false, 'Pencil تعني قلم رصاص.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'جملة «This is»',
                    LessonSpec::body(
                        "نستخدم This is للإشارة إلى شيء قريب منا، فنقول: This is a book (هذا كتاب)، وهذه أبسط جملة للتقديم.",
                        ['This is a pen.', 'This is my desk.', 'This is the board.'],
                        'This is = هذا/هذه (للشيء القريب المفرد).',
                    ),
                    [
                        LessonSpec::mcq('الجملة الصحيحة لتقديم «قلم» هي...', ['This is a pen.', 'This is a book.', 'This is a bag.', 'I am pen.'], 0, 'نستخدم This is a + اسم الشيء.'),
                        LessonSpec::mcq('معنى جملة «This is my desk»...', ['هذه منضدتي', 'هذا كتابي', 'هذه حقيبتي', 'هو معلمي'], 0, 'My desk = منضدتي.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'أدواتي المدرسية',
                    LessonSpec::body(
                        "نتعلّم صيغة الجمع البسيطة بإضافة s: books (كتب)، pens (أقلام)، pencils (أقلام رصاص)، bags (حقائب).",
                        ['Books on the desk.', 'Pens in the bag.', 'Pencils on the table.'],
                        'إضافة s تحوّل المفرد إلى جمع في الإنجليزية.',
                    ),
                    [
                        LessonSpec::mcq('جمع كلمة «book» هو...', ['books', 'bookes', 'booked', 'booker'], 0, 'نضيف s فتصبح books.'),
                        LessonSpec::tf('جمع «pen» هو «pens».', true, 'نعم، pens.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'محادثة قصيرة',
                    LessonSpec::body(
                        "نتدرب على محادثة بسيطة: What is this? (ما هذا؟) — This is a book. حيث نسأل ونجيب بجملة كاملة.",
                        ['What is this? → This is a board.', 'What is this? → This is a desk.', 'What is that? → That is a door.'],
                        'اسأل عن كل شيء حولك ولا تتردد في السؤال.',
                    ),
                    [
                        LessonSpec::mcq('ما معنى «What is this?»؟', ['ما هذا؟', 'ماذا تفعل؟', 'أين هذا؟', 'لماذا؟'], 0, 'What is this? = ما هذا؟'),
                        LessonSpec::mcq('لو سألك صديقك ما هذا، وشِرت إلى كتاب تجيب...', ['This is a book.', 'I am a book.', 'Go home.', 'Good morning.'], 0, 'نجيب بإشارة الشيء: This is a book.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'أنشودة الفصل',
                    LessonSpec::body(
                        "ختامًا نحفظ نشيدًا قصيرًا: I go to school, I go to school, with my bag and my book. فتثبت المفردات في الذاكرة بالموسيقى.",
                        ['I go to school with my bag.', 'I have a pen and a book.', 'I learn every day.'],
                        'الأناشيد أسرع وسيلة لحفظ المفردات.',
                    ),
                    [
                        LessonSpec::mcq('في النشيد نذهب إلى المدرسة ومعنا...', ['bag and book', 'cat and dog', 'apple and pear', 'sun and moon'], 0, 'نذهب ومعنا الحقيبة والكتاب.'),
                    ]
                ),
            ],
            'final' => [
                LessonSpec::mcq('كلمة «كتاب» بالإنجليزية...', ['book', 'pen', 'bag', 'desk'], 0, 'Book.'),
                LessonSpec::mcq('كلمة «قلم رصاص»...', ['pencil', 'book', 'board', 'door'], 0, 'Pencil.'),
                LessonSpec::mcq('جملة «This is a pen» تعني...', ['هذا قلم', 'هذا كتاب', 'هذه حقيبة', 'هذا معلم'], 0, 'هذا قلم.'),
                LessonSpec::tf('جمع كلمة «bag» هو «bags».', true, 'نعم.'),
                LessonSpec::mcq('السؤال «What is this?» يُجاب بـ...', ['This is a book.', 'Good morning.', 'Thank you.', 'Yes, please.'], 0, 'نجيب بجملة This is...'),
            ],
        ];
    }

    /* ------------------------- 2. Numbers ------------------------- */

    private static function lessonNumbers(): array
    {
        return [
            'title' => 'Numbers / الأرقام',
            'summary' => 'نحفظ الأرقام من 1 إلى 20 بالإنجليزية ونستخدمها في العد والجمل.',
            'objectives' => [
                'أعدّ من 1 إلى 20 بالإنجليزية.',
                'أكتب الأرقام كتابةً حروفية.',
                'أستخدم الأرقام في أسئلة الكم (How many).',
            ],
            'video' => LessonSpec::VIDEO,
            'pre' => [
                LessonSpec::mcq('ما الأرقام بالإنجليزية من 1 إلى 3؟', ['one, two, three', 'three, two, one', 'one, one, two', 'ten, twenty, thirty'], 0, 'One, two, three.'),
                LessonSpec::tf('الرقم 10 بالإنجليزية هو «ten».', true, 'نعم، ten.'),
            ],
            'paragraphs' => [
                LessonSpec::paragraph(
                    'الأرقام من 1 إلى 10',
                    LessonSpec::body(
                        'نحفظ الأرقام الأساسية: one (1)، two (2)، three (3)، four (4)، five (5)، six (6)، seven (7)، eight (8)، nine (9)، ten (10).',
                        ['I have three books.', 'Two pens in my bag.', 'Five fingers on my hand.'],
                        'استخدم أصابع يدك عند العد لتثبيت الأرقام.',
                        ['عدّ أصابعك من 1 إلى 10.', 'كرر النطق بالإنجليزية.', 'اكتب كل رقم بجانب شكله.'],
                    ),
                    [
                        LessonSpec::mcq('الرقم 7 بالإنجليزية هو...', ['seven', 'six', 'eight', 'nine'], 0, 'Seven = 7.'),
                        LessonSpec::mcq('الرقم 4 بالإنجليزية...', ['four', 'five', 'three', 'six'], 0, 'Four = 4.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'الأرقام من 11 إلى 20',
                    LessonSpec::body(
                        'نكمل العد: eleven (11)، twelve (12)، thirteen (13)، fourteen (14)، fifteen (15)، sixteen (16)، seventeen (17)، eighteen (18)، nineteen (19)، twenty (20).',
                        ['Thirteen + fifteen = twenty-eight.', 'Eleven, twelve, thirteen.'],
                        'احفظ 11 و12 كما هما لأن لهما شكلًا خاصًا.',
                    ),
                    [
                        LessonSpec::mcq('الرقم 13 بالإنجليزية هو...', ['thirteen', 'thirty', 'three', 'nineteen'], 0, 'Thirteen.'),
                        LessonSpec::mcq('الرقم 20 بالإنجليزية هو...', ['twenty', 'twelve', 'two', 'ten'], 0, 'Twenty = 20.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'السؤال How many',
                    LessonSpec::body(
                        'نسأل عن الكم بـ How many (كم العدد؟)، فنقول: How many books do you have? (كم كتابًا معك؟) والجواب: I have five books.',
                        ['How many pens? → Three pens.', 'How many windows? → Two windows.', 'How many chairs? → Eight chairs.'],
                        'How many يأتي مع جمع الاسم دائمًا.',
                    ),
                    [
                        LessonSpec::mcq('السؤال «How many» يستخدم للسؤال عن...', ['الكمية والعدد', 'اللون', 'الاسم', 'الزمان'], 0, 'How many = كم العدد.'),
                        LessonSpec::mcq('كيف تسأل عن عدد الأقلام؟', ['How many pens?', 'What is a pen?', 'Where is pen?', 'When pen?'], 0, 'نستخدم How many + الجمع.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'العد من 10 إلى 100',
                    LessonSpec::body(
                        'نتعلم العشرات: ten (10)، twenty (20)، thirty (30)، forty (40)، fifty (50)، sixty (60)، seventy (70)، eighty (80)، ninety (90)، hundred (100).',
                        ['Twenty + thirty = fifty.', 'Sixty + forty = hundred.', 'Old hundred = 100.'],
                        'أرقام العشرات تنتهي بـ ty ما عدا 10،20.',
                    ),
                    [
                        LessonSpec::mcq('الرقم 30 بالإنجليزية...', ['thirty', 'three', 'thirteen', 'twenty'], 0, 'Thirty.'),
                        LessonSpec::mcq('الرقم 50 بالإنجليزية...', ['fifty', 'fifteen', 'five', 'forty'], 0, 'Fifty.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'رقم هاتفي',
                    LessonSpec::body(
                        'نطبق الأرقام في حياتنا: نقرأ أرقام الهواتف والسيارات ونرحب بتقديم أنفسنا: My phone number is 12... ',
                        ['My number is seven, eight, nine.', 'Bus number fifteen.', 'Classroom number four.'],
                        'قراءة الأرقام بصوت عالٍ ثنائي اللغة يقوي ذاكرتك.',
                    ),
                    [
                        LessonSpec::mcq('كيف تقول «حافلة رقم 15» بالإنجليزية؟', ['Bus number fifteen.', 'Bus fifteen... number.', 'Fifteen bus numbers.', 'Number bus fifteen.'], 0, 'Bus number fifteen.'),
                        LessonSpec::tf('الرقم 11 بالإنجليزية هو eleven.', true, 'نعم.'),
                    ]
                ),
            ],
            'final' => [
                LessonSpec::mcq('الرقم 8 بالإنجليزية...', ['eight', 'seven', 'nine', 'six'], 0, 'Eight.'),
                LessonSpec::mcq('الرقم 12 بالإنجليزية...', ['twelve', 'twenty', 'eleven', 'two'], 0, 'Twelve.'),
                LessonSpec::mcq('الرقم 40 بالإنجليزية...', ['forty', 'four', 'fourteen', 'fifty'], 0, 'Forty.'),
                LessonSpec::mcq('How many books? → الإجابة...', ['Three books.', 'Book three.', 'I book.', 'Books many.'], 0, 'Three books.'),
                LessonSpec::tf('أرقام العشرات مثل 30 تنتهي بـ ty.', true, 'نعم، مثل thirty.'),
            ],
        ];
    }

    /* ------------------------- 3. My Family ------------------------- */

    private static function lessonMyFamily(): array
    {
        return [
            'title' => 'My Family / عائلتي',
            'summary' => 'نتعلّم أسماء أفراد الأسرة بالإنجليزية ونقدم أفراد عائلتنا بجمل بسيطة.',
            'objectives' => [
                'أحفظ كلمات أفراد الأسرة.',
                'أقدّم أفراد عائلتي بجملة كاملة.',
                'أستعمل ضمائر الملكية my / his / her.',
            ],
            'video' => LessonSpec::VIDEO,
            'pre' => [
                LessonSpec::mcq('كلمة «أم» بالإنجليزية هي...', ['mother', 'father', 'sister', 'brother'], 0, 'Mother = أم.'),
                LessonSpec::tf('كلمة «أب» بالإنجليزية father.', true, 'نعم.'),
            ],
            'paragraphs' => [
                LessonSpec::paragraph(
                    'أفراد الأسرة',
                    LessonSpec::body(
                        'نحفظ أفراد الأسرة: father (أب)، mother (أم)، brother (أخ)، sister (أخت)، grandfather (جد)، grandmother (جدة)، baby (رضيع).',
                        ['My father and my mother.', 'I have one brother.', 'My grandmother is kind.'],
                        'اربط كل كلمة بصورته في ذهنك ورددها.',
                    ),
                    [
                        LessonSpec::mcq('كلمة «أخت» بالإنجليزية...', ['sister', 'brother', 'mother', 'father'], 0, 'Sister = أخت.'),
                        LessonSpec::mcq('كلمة «جد» بالإنجليزية...', ['grandfather', 'grandmother', 'father', 'friend'], 0, 'Grandfather = جد.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'أعرّف بعائلتي',
                    LessonSpec::body(
                        'نقدّم عائلتنا بجملة: This is my father (هذا أبي)، This is my mother (هذه أمي)، I have a sister (لدي أخت).',
                        ['This is my mother.', 'This is my grandfather.', 'I have a baby sister.'],
                        'استخدم my بمعنى «خاصتي» للتعبير عن ملكيتك.',
                    ),
                    [
                        LessonSpec::mcq('جملة «هذا أبي» بالإنجليزية...', ['This is my father.', 'This is my mother.', 'I am father.', 'My father is this.'], 0, 'This is my father.'),
                        LessonSpec::mcq('معنى «I have a sister»...', ['لدي أخت', 'أنا أخت', 'أختي ذاهبة', 'أحضر أختي'], 0, 'I have a sister = لدي أخت.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'ضمائر الملكية',
                    LessonSpec::body(
                        'نستخدم my للشيء المملوك لي، وhis للذكر (له)، وher للأنثى (لها): my book، his car، her doll.',
                        ['This is my bag.', 'This is his pen.', 'That is her flower.'],
                        'اختر الضمير حسب صاحب الشيء: أنا/هو/هي.',
                    ),
                    [
                        LessonSpec::mcq('نقول عن قلم يخص أحمد: This is ... pen.', ['his', 'her', 'my', 'our'], 0, 'أحمد ذكر فنستخدم his.'),
                        LessonSpec::mcq('نقول عن حقيبة تخص سلمى: This is ... bag.', ['her', 'his', 'my', 'their'], 0, 'سلمى أنثى فنستخدم her.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'من هو؟',
                    LessonSpec::body(
                        'نتحدث عن أشخاص بالسؤال Who is this? (من هذا؟) والجواب This is my brother (هذا أخي).',
                        ['Who is this? → This is my grandfather.', 'Who is she? → She is my sister.', 'Who is he? → He is my father.'],
                        'Who = من، للسؤال عن الأشخاص.',
                    ),
                    [
                        LessonSpec::mcq('السؤال «Who is this?» يعني...', ['من هذا؟', 'ما هذا؟', 'أين هذا؟', 'كم هذا؟'], 0, 'Who = من، للأشخاص.'),
                        LessonSpec::mcq('ماذا تجيب عن سؤالك «من هذا؟» إذا كان أخاك؟', ['This is my brother.', 'This is my friend.', 'He is mother.', 'I am brother.'], 0, 'This is my brother.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'عائلتي وأنشطتها',
                    LessonSpec::body(
                        'نتحدث عما تفعله عائلتنا: My father works، My mother cooks، My brother plays football، My sister reads.',
                        ['My father works every day.', 'My mother cooks nice food.', 'My brother plays football.', 'My sister reads stories.'],
                        'الفعل يأتي بعد الاسم مباشرة: subject + verb.',
                    ),
                    [
                        LessonSpec::mcq('كيف تقول «أبي يعمل»؟', ['My father works.', 'My father work.', 'Works my father.', 'Father works my.'], 0, 'My father works.'),
                        LessonSpec::mcq('«أمي تطبخ» بالإنجليزية...', ['My mother cooks.', 'My mother cooking.', 'Cooks my mother.', 'Mother my cooks.'], 0, 'My mother cooks.'),
                    ]
                ),
            ],
            'final' => [
                LessonSpec::mcq('كلمة «أم» بالإنجليزية...', ['mother', 'father', 'uncle', 'aunt'], 0, 'Mother.'),
                LessonSpec::mcq('كلمة «أخ» بالإنجليزية...', ['brother', 'sister', 'cousin', 'friend'], 0, 'Brother.'),
                LessonSpec::mcq('جملة «هذه أمي» بالإنجليزية...', ['This is my mother.', 'This is my sister.', 'This is my aunt.', 'This is my grandma.'], 0, 'This is my mother.'),
                LessonSpec::mcq('هذا قلم يُخص ليلي (أنثى): This is ... pen.', ['her', 'his', 'my', 'its'], 0, 'لأن ليلي أنثى نستخدم her.'),
                LessonSpec::mcq('«Who is this?» سؤال عن...', ['الشخص', 'العدد', 'المكان', 'الزمان'], 0, 'من هذا؟ للأشخاص.'),
            ],
        ];
    }

    /* ------------------------- 4. Animals ------------------------- */

    private static function lessonAnimals(): array
    {
        return [
            'title' => 'Animals / الحيوانات',
            'summary' => 'نتعلّم أسماء الحيوانات بالإنجليزية ونصفها بجمل بسيطة.',
            'objectives' => [
                'أحفظ أسماء الحيوانات الشائعة.',
                'أصف الحيوان بجملة بسيطة.',
                'أصنّف الحيوانات أليفة ووحشية.',
            ],
            'video' => LessonSpec::VIDEO,
            'pre' => [
                LessonSpec::mcq('كلمة «قط» بالإنجليزية...', ['cat', 'dog', 'lion', 'bird'], 0, 'Cat = قط.'),
                LessonSpec::tf('كلمة «كلب» بالإنجليزية dog.', true, 'نعم.'),
            ],
            'paragraphs' => [
                LessonSpec::paragraph(
                    'الحيوانات الأليفة',
                    LessonSpec::body(
                        'نحفظ الحيوانات الأليفة: cat (قط)، dog (كلب)، rabbit (أرنب)، bird (عصفور)، fish (سمكة)، goat (ماعز).',
                        ['I have a cat.', 'The dog is friendly.', 'A rabbit eats carrots.'],
                        'الأليفة تعيش معنا بسلام في البيت والمزرعة.',
                    ),
                    [
                        LessonSpec::mcq('كلمة «أرنب» بالإنجليزية...', ['rabbit', 'cat', 'dog', 'horse'], 0, 'Rabbit = أرنب.'),
                        LessonSpec::mcq('كلمة «سمكة» بالإنجليزية...', ['fish', 'bird', 'goat', 'lion'], 0, 'Fish = سمكة.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'الحيوانات البرية',
                    LessonSpec::body(
                        'نتعرف على الحيوانات البرية: lion (أسد)، tiger (نمر)، elephant (فيل)، giraffe (زرافة)، monkey (قرد)، camel (جمل).',
                        ['The lion is strong.', 'The elephant is big.', 'The giraffe is tall.'],
                        'الوحشية تعيش في البراري والغابات ولا نربيها في البيت.',
                    ),
                    [
                        LessonSpec::mcq('كلمة «أسد» بالإنجليزية...', ['lion', 'tiger', 'bear', 'wolf'], 0, 'Lion = أسد.'),
                        LessonSpec::mcq('كلمة «فيل» بالإنجليزية...', ['elephant', 'giraffe', 'monkey', 'camel'], 0, 'Elephant = فيل.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'أصف الحيوان',
                    LessonSpec::body(
                        'نصِف الحيوان بجملة: The cat is small (القط صغير)، The elephant is big (الفيل كبير)، The lion is strong.',
                        ['The rabbit is fast.', 'The turtle is slow.', 'The bird can fly.'],
                        'صفة الحيوان تأتي بعد الفعل is.',
                    ),
                    [
                        LessonSpec::mcq('كيف نصف الفيل؟', ['The elephant is big.', 'The elephant is small.', 'The elephant can fly.', 'The elephant is green.'], 0, 'الفيل كبير.'),
                        LessonSpec::mcq('الأرنب... مقارنة بالسلحفاة.', ['The rabbit is fast.', 'The rabbit is slow.', 'The rabbit is big.', 'The rabbit can swim.'], 0, 'الأرنب سريع.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'ماذا يأكل الحيوان؟',
                    LessonSpec::body(
                        'نتحدث عن طعام الحيوان: The cat drinks milk، The rabbit eats carrots، The lion eats meat، The camel eats plants.',
                        ['The cat drinks milk.', 'The rabbit eats carrots.', 'The lion eats meat.'],
                        'استخدم eat للأكل وdrink للشرب.',
                    ),
                    [
                        LessonSpec::mcq('ماذا يأكل الأسد؟', ['اللحم', 'النجيل', 'الجزر', 'الحليب'], 0, 'الأسد من الحيوانات اللاحمة فيأكل اللحم.'),
                        LessonSpec::tf('The cat drinks milk يعني القط يشرب الحليب.', true, 'نعم، drink = يشرب.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'أنشودة الحيوانات',
                    LessonSpec::body(
                        'نحفظ نشيدًا: I have a cat, a cat in my house. The cat says meow, meow, meow. فتترسخ الأسماء بالمتعة.',
                        ['The cat says meow.', 'The dog says woof.', 'The bird says tweet.'],
                        'صوّت الحيوان بالإنجليزية يثبّت اسمه في الذاكرة.',
                    ),
                    [
                        LessonSpec::mcq('ماذا يقول القط بالإنجليزية؟', ['meow', 'woof', 'tweet', 'moo'], 0, 'القط يقول meow.'),
                        LessonSpec::mcq('ماذا تقول الكلب بالإنجليزية؟', ['woof', 'meow', 'tweet', 'quack'], 0, 'الكلب يقول woof.'),
                    ]
                ),
            ],
            'final' => [
                LessonSpec::mcq('كلمة «أسد» بالإنجليزية...', ['lion', 'cat', 'dog', 'bird'], 0, 'Lion.'),
                LessonSpec::mcq('كلمة «قرد» بالإنجليزية...', ['monkey', 'camel', 'giraffe', 'fish'], 0, 'Monkey.'),
                LessonSpec::mcq('«The elephant is big» تعني...', ['الفيل كبير', 'الفيل صغير', 'الفيل سريع', 'الفيل يطير'], 0, 'الفيل كبير.'),
                LessonSpec::mcq('الأرنب يأكل...', ['carrots', 'meat', 'fish', 'stones'], 0, 'Carrots = جزر.'),
                LessonSpec::tf('The cat says meow.', true, 'نعم.'),
            ],
        ];
    }

    /* ------------------------- 5. Colours ------------------------- */

    private static function lessonColours(): array
    {
        return [
            'title' => 'Colours / الألوان',
            'summary' => 'نتعلّم أسماء الألوان الأساسية بالإنجليزية ونصف الأشياء بلونها.',
            'objectives' => [
                'أحفظ أسماء الألوان الأساسية.',
                'أكوّن جملة تصف لون الشيء.',
                'أستخدم السؤال What colour?',
            ],
            'video' => LessonSpec::VIDEO,
            'pre' => [
                LessonSpec::mcq('كلمة «أحمر» بالإنجليزية...', ['red', 'blue', 'green', 'yellow'], 0, 'Red = أحمر.'),
                LessonSpec::tf('كلمة «أزرق» بالإنجليزية blue.', true, 'نعم.'),
            ],
            'paragraphs' => [
                LessonSpec::paragraph(
                    'الألوان الأساسية',
                    LessonSpec::body(
                        'نحفظ الألوان: red (أحمر)، blue (أزرق)، green (أخضر)، yellow (أصفر)، black (أسود)، white (أبيض)، orange (برتقالي)، pink (وردي).',
                        ['The sky is blue.', 'The grass is green.', 'The sun is yellow.'],
                        'اربط كل لون بشيء تراه أمامك، مثل السماء الزرقاء.',
                    ),
                    [
                        LessonSpec::mcq('كلمة «أخضر» بالإنجليزية...', ['green', 'red', 'blue', 'black'], 0, 'Green = أخضر.'),
                        LessonSpec::mcq('كلمة «أصفر» بالإنجليزية...', ['yellow', 'white', 'black', 'pink'], 0, 'Yellow = أصفر.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'أصف لون الشيء',
                    LessonSpec::body(
                        'نصف الشيء بلونه: The apple is red، The sky is blue، My bag is black بهيكل: الشيء + is + اللون.',
                        ['The apple is red.', 'The leaf is green.', 'The snow is white.'],
                        'بعد الاسم نضع is ثم اللون.',
                    ),
                    [
                        LessonSpec::mcq('كيف نصف التفاحة الحمراء؟', ['The apple is red.', 'The apple is blue.', 'The apple is green.', 'Apple red is.'], 0, 'The apple is red.'),
                        LessonSpec::mcq('الجملة الصحيحة للسماء الزرقاء...', ['The sky is blue.', 'The sky is green.', 'Sky is the blue.', 'Blue is the sky.'], 0, 'The sky is blue.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'السؤال عن اللون',
                    LessonSpec::body(
                        'نسأل عن اللون بـ What colour is it? (ما لونه؟) والجواب It is red.',
                        ['What colour is the car? → It is blue.', 'What colour is the flower? → It is red.', 'What colour is the cat? → It is black.'],
                        'What colour = أي لون؟',
                    ),
                    [
                        LessonSpec::mcq('السؤال «What colour is it?» يعني...', ['ما لونه؟', 'ما حجمه؟', 'ما اسمه؟', 'ما ثمنه؟'], 0, 'ما لونه؟'),
                        LessonSpec::mcq('لو كانت الزهرة وردية تجيب...', ['It is pink.', 'It is blue.', 'It is black.', 'It is white.'], 0, 'Pink = وردي.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'ألوان قوس قزح',
                    LessonSpec::body(
                        'نتعرف على ألوان قوس قزح بالإنجليزية وتذكّرها بالترتيب، فنرسمه بأقلامنا الملوّنة.',
                        ['red, orange, yellow', 'green, blue, indigo', 'and violet.'],
                        'قوس قزح سبعة ألوان تظهر بعد المطر.',
                    ),
                    [
                        LessonSpec::mcq('أول لون في قوس قزح...', ['red', 'blue', 'green', 'black'], 0, 'يبدأ بـ red (أحمر).'),
                        LessonSpec::tf('اللون الخامس في قوس قزح blue.', true, 'نعم، بعد الأخضر يأتي الأزرق.'),
                    ]
                ),
                LessonSpec::paragraph(
                    'أخلط الألوان',
                    LessonSpec::body(
                        'نتعلم مزج لونين لإنتاج ثالث: red + blue = purple (بنفسجي)، yellow + blue = green (أخضر).',
                        ['Red and blue make purple.', 'Yellow and blue make green.', 'Red and white make pink.'],
                        'التجربة العملية بالألوان أجمل وسيلة للحفظ.',
                    ),
                    [
                        LessonSpec::mcq('مزج الأحمر والأصفر ينتج...', ['orange', 'green', 'purple', 'black'], 0, 'Red + yellow = orange (برتقالي).'),
                        LessonSpec::mcq('مزج الأصفر والأزرق ينتج...', ['green', 'red', 'pink', 'white'], 0, 'Yellow + blue = green.'),
                    ]
                ),
            ],
            'final' => [
                LessonSpec::mcq('كلمة «أزرق» بالإنجليزية...', ['blue', 'red', 'green', 'yellow'], 0, 'Blue.'),
                LessonSpec::mcq('كلمة «أسود» بالإنجليزية...', ['black', 'white', 'pink', 'orange'], 0, 'Black.'),
                LessonSpec::mcq('«The leaf is green» تعني...', ['الورقة خضراء', 'الورقة حمراء', 'الورقة زرقاء', 'الورقة سوداء'], 0, 'الورقة خضراء.'),
                LessonSpec::mcq('للسؤال عن اللون نقول...', ['What colour is it?', 'Who is it?', 'How many?', 'Where is it?'], 0, 'What colour is it?'),
                LessonSpec::mcq('مزج الأزرق والأحمر ينتج...', ['purple', 'orange', 'green', 'brown'], 0, 'Blue + red = purple.'),
            ],
        ];
    }
}