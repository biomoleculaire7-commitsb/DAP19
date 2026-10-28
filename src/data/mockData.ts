import { ParasiteSpeciesInfo, DiagnosticResult, LabConfig } from '../types/parasitology';

export const USER_MODEL_CLASSES: Array<{
  index: number;
  label: string;
  id: string;
}> = [
  { index: 0, label: 'Hookworm egg', id: 'hookworm' },
  { index: 1, label: 'Taenia spp. egg', id: 'taenia' },
  { index: 2, label: 'Ascaris lumbricoides egg', id: 'ascaris' },
  { index: 3, label: 'Trichuris trichiura egg', id: 'trichuris' },
  { index: 4, label: 'Enterobius vermicularis egg', id: 'enterobius' },
  { index: 5, label: 'Strongyloides stercoralis larva', id: 'strongyloides' },
  { index: 6, label: 'Clonorchis sinensis egg', id: 'clonorchis' },
  { index: 7, label: 'Opisthorchis viverrini egg', id: 'opisthorchis' },
  { index: 8, label: 'Fasciola spp. egg', id: 'fasciola' },
  { index: 9, label: 'Schistosoma haematobium egg', id: 'schistosoma_haematobium' },
  { index: 10, label: 'Schistosoma mansoni egg', id: 'schistosoma_mansoni' },
  { index: 11, label: 'Schistosoma japonicum egg', id: 'schistosoma_japonicum' },
  { index: 12, label: 'Paragonimus spp. egg', id: 'paragonimus' },
  { index: 13, label: 'Giardia lamblia cyst', id: 'giardia' },
  { index: 14, label: 'Chilomastix mesnili cyst', id: 'chilomastix' },
  { index: 15, label: 'Entamoeba histolytica/dispar cyst', id: 'entamoeba' },
  { index: 16, label: 'Balantidium coli cyst', id: 'balantidium' },
  { index: 17, label: 'Cryptosporidium spp. oocyst', id: 'cryptosporidium' },
  { index: 18, label: 'Cyclospora cayetanensis oocyst', id: 'cyclospora' },
];

export const PARASITE_SPECIES: Record<string, ParasiteSpeciesInfo> = {
  // 0: "Hookworm egg"
  hookworm: {
    classIndex: 0,
    id: 'hookworm',
    modelLabel: 'Hookworm egg',
    commonName: {
      fr: 'Ankylostome (Œuf)',
      en: 'Hookworm egg',
      ar: 'بيضة الملقوة المعوية (الأنكلستوما)',
    },
    scientificName: 'Ancylostoma duodenale / Necator americanus',
    category: 'nematode',
    typicalSize: '60–75 µm x 36–40 µm',
    shape: 'Oval, thin transparent hyaline shell containing 4–8 blastomeres',
    color: '#059669', // Emerald-600
    description: {
      fr: 'Œuf régulier à coque fine, lisse et transparente laissant voir 4 à 8 blastomères en voie de division.',
      en: 'Oval egg with thin, transparent, colorless shell enclosing segmented ovum at 4-8 cell stage.',
      ar: 'بيضة شفافة بيضاوية رقيقة الجدار تحتوي على كتلة جنينية مقسمة عادة إلى 4-8 قسيمات أريمية.',
    },
    whoThresholds: {
      light: '1 - 1,999 EPG',
      moderate: '2,000 - 3,999 EPG',
      heavy: '≥ 4,000 EPG',
    },
    recommendedTreatment: {
      fr: 'Albendazole 400 mg en prise unique orale + supplémentation en fer si anémie.',
      en: 'Albendazole 400 mg single oral dose + iron supplementation if anemia present.',
      ar: 'ألبيندازول 400 ملغ جرعة فموية واحدة + مكملات الحديد في حال فقر الدم.',
    },
  },

  // 1: "Taenia spp. egg"
  taenia: {
    classIndex: 1,
    id: 'taenia',
    modelLabel: 'Taenia spp. egg',
    commonName: {
      fr: 'Ténia / Solitaire (Œuf embryophore)',
      en: 'Taenia spp. egg',
      ar: 'بيضة الدودة الشريطية (التينيا)',
    },
    scientificName: 'Taenia saginata / Taenia solium',
    category: 'cestode',
    typicalSize: '30–35 µm',
    shape: 'Spherical embryophore with thick radially striated brownish shell and hexacanth embryo',
    color: '#4f46e5', // Indigo-600
    description: {
      fr: 'Embryophore sphérique brun-jaunâtre à coque épaisse striée radialement contenant un embryon à 6 crochets.',
      en: 'Spherical yellowish-brown embryophore with thick radially striated shell enclosing 6-hooklet hexacanth embryo.',
      ar: 'بيضة كروية ذات غلاف سميك مخطط شعاعياً يحتوي على جنين سداسي الأشواك.',
    },
    whoThresholds: {
      light: '1 - 5 per preparation',
      moderate: '6 - 20 per preparation',
      heavy: '> 20 per preparation',
    },
    recommendedTreatment: {
      fr: 'Praziquantel 10 mg/kg en prise unique (ou Niclosamide 2 g à jeun).',
      en: 'Praziquantel 10 mg/kg single dose (or Niclosamide 2 g chewable single dose).',
      ar: 'برازيكوانتيل 10 ملغ/كغ جرعة واحدة (أو نيكلوزاميد 2 غرام على الريق).',
    },
  },

  // 2: "Ascaris lumbricoides egg"
  ascaris: {
    classIndex: 2,
    id: 'ascaris',
    modelLabel: 'Ascaris lumbricoides egg',
    commonName: {
      fr: 'Ascaris lomboïde (Œuf fécondé)',
      en: 'Ascaris lumbricoides egg',
      ar: 'بيضة الصَفَر الخراطيني (الأسكارس)',
    },
    scientificName: 'Ascaris lumbricoides',
    category: 'nematode',
    typicalSize: '45–75 µm x 35–50 µm',
    shape: 'Oval, thick-shelled with coarse mammillated brownish protein coat',
    color: '#0284c7', // Sky-600
    description: {
      fr: 'Œuf fécondé ovalaire à coque épaisse et couche albumineuse mamelonnée brun-doré entourant une masse germinale.',
      en: 'Fertile oval egg with thick shell and golden-brown coarsely mammillated albuminous coat.',
      ar: 'بيضة مخصبة ذات غلاف خارجي متموج سميك بلون بني يحتوي على كتلة خلوية دائرية.',
    },
    whoThresholds: {
      light: '1 - 4,999 EPG (Légère)',
      moderate: '5,000 - 49,999 EPG (Modérée)',
      heavy: '≥ 50,000 EPG (Sévère)',
    },
    recommendedTreatment: {
      fr: 'Albendazole 400 mg en prise unique orale (ou Mébendazole 500 mg dose unique).',
      en: 'Albendazole 400 mg single oral dose (or Mebendazole 500 mg single dose).',
      ar: 'ألبيندازول 400 ملغ جرعة فموية واحدة (أو ميبيندازول 500 ملغ).',
    },
  },

  // 3: "Trichuris trichiura egg"
  trichuris: {
    classIndex: 3,
    id: 'trichuris',
    modelLabel: 'Trichuris trichiura egg',
    commonName: {
      fr: 'Trichocéphale (Œuf en tonneau)',
      en: 'Trichuris trichiura egg',
      ar: 'بيضة السوطية (التريكوريس)',
    },
    scientificName: 'Trichuris trichiura',
    category: 'nematode',
    typicalSize: '50–55 µm x 22–25 µm',
    shape: 'Barrel-shaped (lemon-like) with prominent bipolar mucoid plugs',
    color: '#d97706', // Amber-600
    description: {
      fr: 'Œuf caractéristique en forme de petit tonneau avec deux bouchons muqueux transparents et réfringents aux pôles.',
      en: 'Distinctive barrel-shaped egg with thick bile-stained shell and prominent transparent bipolar plugs.',
      ar: 'بيضة مميزة تشبه البرميل أو الليمونة ذات غلاف سميك وسدادتين مخاطيتين شفافتين عند القطبين.',
    },
    whoThresholds: {
      light: '1 - 999 EPG',
      moderate: '1,000 - 9,999 EPG',
      heavy: '≥ 10,000 EPG',
    },
    recommendedTreatment: {
      fr: 'Mébendazole 100 mg 2 fois par jour pendant 3 jours, ou Albendazole 400 mg/j 3 jours.',
      en: 'Mebendazole 100 mg twice daily for 3 days, or Albendazole 400 mg daily for 3 days.',
      ar: 'ميبيندازول 100 ملغ مرتين يومياً لمدة 3 أيام، أو ألبيندازول 400 ملغ يومياً لمدة 3 أيام.',
    },
  },

  // 4: "Enterobius vermicularis egg"
  enterobius: {
    classIndex: 4,
    id: 'enterobius',
    modelLabel: 'Enterobius vermicularis egg',
    commonName: {
      fr: 'Oxyure (Œuf asymétrique plan-convexe)',
      en: 'Enterobius vermicularis egg',
      ar: 'بيضة السرمية الدويدية (الدودة الدبوسية)',
    },
    scientificName: 'Enterobius vermicularis',
    category: 'nematode',
    typicalSize: '50–60 µm x 20–30 µm',
    shape: 'Asymmetric, planoconvex (D-shaped) egg with double-contoured smooth shell',
    color: '#10b981', // Emerald-500
    description: {
      fr: 'Œuf asymétrique aplati sur une face (en forme de D) à double coque lisse et transparente contenant une larve.',
      en: 'Asymmetrical, planoconvex (D-shaped) colorless egg with smooth double-layered shell containing developed larva.',
      ar: 'بيضة غير متناظرة مسطحة من جانب ومحدبة من الآخر (تشبه D) وجدارها أملس شفاف يحوي يرقة.',
    },
    whoThresholds: {
      light: 'Scotch-test: 1 - 5 eggs',
      moderate: 'Scotch-test: 6 - 20 eggs',
      heavy: 'Scotch-test: > 20 eggs',
    },
    recommendedTreatment: {
      fr: 'Flubendazole 100 mg ou Pyrantel 10 mg/kg dose unique, à renouveler impérativement à J+14.',
      en: 'Pyrantel pamoate 11 mg/kg or Mebendazole 100 mg single dose, repeat in 14 days and treat family.',
      ar: 'فلوبيندازول 100 ملغ أو بيرانتيل 10 ملغ/كغ جرعة واحدة وتكرر حتماً بعد 14 يوماً وعلاج الأسرة.',
    },
  },

  // 5: "Strongyloides stercoralis larva"
  strongyloides: {
    classIndex: 5,
    id: 'strongyloides',
    modelLabel: 'Strongyloides stercoralis larva',
    commonName: {
      fr: 'Anguillule (Larve rhabditoïde)',
      en: 'Strongyloides stercoralis larva',
      ar: 'يرقانة الأسطوانية البرازية (الديدان الخيطية)',
    },
    scientificName: 'Strongyloides stercoralis',
    category: 'nematode',
    typicalSize: '200–250 µm x 15 µm',
    shape: 'Motile rhabditiform larva with short buccal cavity and prominent genital primordium',
    color: '#0d9488', // Teal-600
    description: {
      fr: 'Larve rhabditoïde très mobile à cavité buccale courte et ébauche génitale visible au tiers postérieur.',
      en: 'Active motile rhabditiform L1 larva with short buccal canal and prominent posterior genital primordium.',
      ar: 'يرقة حركية نشطة في البراز ذات تجويف فموي قصير وبرعم تناسلي مميز في الثلث الخلفي.',
    },
    whoThresholds: {
      light: '1 - 2 larvae / preparation',
      moderate: '3 - 10 larvae / preparation',
      heavy: '> 10 larvae (Risk of hyperinfection)',
    },
    recommendedTreatment: {
      fr: 'Ivermectine 200 µg/kg en prise unique orale (2 jours si immunodéprimé).',
      en: 'Ivermectin 200 µg/kg single oral dose (2 consecutive days in immunocompromised).',
      ar: 'إيفرمكتين 200 ميكروغرام/كغ جرعة فموية واحدة (يومان متتاليان لدى مضعفي المناعة).',
    },
  },

  // 6: "Clonorchis sinensis egg"
  clonorchis: {
    classIndex: 6,
    id: 'clonorchis',
    modelLabel: 'Clonorchis sinensis egg',
    commonName: {
      fr: 'Petite douve de Chine (Œuf en fiole operculé)',
      en: 'Clonorchis sinensis egg',
      ar: 'بيضة الدودة الكبدية الصينية (كلونوركيس)',
    },
    scientificName: 'Clonorchis sinensis',
    category: 'trematode',
    typicalSize: '27–35 µm x 12–19 µm',
    shape: 'Small, pitcher-shaped yellowish-brown egg with opercular shoulders and small abopercular knob',
    color: '#b45309', // Amber-700
    description: {
      fr: 'Petit œuf en forme d\'urne avec opercule bien visible sur deux épaulements et petit bouton au pôle opposé.',
      en: 'Small flask-shaped egg with distinct operculum resting on shoulders and tiny knob at abopercular end.',
      ar: 'بيضة صغيرة كالجرة لها غطاء قطبي يرتكز على حافتين بارزتين ونتوء صغير عند القطب المقابل.',
    },
    whoThresholds: {
      light: '1 - 999 EPG',
      moderate: '1,000 - 9,999 EPG',
      heavy: '≥ 10,000 EPG',
    },
    recommendedTreatment: {
      fr: 'Praziquantel 25 mg/kg 3 fois par jour pendant 2 jours consécutifs.',
      en: 'Praziquantel 25 mg/kg three times daily for 2 consecutive days.',
      ar: 'برازيكوانتيل 25 ملغ/كغ 3 مرات يومياً لمدة يومين متتاليين.',
    },
  },

  // 7: "Opisthorchis viverrini egg"
  opisthorchis: {
    classIndex: 7,
    id: 'opisthorchis',
    modelLabel: 'Opisthorchis viverrini egg',
    commonName: {
      fr: 'Douve d\'Asie du Sud-Est (Œuf)',
      en: 'Opisthorchis viverrini egg',
      ar: 'بيضة متوارقة فيفريني (أوبيستوركيس)',
    },
    scientificName: 'Opisthorchis viverrini',
    category: 'trematode',
    typicalSize: '22–32 µm x 11–17 µm',
    shape: 'Oval to pyriform operculated egg, slightly narrower than Clonorchis with delicate shell pattern',
    color: '#9a3412', // Amber-800
    description: {
      fr: 'Douve biliaire liée au cholangiocarcinome. Œuf très semblable à Clonorchis mais légèrement plus effilé à coquille réticulée fine.',
      en: 'Biliary fluke endemic in Southeast Asia linked to cholangiocarcinoma. Small operculated egg with slight seated collar.',
      ar: 'دودة القنوات الصفراوية في جنوب شرق آسيا. بيضة صغيرة ذات غطاء تشبه كلونوركيس مع نتوء خلفي دقيق.',
    },
    whoThresholds: {
      light: '1 - 999 EPG',
      moderate: '1,000 - 9,999 EPG',
      heavy: '≥ 10,000 EPG',
    },
    recommendedTreatment: {
      fr: 'Praziquantel 25 mg/kg 3 fois par jour pendant 2 jours (ou 40 mg/kg dose unique).',
      en: 'Praziquantel 25 mg/kg three times daily for 2 days (or 40 mg/kg single dose).',
      ar: 'برازيكوانتيل 25 ملغ/كغ 3 مرات يومياً لمدة يومين متتاليين.',
    },
  },

  // 8: "Fasciola spp. egg"
  fasciola: {
    classIndex: 8,
    id: 'fasciola',
    modelLabel: 'Fasciola spp. egg',
    commonName: {
      fr: 'Grande douve du foie (Œuf operculé géant)',
      en: 'Fasciola spp. egg',
      ar: 'بيضة الدودة الكبدية الكبيرة (فاشيولا)',
    },
    scientificName: 'Fasciola hepatica / Fasciola gigantica',
    category: 'trematode',
    typicalSize: '130–150 µm x 60–90 µm',
    shape: 'Huge, golden-brown ellipsoidal operculated unembryonated egg',
    color: '#ca8a04', // Yellow-600
    description: {
      fr: 'Très grand œuf ovale jaune-brun operculé à son pôle antérieur contenant une masse vitelline non segmentée.',
      en: 'Huge operculated golden-brown ellipsoidal unsegmented egg with distinct operculum.',
      ar: 'بيضة عملاقة بيضاوية بلون ذهبي بني لها غطاء قطبي واضح عند أحد طرفيها وتحوي كتلة غير منقسمة.',
    },
    whoThresholds: {
      light: '1 - 99 EPG',
      moderate: '100 - 399 EPG',
      heavy: '≥ 400 EPG',
    },
    recommendedTreatment: {
      fr: 'Triclabendazole 10 mg/kg dose unique orale après repas riche en graisses (Praziquantel inefficace).',
      en: 'Triclabendazole 10 mg/kg single oral dose with fatty food (Praziquantel ineffective).',
      ar: 'تريكلابندازول 10 ملغ/كغ جرعة فموية واحدة مع طعام دسم (برازيكوانتيل غير فعال هنا).',
    },
  },

  // 9: "Schistosoma haematobium egg"
  schistosoma_haematobium: {
    classIndex: 9,
    id: 'schistosoma_haematobium',
    modelLabel: 'Schistosoma haematobium egg',
    commonName: {
      fr: 'Schistosome vésical (Œuf à éperon terminal)',
      en: 'Schistosoma haematobium egg',
      ar: 'بيضة البلهارسيا البولية (شوكة طرفية)',
    },
    scientificName: 'Schistosoma haematobium',
    category: 'trematode',
    typicalSize: '110–170 µm x 40–70 µm',
    shape: 'Large oval egg with characteristic straight sharp terminal spine',
    color: '#be123c', // Rose-700
    description: {
      fr: 'Grand œuf allongé transparent retrouvé dans le culot urinaire, pourvu d\'un éperon terminal rectiligne aigu.',
      en: 'Large transparent egg in urine sediment bearing a prominent straight terminal spine at posterior pole.',
      ar: 'بيضة كبيرة شفافة في الراسب البولي ذات شوكة طرفية حادة ومستقيمة عند النهاية القطبية.',
    },
    whoThresholds: {
      light: '< 50 eggs / 10 mL urine',
      moderate: '50 - 400 eggs / 10 mL',
      heavy: '> 400 eggs / 10 mL',
    },
    recommendedTreatment: {
      fr: 'Praziquantel 40 mg/kg en dose unique par voie orale.',
      en: 'Praziquantel 40 mg/kg single oral dose.',
      ar: 'برازيكوانتيل 40 ملغ/كغ جرعة فموية واحدة.',
    },
  },

  // 10: "Schistosoma mansoni egg"
  schistosoma_mansoni: {
    classIndex: 10,
    id: 'schistosoma_mansoni',
    modelLabel: 'Schistosoma mansoni egg',
    commonName: {
      fr: 'Schistosome intestinal (Œuf à éperon latéral)',
      en: 'Schistosoma mansoni egg',
      ar: 'بيضة البلهارسيا المنسونية (شوكة جانبية)',
    },
    scientificName: 'Schistosoma mansoni',
    category: 'trematode',
    typicalSize: '115–175 µm x 45–70 µm',
    shape: 'Large, elongated oval with prominent sharp lateral spine',
    color: '#e11d48', // Rose-600
    description: {
      fr: 'Très grand œuf allongé jaune-brun pourvu d\'un volumineux éperon latéral acéré caractéristique.',
      en: 'Large elongated yellowish egg with a distinct, sharp lateral spine near posterior end.',
      ar: 'بيضة كبيرة مستطيلة تتميز بوجود شوكة جانبية حادة وبارزة قرب القطب الخلفي.',
    },
    whoThresholds: {
      light: '1 - 99 EPG',
      moderate: '100 - 399 EPG',
      heavy: '≥ 400 EPG',
    },
    recommendedTreatment: {
      fr: 'Praziquantel 40 mg/kg en dose unique par voie orale.',
      en: 'Praziquantel 40 mg/kg single oral dose.',
      ar: 'برازيكوانتيل 40 ملغ/كغ جرعة فموية واحدة.',
    },
  },

  // 11: "Schistosoma japonicum egg"
  schistosoma_japonicum: {
    classIndex: 11,
    id: 'schistosoma_japonicum',
    modelLabel: 'Schistosoma japonicum egg',
    commonName: {
      fr: 'Schistosome oriental (Œuf arrondi à petit nodule)',
      en: 'Schistosoma japonicum egg',
      ar: 'بيضة البلهارسيا اليابانية (نتوء جانبي صغير)',
    },
    scientificName: 'Schistosoma japonicum',
    category: 'trematode',
    typicalSize: '70–100 µm x 55–65 µm',
    shape: 'Rounder oval egg with a small, inconspicuous rudimentary lateral spine/knob',
    color: '#c026d3', // Fuchsia-600
    description: {
      fr: 'Œuf plus petit et plus arrondi que S. mansoni, présentant un petit nodule (éperon rudimentaire) latéral discret.',
      en: 'Rounder oval egg with a very small rudimentary lateral knob/hooklet often obscured by debris.',
      ar: 'بيضة أكثر استدارة وأصغر من منسوني، لها نتوء جانبي صغير غير بارز قد يختفي تحت الرواسب.',
    },
    whoThresholds: {
      light: '1 - 99 EPG',
      moderate: '100 - 399 EPG',
      heavy: '≥ 400 EPG',
    },
    recommendedTreatment: {
      fr: 'Praziquantel 60 mg/kg fractionné en 2 à 3 prises sur 1 journée.',
      en: 'Praziquantel 60 mg/kg split in 2 to 3 doses over 1 day.',
      ar: 'برازيكوانتيل 60 ملغ/كغ مقسمة على جرعتين إلى 3 جرعات في يوم واحد.',
    },
  },

  // 12: "Paragonimus spp. egg"
  paragonimus: {
    classIndex: 12,
    id: 'paragonimus',
    modelLabel: 'Paragonimus spp. egg',
    commonName: {
      fr: 'Douve du poumon (Œuf operculé asymétrique)',
      en: 'Paragonimus spp. egg',
      ar: 'بيضة دودة الرئة (باراغونيموس)',
    },
    scientificName: 'Paragonimus westermani / Paragonimus spp.',
    category: 'trematode',
    typicalSize: '80–120 µm x 45–70 µm',
    shape: 'Oval, golden-brown operculated egg with thickened abopercular shell collar',
    color: '#b45309', // Amber-700
    description: {
      fr: 'Douve pulmonaire (crustacés d\'eau douce). Œuf jaune-brun operculé retrouvé dans les crachats ou les selles avec épaississement de la coque à l\'opposé.',
      en: 'Lung fluke egg found in sputum or stool. Oval golden-brown egg with flat operculum and distinct abopercular shell thickening.',
      ar: 'دودة الرئة المنتقلة عبر القشريات. بيضة بيضاوية ذات غطاء مسطح تظهر في القشع أو البراز مع تسمك الغلاف المقابل.',
    },
    whoThresholds: {
      light: '1 - 5 per slide',
      moderate: '6 - 20 per slide',
      heavy: '> 20 per slide',
    },
    recommendedTreatment: {
      fr: 'Praziquantel 25 mg/kg 3 fois par jour pendant 2 à 3 jours.',
      en: 'Praziquantel 25 mg/kg three times daily for 2 to 3 days.',
      ar: 'برازيكوانتيل 25 ملغ/كغ 3 مرات يومياً لمدة 2-3 أيام.',
    },
  },

  // 13: "Giardia lamblia cyst"
  giardia: {
    classIndex: 13,
    id: 'giardia',
    modelLabel: 'Giardia lamblia cyst',
    commonName: {
      fr: 'Giardia duodenalis (Kyste ovalaire)',
      en: 'Giardia lamblia cyst',
      ar: 'كيسة الجيارديا اللمبلية',
    },
    scientificName: 'Giardia lamblia / duodenalis',
    category: 'flagellate',
    typicalSize: '8–14 µm x 7–10 µm',
    shape: 'Oval cyst with smooth refractile wall, 2–4 nuclei, curved parabasal bodies and central axostyle',
    color: '#7c3aed', // Violet-600
    description: {
      fr: 'Kyste ovalaire à paroi lisse et réfringente contenant 2 à 4 noyaux et les vestiges des flagelles (axostyle).',
      en: 'Oval cyst with smooth refractive wall, containing 2 to 4 nuclei, central axostyle and curved fibrils.',
      ar: 'كيسة بيضاوية ذات جدار أملس محدد تحوي 2-4 نوى وخيوط أكسونية مركزية منحنية.',
    },
    whoThresholds: {
      light: 'Rare (< 2 per field)',
      moderate: 'Moderate (2 - 10 per field)',
      heavy: 'Abundant (> 10 per field)',
    },
    recommendedTreatment: {
      fr: 'Métronidazole 500 mg 3 fois/j pendant 5 à 7 jours ou Tinidazole 2 g prise unique.',
      en: 'Metronidazole 500 mg TID for 5-7 days or Tinidazole 2 g single oral dose.',
      ar: 'ميترونيدازول 500 ملغ 3 مرات يومياً لمدة 5-7 أيام أو تينيدازول 2 غرام جرعة واحدة.',
    },
  },

  // 14: "Chilomastix mesnili cyst"
  chilomastix: {
    classIndex: 14,
    id: 'chilomastix',
    modelLabel: 'Chilomastix mesnili cyst',
    commonName: {
      fr: 'Chilomastix mesnili (Kyste en forme de poire/citron)',
      en: 'Chilomastix mesnili cyst',
      ar: 'كيسة الكيلوماستيكس (شكل الكمثرى أو الليمونة)',
    },
    scientificName: 'Chilomastix mesnili',
    category: 'flagellate',
    typicalSize: '6–10 µm x 4–6 µm',
    shape: 'Characteristic lemon-shaped or pear-shaped cyst with a distinct anterior protuberance (nipple)',
    color: '#6366f1', // Indigo-500
    description: {
      fr: 'Protozoaire non-pathogène mais marqueur fécal. Kyste piriforme en forme de poire ou de citron avec un petit mamelon antérieur et une fente cytostomique.',
      en: 'Non-pathogenic flagellate marker of fecal contamination. Lemon/pear-shaped cyst with anterior nipple-like knob and prominent cytostome.',
      ar: 'طفيلي سوطي معوي يشير لتلوث برازي. كيسة كمثرية أو ليمونية الشكل مع بروز حلمي أمامي وانبعاج فموي واضح.',
    },
    whoThresholds: {
      light: '< 2 per field',
      moderate: '2 - 10 per field',
      heavy: '> 10 per field',
    },
    recommendedTreatment: {
      fr: 'Commensal non pathogène : aucun traitement requis (recherche d\'autre étiologie si symptômes).',
      en: 'Non-pathogenic commensal: no specific therapy indicated.',
      ar: 'طفيلي معايش غير ممرض لا يتطلب علاجاً نوعياً ويشير لتناول ماء أو طعام ملوث.',
    },
  },

  // 15: "Entamoeba histolytica/dispar cyst"
  entamoeba: {
    classIndex: 15,
    id: 'entamoeba',
    modelLabel: 'Entamoeba histolytica/dispar cyst',
    commonName: {
      fr: 'Amibe dysentérique (Kyste E. histolytica/dispar)',
      en: 'Entamoeba histolytica/dispar cyst',
      ar: 'كيسة المتحولة الحالة للنسج (الأميبا)',
    },
    scientificName: 'Entamoeba histolytica / Entamoeba dispar',
    category: 'amoeba',
    typicalSize: '10–15 µm',
    shape: 'Spherical cyst containing 1–4 round nuclei with central punctate karyosome and blunt chromatoid bars',
    color: '#ea580c', // Orange-600
    description: {
      fr: 'Kyste sphérique à 1 à 4 noyaux à caryosome punctiforme central et corps sidérophiles à bouts arrondis en cigare.',
      en: 'Spherical cyst with 1-4 nuclei, central punctate karyosome, and blunt cigar-shaped chromatoid bars.',
      ar: 'كيسة كروية تحوي 1-4 نوى بنواة مركزية وأجسام كروما تويدية سيجارية الشكل ذات نهايات مدورة.',
    },
    whoThresholds: {
      light: 'Occasional (< 1/field)',
      moderate: '1 - 5 per field',
      heavy: '> 5 per field',
    },
    recommendedTreatment: {
      fr: 'Métronidazole 500–750 mg 3 fois/j pendant 7 à 10 jours + agent de contact (Paromomycine).',
      en: 'Metronidazole 500-750 mg TID for 7-10 days followed by luminal Paromomycin.',
      ar: 'ميترونيدازول 500-750 ملغ 3 مرات يومياً لمدة 7-10 أيام متبوعاً ببارومومايسين.',
    },
  },

  // 16: "Balantidium coli cyst"
  balantidium: {
    classIndex: 16,
    id: 'balantidium',
    modelLabel: 'Balantidium coli cyst',
    commonName: {
      fr: 'Balantidium (Kyste géant à macronoyau en haricot)',
      en: 'Balantidium coli cyst',
      ar: 'كيسة القربية القولونية (بلانتيديوم كولاي)',
    },
    scientificName: 'Balantidium coli / Balantioides coli',
    category: 'ciliate',
    typicalSize: '50–70 µm',
    shape: 'Very large spherical cyst with double wall and prominent bean/kidney-shaped macronucleus',
    color: '#047857', // Emerald-700
    description: {
      fr: 'Plus grand protozoaire de l\'homme. Kyste volumineux reconnaissable à son grand macronoyau en forme de haricot ou de rein.',
      en: 'Largest human intestinal protozoan. Huge spherical cyst with double-layered wall and large kidney-shaped macronucleus.',
      ar: 'أكبر طفيلي أولي معوي لدى الإنسان. كيسة كروية عملاقة ذات جدار مزدوج ونواة كبيرة بارزة تشبه حبة الكلى.',
    },
    whoThresholds: {
      light: '1 - 2 per preparation',
      moderate: '3 - 8 per preparation',
      heavy: '> 8 per preparation',
    },
    recommendedTreatment: {
      fr: 'Tétracycline 500 mg 4 fois/j pendant 10 jours ou Métronidazole 750 mg 3 fois/j pendant 5 jours.',
      en: 'Tetracycline 500 mg QID for 10 days or Metronidazole 750 mg TID for 5 days.',
      ar: 'تتراسيكلين 500 ملغ 4 مرات يومياً لمدة 10 أيام أو ميترونيدازول 750 ملغ 3 مرات يومياً.',
    },
  },

  // 17: "Cryptosporidium spp. oocyst"
  cryptosporidium: {
    classIndex: 17,
    id: 'cryptosporidium',
    modelLabel: 'Cryptosporidium spp. oocyst',
    commonName: {
      fr: 'Cryptosporidie (Oocyste acido-alcoolo-résistant)',
      en: 'Cryptosporidium spp. oocyst',
      ar: 'خبيئة الأبواغ (كريبتوسبوريديوم)',
    },
    scientificName: 'Cryptosporidium parvum / hominis',
    category: 'coccidia',
    typicalSize: '4–6 µm',
    shape: 'Tiny, spherical to subspherical oocyst, brightly acid-fast (fuchsia-red) on modified Ziehl-Neelsen',
    color: '#f43f5e', // Rose-500
    description: {
      fr: 'Très petit oocyste rond acido-résistant (rouge fuchsia sur fond vert/bleu au Ziehl-Neelsen) responsable de diarrhées sévères chez l\'immunodéprimé.',
      en: 'Tiny spherical oocyst staining bright red on modified acid-fast stain; major opportunist in immunocompromised.',
      ar: 'كيسة بوغية كروية صغيرة جداً تصطبغ بلون أحمر فاقع صامد للحمض تسبب إسهالاً مائياً خطيراً لدى مضعفي المناعة.',
    },
    whoThresholds: {
      light: '< 1 per field (100x)',
      moderate: '1 - 10 per field (100x)',
      heavy: '> 10 per field (100x)',
    },
    recommendedTreatment: {
      fr: 'Nitazoxanide 500 mg 2 fois par jour pendant 3 jours + réhydratation intensive.',
      en: 'Nitazoxanide 500 mg twice daily for 3 days + fluid replacement.',
      ar: 'نيتازوكزانيد 500 ملغ مرتين يومياً لمدة 3 أيام + تعويض سوائل مكثف.',
    },
  },

  // 18: "Cyclospora cayetanensis oocyst"
  cyclospora: {
    classIndex: 18,
    id: 'cyclospora',
    modelLabel: 'Cyclospora cayetanensis oocyst',
    commonName: {
      fr: 'Cyclospora (Oocyste autofluorescent)',
      en: 'Cyclospora cayetanensis oocyst',
      ar: 'حلقية الأبواغ (سايكلوسبورا كاييتاننسيس)',
    },
    scientificName: 'Cyclospora cayetanensis',
    category: 'coccidia',
    typicalSize: '8–10 µm',
    shape: 'Spherical oocyst, twice the diameter of Cryptosporidium, exhibiting blue-green autofluorescence under UV (365 nm)',
    color: '#ec4899', // Pink-500
    description: {
      fr: 'Oocyste sphérique mesurant 8-10 µm (double de Cryptosporidium) à autofluorescence bleue sous UV.',
      en: 'Spherical oocyst double the size of Cryptosporidium with blue-green autofluorescence under UV light.',
      ar: 'كيسة كروية تماثل ضعف قطر كريبتوسبوريديوم وتتألق بضوء أزرق مخضر تحت الأشعة فوق البنفسجية.',
    },
    whoThresholds: {
      light: '1 - 2 per slide',
      moderate: '3 - 10 per slide',
      heavy: '> 10 per slide',
    },
    recommendedTreatment: {
      fr: 'Triméthoprime-Sulfaméthoxazole (TMP-SMX) 160/800 mg 2 fois/j pendant 7 à 10 jours.',
      en: 'Trimethoprim-sulfamethoxazole (TMP-SMX) 160/800 mg twice daily for 7 to 10 days.',
      ar: 'تريميثوبريم-سلفاميثوكسازول (كو-تريموكسازول) مرتين يومياً لمدة 7-10 أيام.',
    },
  },
};



export const SAMPLE_SLIDES = [
  {
    id: 'sample-ascaris-01',
    title: {
      fr: 'Échantillon A : Ascaris lumbricoides (Frottis fécal)',
      en: 'Slide A: Ascaris lumbricoides (Stool preparation)',
      ar: 'العينة (أ): الصَفَر الخراطيني - أسكارس (عينة براز)',
    },
    imageSrc: '/src/assets/images/microscope_ascaris_sample_1793197983320.jpg',
    magnification: '40x',
    staining: 'Examen direct au sérum physiologique (Wet Mount)',
    primarySpecies: 'ascaris',
    detections: [],
    severity: 'negative' as const,
    estimatedEPG: 0,
  },
  {
    id: 'sample-trichuris-02',
    title: {
      fr: 'Échantillon B : Trichuris trichiura (Œuf en tonneau)',
      en: 'Slide B: Trichuris trichiura (Whipworm egg)',
      ar: 'العينة (ب): بيضة السوطية تريكوريس (شكل البرميل)',
    },
    imageSrc: '/src/assets/images/microscope_trichuris_sample_1793197983729.jpg',
    magnification: '40x',
    staining: 'Préparation microscopique Kato-Katz',
    primarySpecies: 'trichuris',
    detections: [],
    severity: 'negative' as const,
    estimatedEPG: 0,
  },
  {
    id: 'sample-mixed-03',
    title: {
      fr: 'Échantillon C : Co-infection Ankylostome & Giardia',
      en: 'Slide C: Hookworm & Giardia lamblia Co-infection',
      ar: 'العينة (ج): تحضير مجهري متعدد الطفيليات',
    },
    imageSrc: '/src/assets/images/microscope_mixed_parasites_1793197983888.jpg',
    magnification: '40x / 400x total',
    staining: 'Frottis fécal coloré au Lugol iodé',
    primarySpecies: 'hookworm',
    detections: [],
    severity: 'negative' as const,
    estimatedEPG: 0,
  },
];

export const INITIAL_PATIENT_RECORDS: DiagnosticResult[] = [
  {
    id: 'RES-2026-0891',
    patient: {
      id: 'PAT-4402',
      fileNumber: 'IPP-893041',
      fullName: 'Jean-Marc Dubois',
      age: 38,
      gender: 'M',
      sampleId: 'TUBE-8841-A',
      sampleType: 'stool',
      collectionDate: '2026-10-27 08:30',
      examinationDate: '2026-10-28 09:15',
      department: 'Gastro-entérologie / Consultation Externe',
      prescribingDoctor: 'Dr. Éric Lambert (MD)',
      clinicalNotes: 'Retour de zone tropicale. Diarrhée intermittente et asthénie.',
    },
    imageSrc: '/src/assets/images/microscope_ascaris_sample_1793197983320.jpg',
    detections: [],
    detectionDate: '2026-10-28 09:18',
    totalParasitesFound: 0,
    speciesCounts: {},
    primaryFinding: 'En attente d\'analyse ONNX réelle',
    infectionSeverity: 'negative',
    estimatedEPG: 0,
    status: 'pending',
    biologistNotes: 'Échantillon enregistré, prêt pour passage au modèle ONNX exp.onnx.',
    validatedBy: 'Dr. Thomas Morel (Biologiste Médical)',
    validationTimestamp: '2026-10-28 09:25',
  },
  {
    id: 'RES-2026-0890',
    patient: {
      id: 'PAT-4401',
      fileNumber: 'IPP-893035',
      fullName: 'Amina Benali',
      age: 26,
      gender: 'F',
      sampleId: 'TUBE-8839-C',
      sampleType: 'stool',
      collectionDate: '2026-10-27 11:20',
      examinationDate: '2026-10-28 08:45',
      department: 'Médecine Interne & Infectiologie',
      prescribingDoctor: 'Pr. Claire Delorme (PUPH)',
      clinicalNotes: 'Bilan de douleurs abdominales chroniques.',
    },
    imageSrc: '/src/assets/images/microscope_trichuris_sample_1793197983729.jpg',
    detections: [],
    detectionDate: '2026-10-28 08:52',
    totalParasitesFound: 0,
    speciesCounts: {},
    primaryFinding: 'En attente d\'analyse ONNX réelle',
    infectionSeverity: 'negative',
    estimatedEPG: 0,
    status: 'pending',
    biologistNotes: 'Échantillon enregistré, prêt pour passage au modèle ONNX exp.onnx.',
    validatedBy: 'Dr. Thomas Morel (Biologiste Médical)',
    validationTimestamp: '2026-10-28 09:00',
  },
];

export const DEFAULT_LAB_CONFIG: LabConfig = {
  centerName: 'CENTRE MÉDICAL UNIVERSITAIRE & BIOLOGIE',
  hospitalName: 'Hôpital Universitaire Saint-Antoine / Pôle Biologie Médicale',
  departmentName: 'Laboratoire Central de Parasitologie & Mycologie Clinique',
  address: '184 Rue du Faubourg Saint-Antoine, 75012 Paris, France',
  phone: '+33 (0)1 49 28 20 00',
  email: 'laboratoire.parasito@chu-paris.aphp.fr',
  accreditationNumber: 'ISO 15189 v2022 · Accréditation COFRAC N° 8-3921',
  defaultBiologist: 'Dr. Thomas Morel, MD, PhD',
  defaultRole: 'Médecin Biologiste · Chef d\'Unité Parasitologie',
  confidenceThreshold: 0.85,
  iouThreshold: 0.45,
  selectedModel: 'ONNX-MicrobeNet-v2.4-DeepClinical',
  activeCameraId: 'usb-cmount-optics-4k',
};
