/**
 * Islamic Values — Seed Definitions
 * ------------------------------------------------------------------
 * This is the HAND-EDITABLE source of truth for the "Islamic Values"
 * (القيم الإسلامية) feature. It contains NO hadith text.
 *
 * Each value declares:
 *   - id, nameAr, nameEn, descAr (1-2 plain Arabic sentences, reviewable)
 *   - iconKey (maps to a line-icon in the frontend), accent (glow color)
 *   - keywords  : Arabic roots/terms matched against hadith text
 *   - phrases   : stronger multi-word expressions (higher weight)
 *   - chapters  : English substrings matched against the dataset's book/chapter (bab) titles
 *   - curatedIds: well-known hadith IDs (source:number) you can add by hand
 *
 * `npm run build:values` reads this (or the existing config/values.json to
 * preserve your edits), resolves `hadithIds` + `count` ONLY from the local
 * Sahih al-Bukhari / Sahih Muslim dataset, validates them, and writes
 * config/values.json. The AI is never used to pick or write hadith text.
 */

export const VALUES_SCHEMA_VERSION = 1;

// Mandatory scholarly note shown under every value section (never AI-generated).
export const REFERENCE_NOTE = 'النص العربي للحديث هو المرجع، والترجمة آلية للتقريب';

export const VALUE_DEFINITIONS = [
  {
    id: 'sidq', nameAr: 'الصدق', nameEn: 'Truthfulness', iconKey: 'truth', accent: '#D4AF6A',
    descAr: 'الصدق مطابقة القول للفعل والقلب، وهو خُلُق الأنبياء وباب البر. يهدي الصدق إلى الطمأنينة وحسن العاقبة.',
    keywords: ['صدق', 'صادق', 'كذب', 'كاذب'],
    phrases: ['عليكم بالصدق', 'إن الصدق يهدي', 'لا يزال الرجل يصدق', 'الصادقين'],
    chapters: [],
    curatedIds: ['bukhari:6094', 'muslim:6639']
  },
  {
    id: 'amanah', nameAr: 'الأمانة', nameEn: 'Trustworthiness', iconKey: 'shield', accent: '#1FBF9A',
    descAr: 'الأمانة أداء الحقوق إلى أصحابها والصدق في القول والعمل. هي أساس الإيمان وعلامة كمال المرء.',
    keywords: ['أمانة', 'أمين', 'مؤتمن', 'خائن', 'خيانة', 'ائتمن'],
    phrases: ['أد الأمانة', 'خائن الأمانة', 'لا إيمان لمن لا أمانة له', 'المؤتمن'],
    chapters: [],
    curatedIds: []
  },
  {
    id: 'rahmah', nameAr: 'الرحمة', nameEn: 'Mercy', iconKey: 'heart', accent: '#E4A0A0',
    descAr: 'الرحمة رقة القلب وإرادة الخير للخلق. أمر النبي صلى الله عليه وسلم بالرحمة واللين بين الناس.',
    keywords: ['رحم', 'راحم', 'رحيم', 'يرحم', 'مرحوم'],
    phrases: ['الراحمون يرحمهم', 'من لا يرحم الناس', 'ارحموا من في الأرض', 'أرحم'],
    chapters: [],
    curatedIds: ['bukhari:6013', 'bukhari:7377']
  },
  {
    id: 'sabr', nameAr: 'الصبر', nameEn: 'Patience', iconKey: 'anchor', accent: '#8FB6D4',
    descAr: 'الصبر حبس النفس عن الجزع عند المكروه، والثبات على الطاعة. هو نور وعون للمؤمن في أمره كله.',
    keywords: ['صبر', 'صابر', 'يصبر', 'احتساب', 'صابرين'],
    phrases: ['الصبر', 'ما من مسلم', 'إنما الصبر', 'واصبر', 'صابرين'],
    chapters: [],
    curatedIds: ['bukhari:1469']
  },
  {
    id: 'haya', nameAr: 'الحياء', nameEn: 'Modesty', iconKey: 'moon', accent: '#C7A8D8',
    descAr: 'الحياء خلق يمنع من القبيح ويحث على الجميل. هو شعبة من شعب الإيمان وخير لا يأتي إلا بخير.',
    keywords: ['حياء', 'يستحي', 'محيي'],
    phrases: ['الحياء لا يأتي إلا بخير', 'الحياء شعبة', 'إذا لم تستح'],
    chapters: [],
    curatedIds: ['bukhari:6117', 'bukhari:3483']
  },
  {
    id: 'akhlaq', nameAr: 'حسن الخلق', nameEn: 'Good Character', iconKey: 'star', accent: '#D4C07A',
    descAr: 'حسن الخلق بذل المعروف وكف الأذى وطلاقة الوجه. هو أثقل ما يوضع في الميزان يوم القيامة.',
    keywords: ['خلق', 'أدب', 'بر', 'مكارم', 'خيرة'],
    phrases: ['مكارم الأخلاق', 'أكمل المؤمنين', 'حسن الخلق', 'إنما بعثتم'],
    chapters: [],
    curatedIds: ['bukhari:8']
  },
  {
    id: 'parents', nameAr: 'بر الوالدين', nameEn: 'Kindness to Parents', iconKey: 'hands', accent: '#D4A06A',
    descAr: 'بر الوالدين الإحسان إليهما وقول القول الكريم لهما والرفق بهما. هو من أحب الأعمال إلى الله.',
    keywords: ['والد', 'والدين', 'والديك', 'أمك', 'أبك', 'بر'],
    phrases: ['بر الوالدين', 'والديك', 'أمك ثم أمك', 'فلا تقل لهما أف', 'الوالدين'],
    chapters: [],
    curatedIds: ['bukhari:2782', 'bukhari:5971']
  },
  {
    id: 'rahim', nameAr: 'صلة الرحم', nameEn: 'Maintaining Kinship', iconKey: 'link', accent: '#7FBF9A',
    descAr: 'صلة الرحم الإحسان إلى الأقارب ومقابلتهم بالبر والوصل. قطعها حرمان من البركة في الرزق والعمر.',
    keywords: ['رحم', 'أرحام', 'قرابة', 'رحمه', 'وصل', 'قطع'],
    phrases: ['صلة الرحم', 'الرحم معلقة', 'من كان يؤمن بالله واليوم الآخر فيكرم', 'أرحامه'],
    chapters: [],
    curatedIds: ['bukhari:5988', 'muslim:2555']
  },
  {
    id: 'neighbor', nameAr: 'الإحسان إلى الجار', nameEn: 'Kindness to Neighbors', iconKey: 'home', accent: '#B6A87F',
    descAr: 'الإحسان إلى الجار إيصال الخير إليه وكف الأذى عنه واحتمال ما يقع منه. ما زال جبريل يوصي بالجار.',
    keywords: ['جار', 'جوار', 'جاره', 'الجار', 'جواره'],
    phrases: ['ما زال جبريل يوصيني بالجار', 'يكرم جاره', 'خير الجيران', 'لا يؤذي جاره'],
    chapters: [],
    curatedIds: ['bukhari:6015', 'bukhari:6018']
  },
  {
    id: 'adl', nameAr: 'العدل', nameEn: 'Justice', iconKey: 'scale', accent: '#9FB6C7',
    descAr: 'العدل إنصاف الناس وأداء الحقوق وأمر القسط بينهم. الله يأمر بالعدل ويحب المقسطين.',
    keywords: ['عدل', 'عادل', 'مقسط', 'ظلم', 'جائر', 'قسط'],
    phrases: ['اعدلوا', 'إن الله يأمر بالعدل', 'المقسطون', 'أمر بالعدل'],
    chapters: [],
    curatedIds: ['bukhari:2449']
  },
  {
    id: 'tawadu', nameAr: 'التواضع', nameEn: 'Humility', iconKey: 'leaf', accent: '#8FBF8F',
    descAr: 'التواضع خفض الجناح للناس وترك الكبر والاختيال. من تواضع لله رفعه الله.',
    keywords: ['تواضع', 'متواضع', 'تكبر', 'اختيال', 'نخوة', 'يضع'],
    phrases: ['ما نقصت صدقة', 'تواضع', 'من تواضع', 'الكبر'],
    chapters: [],
    curatedIds: ['muslim:6592']
  },
  {
    id: 'karam', nameAr: 'الكرم والجود', nameEn: 'Generosity', iconKey: 'gift', accent: '#D4B86A',
    descAr: 'الكرم والجود بذل الخير للمحتاجين طيبةً به النفس. كان النبي صلى الله عليه أجود ما يكون.',
    keywords: ['كرم', 'جود', 'سخاء', 'ضيف', 'ضيافة', 'صدقة', 'يعطي', 'أجود'],
    phrases: ['أجود', 'يكرم ضيفه', 'الضيف', 'ما من يوم'],
    chapters: [],
    curatedIds: ['bukhari:6019', 'bukhari:3554']
  },
  {
    id: 'ikhlas', nameAr: 'الإخلاص والنية', nameEn: 'Sincerity & Intention', iconKey: 'flame', accent: '#E0A86A',
    descAr: 'الإخلاص أن يقصد العبد بعمله وجه الله وحده. وإنما الأعمال بالنيات، ولكل امرئ ما نوى.',
    keywords: ['إخلاص', 'نية', 'نيات', 'مخلص', 'يبتغي', 'احتسب'],
    phrases: ['إنما الأعمال بالنيات', 'الإخلاص', 'الله وحده', 'ما نوى'],
    chapters: [],
    curatedIds: ['bukhari:1']
  },
  {
    id: 'shukr', nameAr: 'الشكر', nameEn: 'Gratitude', iconKey: 'sun', accent: '#D4C86A',
    descAr: 'الشكر الاعتراف بالنعمة وإضافتها إلى المنعم، والقيام بشكر الله على الرزق والعافية. من شكر زاداه الله.',
    keywords: ['شكر', 'شاكر', 'يشكر', 'يكفر', 'الحمد'],
    phrases: ['شكر', 'من صنع إليكم', 'يكفر', 'الشكور'],
    chapters: [],
    curatedIds: []
  },
  {
    id: 'tawakkul', nameAr: 'التوكل', nameEn: 'Reliance on Allah', iconKey: 'compass', accent: '#7FA8BF',
    descAr: 'التوكل اعتماد القلب على الله مع الأخذ بالأسباب. من توكل على الله كفاه ووصل إلى خيري الدنيا والآخرة.',
    keywords: ['توكل', 'متوكل', 'وكيل', 'يكفي', 'حسبي'],
    phrases: ['لو أنكم تتوكلون', 'حسبنا الله', 'ومن يتوكل على الله', 'يكفيه'],
    chapters: [],
    curatedIds: []
  },
  {
    id: 'afw', nameAr: 'العفو والتسامح', nameEn: 'Pardon & Forbearance', iconKey: 'dove', accent: '#A8C0B6',
    descAr: 'العفو ترك المؤاخذة مع القدرة عليها، والتسامح صفاء الصدر بين المسلمين. من عفا وأصلح فأجره على الله.',
    keywords: ['عفو', 'يعفو', 'عفا', 'تسامح', 'صفح', 'يعفون'],
    phrases: ['يعفو عن كثير', 'فاعفوا', 'والعافين', 'أن تعفوا'],
    chapters: [],
    curatedIds: []
  },
  {
    id: 'hilm', nameAr: 'الحلم وكظم الغيظ', nameEn: 'Forbearance', iconKey: 'wave', accent: '#8FB0A8',
    descAr: 'الحلم ضبط النفس عند الغضب وكظم ما في الصدر. ليس الشديد بالصرعة إنما الشديد الذي يملك نفسه عند الغضب.',
    keywords: ['حلم', 'حليم', 'غيظ', 'كظم', 'غضب', 'يملك'],
    phrases: ['كظم الغيظ', 'ليس الشديد بالصرعة', 'من كظم', 'الكاظمين'],
    chapters: [],
    curatedIds: ['bukhari:6114']
  },
  {
    id: 'ihsan-nas', nameAr: 'الإحسان إلى الناس', nameEn: 'Doing Good to People', iconKey: 'people', accent: '#C7B68F',
    descAr: 'الإحسان إلى الناس فعل المعروف وكف الأذى عنهم ومعاملتهم بالحسنى. اتق الله حيثما كنت وأحسن إلى من بين يديك.',
    keywords: ['إحسان', 'يحسن', 'معروف', 'خيرا', 'يظلم', 'ناس'],
    phrases: ['اعمل المعروف', 'أحسن', 'وإحسان', 'فليقل خيرا'],
    chapters: [],
    curatedIds: ['bukhari:6018', 'muslim:2564']
  },
  {
    id: 'salam', nameAr: 'إفشاء السلام', nameEn: 'Spreading Peace', iconKey: 'chat', accent: '#7FBFA8',
    descAr: 'إفشاء السلام بذل التحية للمسلمين وإطعام الطعام وطيب الكلام. سبب للمحبة ودخول الجنة.',
    keywords: ['سلام', 'تسلم', 'تحية', 'تفشوا', 'افشوا'],
    phrases: ['أفشوا السلام', 'تفشوا السلام', 'السلام عليكم', 'طبت', 'وعليكم'],
    chapters: [],
    curatedIds: ['muslim:194']
  },
  {
    id: 'nasihah', nameAr: 'النصيحة', nameEn: 'Sincere Advice', iconKey: 'bell', accent: '#D4A88F',
    descAr: 'النصيحة إرادة الخير للمسلمين وبيان الحق لهم برفق. الدين النصيحة لله ولكتابه ولرسوله ولعامة المسلمين.',
    keywords: ['نصح', 'نصيحة', 'ناصح', 'ينصح', 'يخون'],
    phrases: ['الدين النصيحة', 'النصيحة لله', 'نصحت', 'ينصح لهذه'],
    chapters: [],
    curatedIds: ['muslim:196']
  },
  {
    id: 'wafa', nameAr: 'الوفاء بالعهد', nameEn: 'Fulfilling Promises', iconKey: 'knot', accent: '#B69F7F',
    descAr: 'الوفاء بالعهد لزوم الصدق في العقود والالتزام بما قطعه المرء على نفسه. للمغدر لواء يوم القيامة.',
    keywords: ['وفاء', 'عهد', 'ذمة', 'ميثاق', 'غدر', 'مغدر', 'أمانته'],
    phrases: ['لا إيمان لمن لا أمانة', 'للمغدر', 'العهد', 'وإذا عاهد', 'أوفى'],
    chapters: [],
    curatedIds: []
  },
  {
    id: 'ilm', nameAr: 'طلب العلم', nameEn: 'Seeking Knowledge', iconKey: 'book', accent: '#8FA8D4',
    descAr: 'طلب العلم تفقه في الدين وتعلم ما ينفع. من سلك طريقا يلتمس فيه علما سهله الله به إلى الجنة.',
    keywords: ['علم', 'يتعلم', 'عالم', 'يفقه', 'يدر', 'فقه'],
    phrases: ['طلب العلم', 'من سلك طريقا', 'يسهل', 'خيركم من تعلم', 'العلماء'],
    chapters: ['Knowledge', 'Learning'],
    curatedIds: ['bukhari:100', 'muslim:6853']
  },
  {
    id: 'lisan', nameAr: 'حفظ اللسان', nameEn: 'Guarding the Tongue', iconKey: 'mute', accent: '#C7A8A8',
    descAr: 'حفظ اللسان كف الأذى عن الناس وقول الخير أو الصمت. من كان يؤمن بالله واليوم الآخر فليقل خيرا أو ليصمت.',
    keywords: ['لسان', 'ينطق', 'كلام', 'يغتاب', 'مصانعة', 'يقول'],
    phrases: ['فليقل خيرا أو ليصمت', 'على لسانه', 'يحفظ', 'كثرة'],
    chapters: [],
    curatedIds: ['bukhari:6018']
  },
  {
    id: 'rifq', nameAr: 'الرفق', nameEn: 'Gentleness', iconKey: 'feather', accent: '#A8C7A8',
    descAr: 'الرفق لين الجانب وترك العنف، وما كان الرفق في شيء إلا زانه. من يُحرم الرفق يُحرم الخير.',
    keywords: ['رفق', 'يرفق', 'رفيق', 'لين', 'عنف', 'الرفق'],
    phrases: ['ما كان الرفق', 'إن الرفق', 'يخلع', 'أهل الرفق', 'من يحرم'],
    chapters: [],
    curatedIds: []
  },
  {
    id: 'ukhuwwah', nameAr: 'الأخوة والمحبة في الله', nameEn: 'Brotherhood in Allah', iconKey: 'hearts', accent: '#D49F9F',
    descAr: 'الأخوة في الله أن يحب المؤمن لأخيه ما يحب لنفسه، ويتحابّوا ويتراحموا كالجسد الواحد.',
    keywords: ['أخ', 'أخوة', 'محبة', 'يحب', 'تحاب', 'متحاب', 'جسد'],
    phrases: ['لا يؤمن أحدكم حتى يحب', 'المؤمنون إخوة', 'توادوا', 'مثل المؤمنين', 'تحابوا'],
    chapters: [],
    curatedIds: ['bukhari:13', 'muslim:2586']
  },
  {
    id: 'taharah', nameAr: 'النظافة والطهارة', nameEn: 'Purity & Cleanliness', iconKey: 'drop', accent: '#7FBFD4',
    descAr: 'الطهارة نظافة البدن والثوب والمكان، وهي شطر الإيمان ومفتاح الصلاة. أمر الله بالالتزام بالطهارة والتنظف.',
    keywords: ['طهارة', 'طهور', 'وضوء', 'نظافة', 'يغتسل', 'غسل', 'تيمم'],
    phrases: ['الطهور شطر', 'مفتاح الصلاة', 'تنظفوا', 'الوضوء', 'التيمم'],
    chapters: ['Ablutions', 'Bathing', 'Menstrual', 'Tayammum', 'Wudu', 'Ghusl'],
    curatedIds: ['bukhari:160']
  },
  {
    id: 'itqan', nameAr: 'الإتقان في العمل', nameEn: 'Excellence in Work', iconKey: 'gem', accent: '#B6C77F',
    descAr: 'الإتقان إحكام العمل وإجادة صناعته وإتمامه على الوجه الأكمل. إن الله يحب إذا عمل أحدكم عملا أن يتقنه.',
    keywords: ['إتقان', 'يتقن', 'أحكم', 'أحسن', 'عمل', 'صنعة'],
    phrases: ['أن يتقنه', 'إن الله يحب إذا عمل', 'أحكمه', 'إتقان'],
    chapters: [],
    curatedIds: []
  },
  {
    id: 'duafa', nameAr: 'الإحسان إلى الضعفاء واليتامى', nameEn: 'Care for the Vulnerable', iconKey: 'care', accent: '#C7A8B6',
    descAr: 'الإحسان إلى الضعفاء واليتامى والمساكين كفالتهم والرحمة بهم وإيصال الحق إليهم. هل تُنصرون وتُرزقون إلا بضعفائكم.',
    keywords: ['يتيم', 'مسكين', 'ضعيف', 'عاجز', 'أرملة', 'سائل', 'كافل', 'محتاج'],
    phrases: ['الكافل اليتيم', 'أنا وكافل', 'الضعفاء', 'لا تنه', 'ارحم', 'السائل'],
    chapters: [],
    curatedIds: ['bukhari:5304']
  }
];

export default VALUE_DEFINITIONS;
