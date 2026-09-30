// Farm Intelligence utility: Soil questions, Soil mapping, Crop rules, Weather, and Daily Plan

export const ENGLISH_SOIL_QUESTIONS = [
  {
    id: 'colour',
    title: 'What color is your farm soil?',
    subtitle: 'Look at the dry top soil in your field',
    options: [
      { id: 'black', label: 'Deep Black / Dark Grey', icon: '🌑' },
      { id: 'red', label: 'Reddish / Brown-Red', icon: '🔴' },
      { id: 'yellow_brown', label: 'Light Brown / Yellowish', icon: '🟡' },
      { id: 'pale_grey', label: 'Pale Grey / Sandy White', icon: '⚪' },
    ],
  },
  {
    id: 'waterHolding',
    title: 'How does your soil hold water after rain?',
    subtitle: 'Observe how long puddles and wet mud stay',
    options: [
      { id: 'very_high', label: 'Holds water for days / sticky mud', icon: '💧💧💧' },
      { id: 'moderate', label: 'Moist for 2-3 days without flooding', icon: '💧💧' },
      { id: 'low', label: 'Dries within a day', icon: '💧' },
      { id: 'very_low', label: 'Drains instantly / dries immediately', icon: '🏜️' },
    ],
  },
  {
    id: 'texture',
    title: 'How does the soil feel between your fingers?',
    subtitle: 'Take a small pinch of damp soil and rub it',
    options: [
      { id: 'clay', label: 'Sticky and clayey like pottery dough', icon: '🏺' },
      { id: 'loam', label: 'Soft, crumbly, and balanced', icon: '🌾' },
      { id: 'sandy', label: 'Rough and gritty like sand', icon: '🏖️' },
      { id: 'silt', label: 'Smooth and silky like flour', icon: '🌪️' },
    ],
  },
  {
    id: 'cracks',
    title: 'Does your soil crack open in dry summer?',
    subtitle: 'Check field surface when rain has stopped for weeks',
    options: [
      { id: 'deep_wide', label: 'Deep and wide fissures open up', icon: '⚡' },
      { id: 'medium', label: 'Fine small hairline cracks', icon: '〰️' },
      { id: 'crust', label: 'Hard surface crust forms', icon: '🧱' },
      { id: 'none', label: 'No cracks at all, remains loose powder', icon: '🍃' },
    ],
  },
  {
    id: 'cropsBefore',
    title: 'Which crops grew best on this land previously?',
    subtitle: 'Select the group that yielded well recently',
    options: [
      { id: 'cotton_soybean', label: 'Cotton, Soybean, or Sugarcane', icon: '☁️' },
      { id: 'groundnut_millets', label: 'Groundnut, Millets, or Pulses', icon: '🥜' },
      { id: 'paddy_wheat', label: 'Paddy (Rice), Vegetables, or Wheat', icon: '🍚' },
      { id: 'maize_mustard', label: 'Maize, Mustard, or Potato', icon: '🌽' },
    ],
  },
];

// Fallback high-quality translations for key Indian languages
export const STATIC_SOIL_TRANSLATIONS = {
  ta: [
    {
      id: 'colour',
      title: 'உங்கள் நிலத்தின் மண் என்ன நிறம்?',
      subtitle: 'வயலின் காய்ந்த மேல் மண்ணைப் பாருங்கள்',
      options: [
        { id: 'black', label: 'நல்ல கருப்பு / அடர் சாம்பல்', icon: '🌑' },
        { id: 'red', label: 'செம்மண் / சிவப்பு பழுப்பு', icon: '🔴' },
        { id: 'yellow_brown', label: 'மஞ்சள் கலந்த பழுப்பு', icon: '🟡' },
        { id: 'pale_grey', label: 'வெளிர் சாம்பல் / மணல் நிறம்', icon: '⚪' },
      ],
    },
    {
      id: 'waterHolding',
      title: 'மழைக்கு பின் தண்ணீர் எப்படி நிற்கிறது?',
      subtitle: 'ஈரப்பதம் எத்தனை நாட்கள் தங்குகிறது',
      options: [
        { id: 'very_high', label: 'பல நாட்கள் ஈரமாக இருக்கும் / பிசுபிசுப்பு', icon: '💧💧💧' },
        { id: 'moderate', label: '2-3 நாட்கள் நல்ல ஈரப்பதம் இருக்கும்', icon: '💧💧' },
        { id: 'low', label: 'ஒரு நாளில் காய்ந்துவிடும்', icon: '💧' },
        { id: 'very_low', label: 'உடனடியாக வடிந்துவிடும்', icon: '🏜️' },
      ],
    },
    {
      id: 'texture',
      title: 'கைகளில் தொட்டுப் பார்த்தால் மண் எப்படி உள்ளது?',
      subtitle: 'ஈர மண்ணை விரல்களால் தேய்த்துப் பாருங்கள்',
      options: [
        { id: 'clay', label: 'களிமண் போல ஒட்டும் தன்மை', icon: '🏺' },
        { id: 'loam', label: 'பொலபொலவென்று மிருதுவான மண்', icon: '🌾' },
        { id: 'sandy', label: 'மணல் போன்ற கரடுமுரடான துகள்கள்', icon: '🏖️' },
        { id: 'silt', label: 'மாவு போன்ற மிருதுவான வண்டல்', icon: '🌪️' },
      ],
    },
    {
      id: 'cracks',
      title: 'கோடையில் நிலத்தில் வெடிப்பு ஏற்படுகிறதா?',
      subtitle: 'மழை இல்லாத போது நிலத்தின் நிலையை கவனியுங்கள்',
      options: [
        { id: 'deep_wide', label: 'ஆழமான பெரிய வெடிப்புகள் விழும்', icon: '⚡' },
        { id: 'medium', label: 'சிறிய மெல்லிய கீறல்கள் மட்டும்', icon: '〰️' },
        { id: 'crust', label: 'மேல் பரப்பு கெட்டியாக ஓடு படியும்', icon: '🧱' },
        { id: 'none', label: 'வெடிப்பு எதுவும் இல்லை, தூளாக இருக்கும்', icon: '🍃' },
      ],
    },
    {
      id: 'cropsBefore',
      title: 'இதற்கு முன் எந்த பயிர் நன்றாக விளைந்தது?',
      subtitle: 'உங்கள் வயலில் நல்ல மகசூல் கொடுத்த பயிரை தேர்ந்தெடுக்கவும்',
      options: [
        { id: 'cotton_soybean', label: 'பருத்தி, சோயா அல்லது கரும்பு', icon: '☁️' },
        { id: 'groundnut_millets', label: 'நிலக்கடலை, சிறுதானியங்கள், பயறு', icon: '🥜' },
        { id: 'paddy_wheat', label: 'நெல், காய்கறிகள் அல்லது கோதுமை', icon: '🍚' },
        { id: 'maize_mustard', label: 'மக்காச்சோளம் அல்லது உருளை', icon: '🌽' },
      ],
    },
  ],
  hi: [
    {
      id: 'colour',
      title: 'आपके खेत की मिट्टी का रंग कैसा है?',
      subtitle: 'खेत की सूखी ऊपरी मिट्टी को देखें',
      options: [
        { id: 'black', label: 'गहरी काली / गहरी स्लेटी', icon: '🌑' },
        { id: 'red', label: 'लाल / भूरी-लाल मिट्टी', icon: '🔴' },
        { id: 'yellow_brown', label: 'हल्की भूरी / पीली मिट्टी', icon: '🟡' },
        { id: 'pale_grey', label: 'धूसर / रेतीली सफेद', icon: '⚪' },
      ],
    },
    {
      id: 'waterHolding',
      title: 'बारिश के बाद मिट्टी में पानी कितना टिकता है?',
      subtitle: 'खेत में नमी कितने दिन रहती है',
      options: [
        { id: 'very_high', label: 'कई दिनों तक चिपचिपा पानी भरा रहता है', icon: '💧💧💧' },
        { id: 'moderate', label: '2-3 दिन तक अच्छी नमी बनी रहती है', icon: '💧💧' },
        { id: 'low', label: '1 दिन में सूख जाती है', icon: '💧' },
        { id: 'very_low', label: 'पानी तुरंत बह जाता है / सूख जाता है', icon: '🏜️' },
      ],
    },
    {
      id: 'texture',
      title: 'हाथ में मसलने पर मिट्टी कैसी महसूस होती है?',
      subtitle: 'गीली मिट्टी को उंगलियों से रगड़कर देखें',
      options: [
        { id: 'clay', label: 'चिकनी और गूंथे आटे जैसी चिपचिपी', icon: '🏺' },
        { id: 'loam', label: 'भुरभुरी, मुलायम और उपजाऊ', icon: '🌾' },
        { id: 'sandy', label: 'रेत जैसी खुरदुरी दानेदार', icon: '🏖️' },
        { id: 'silt', label: 'बारीक मैदे जैसी रेशमी', icon: '🌪️' },
      ],
    },
    {
      id: 'cracks',
      title: 'गर्मी के मौसम में मिट्टी में दरारें पड़ती हैं?',
      subtitle: 'सूखे के समय खेत की सतह देखें',
      options: [
        { id: 'deep_wide', label: 'गहरी और चौड़ी दरारें पड़ जाती हैं', icon: '⚡' },
        { id: 'medium', label: 'छोटी बारीक दरारें', icon: '〰️' },
        { id: 'crust', label: 'ऊपरी परत पर पपड़ी जम जाती है', icon: '🧱' },
        { id: 'none', label: 'बिल्कुल दरार नहीं, धूल जैसी खुली रहती है', icon: '🍃' },
      ],
    },
    {
      id: 'cropsBefore',
      title: 'पहले इस खेत में कौन सी फसल सबसे अच्छी हुई थी?',
      subtitle: 'पिछली अच्छी पैदावार वाली फसल चुनें',
      options: [
        { id: 'cotton_soybean', label: 'कपास, सोयाबीन या गन्ना', icon: '☁️' },
        { id: 'groundnut_millets', label: 'मूंगफली, बाजरा या दालें', icon: '🥜' },
        { id: 'paddy_wheat', label: 'धान, गेहूं या सब्जियां', icon: '🍚' },
        { id: 'maize_mustard', label: 'मक्का, सरसों या आलू', icon: '🌽' },
      ],
    },
  ],
  te: [
    {
      id: 'colour',
      title: 'మీ పొలం మట్టి రంగు ఏమిటి?',
      subtitle: 'పొలంలోని ఎండిన పై మట్టిని పరిశీలించండి',
      options: [
        { id: 'black', label: 'నల్లటి / ముదురు బూడిద', icon: '🌑' },
        { id: 'red', label: 'ఎర్రటి / గోధుమ-ఎరుపు', icon: '🔴' },
        { id: 'yellow_brown', label: 'లేత గోధుమ / పసుపు రంగు', icon: '🟡' },
        { id: 'pale_grey', label: 'లేత బూడిద / ఇసుక తెలుపు', icon: '⚪' },
      ],
    },
    {
      id: 'waterHolding',
      title: 'వర్షం తర్వాత నీరు ఎలా నిలుస్తుంది?',
      subtitle: 'తేమ ఎన్ని రోజులు నిలిచి ఉంటుంది',
      options: [
        { id: 'very_high', label: 'చాలా రోజులు నీరు నిలుస్తుంది / జిగట మట్టి', icon: '💧💧💧' },
        { id: 'moderate', label: '2-3 రోజులు తేమగా ఉంటుంది', icon: '💧💧' },
        { id: 'low', label: 'ఒక రోజులో ఆరిపోతుంది', icon: '💧' },
        { id: 'very_low', label: 'వెంటనే ఇంకిపోతుంది / ఎండిపోతుంది', icon: '🏜️' },
      ],
    },
    {
      id: 'texture',
      title: 'చేతితో తాకినప్పుడు మట్టి ఎలా అనిపిస్తుంది?',
      subtitle: 'తడి మట్టిని వేళ్ళతో రుద్ది చూడండి',
      options: [
        { id: 'clay', label: 'జిగురుగా మరియు బంకమట్టిలా ఉంటుంది', icon: '🏺' },
        { id: 'loam', label: 'మెత్తగా, తేలికగా మరియు సమతుల్యంగా', icon: '🌾' },
        { id: 'sandy', label: 'ఇసుకలా గరుకుగా ఉంటుంది', icon: '🏖️' },
        { id: 'silt', label: 'పిండిలా చాలా మెత్తగా ఉంటుంది', icon: '🌪️' },
      ],
    },
    {
      id: 'cracks',
      title: 'వేసవిలో నేలలో పగుళ్లు వస్తాయా?',
      subtitle: 'వర్షాలు లేనప్పుడు నేల ఉపరితలాన్ని చూడండి',
      options: [
        { id: 'deep_wide', label: 'లోతైన మరియు వెడల్పాటి పగుళ్లు ఏర్పడతాయి', icon: '⚡' },
        { id: 'medium', label: 'సన్నని చిన్న పగుళ్లు', icon: '〰️' },
        { id: 'crust', label: 'పై పొర గట్టిగా మారుతుంది', icon: '🧱' },
        { id: 'none', label: 'పగుళ్లు ఏమీ ఉండవు, పొడిగా ఉంటుంది', icon: '🍃' },
      ],
    },
    {
      id: 'cropsBefore',
      title: 'గతంలో ఈ నేలలో ఏ పంటలు బాగా పండాయి?',
      subtitle: 'గతంలో మంచి దిగుబడి ఇచ్చిన పంటల సమూహాన్ని ఎంచుకోండి',
      options: [
        { id: 'cotton_soybean', label: 'పత్తి, సోయాబీన్ లేదా చెరకు', icon: '☁️' },
        { id: 'groundnut_millets', label: 'వేరుశనగ, చిరుధాన్యాలు లేదా పప్పులు', icon: '🥜' },
        { id: 'paddy_wheat', label: 'వరి, కూరగాయలు లేదా గోధుమలు', icon: '🍚' },
        { id: 'maize_mustard', label: 'మొక్కజొన్న, ఆవాలు లేదా బంగాళాదుంప', icon: '🌽' },
      ],
    },
  ],
  kn: [
    {
      id: 'colour',
      title: 'ನಿಮ್ಮ ಜಮೀನಿನ ಮಣ್ಣಿನ ಬಣ್ಣ ಯಾವುದು?',
      subtitle: 'ಹೊಲದ ಒಣಗಿದ ಮೇಲ್ಮಣ್ಣನ್ನು ಗಮನಿಸಿ',
      options: [
        { id: 'black', label: 'ಕಡು ಕಪ್ಪು / ಗಾಢ ಬೂದು', icon: '🌑' },
        { id: 'red', label: 'ಕೆಂಪು / ಕಂದು-ಕೆಂಪು', icon: '🔴' },
        { id: 'yellow_brown', label: 'ತಿಳಿ ಕಂದು / ಹಳದಿ ಮಿಶ್ರಿತ', icon: '🟡' },
        { id: 'pale_grey', label: 'ತಿಳಿ ಬೂದು / ಮರಳು ಮಿಶ್ರಿತ ಬಿಳಿ', icon: '⚪' },
      ],
    },
    {
      id: 'waterHolding',
      title: 'ಮಳೆಯ ನಂತರ ಮಣ್ಣಿನಲ್ಲಿ ನೀರು ಹೇಗೆ ನಿಲ್ಲುತ್ತದೆ?',
      subtitle: 'ತೇವಾಂಶ ಎಷ್ಟು ದಿನ ಉಳಿಯುತ್ತದೆ ಎಂದು ನೋಡಿ',
      options: [
        { id: 'very_high', label: 'ಹಲವು ದಿನಗಳವರೆಗೆ ನೀರು ನಿಲ್ಲುತ್ತದೆ / ಜಿಗುಟು ಕೆಸರು', icon: '💧💧💧' },
        { id: 'moderate', label: '2-3 ದಿನಗಳವರೆಗೆ ತೇವಾಂಶ ಇರುತ್ತದೆ', icon: '💧💧' },
        { id: 'low', label: 'ಒಂದು ದಿನದಲ್ಲಿ ಒಣಗುತ್ತದೆ', icon: '💧' },
        { id: 'very_low', label: 'ತಕ್ಷಣವೇ ಇಂಗಿ ಒಣಗುತ್ತದೆ', icon: '🏜️' },
      ],
    },
    {
      id: 'texture',
      title: 'ಬೆರಳುಗಳಿಂದ ಮುಟ್ಟಿದಾಗ ಮಣ್ಣು ಹೇಗನಿಸುತ್ತದೆ?',
      subtitle: 'ತೇವವಾದ ಮಣ್ಣನ್ನು ಬೆರಳುಗಳಿಂದ ತಿಕ್ಕಿ ನೋಡಿ',
      options: [
        { id: 'clay', label: 'ಜಿಗುಟಾದ ಜೇಡಿಮಣ್ಣಿನಂತೆ', icon: '🏺' },
        { id: 'loam', label: 'ಮೃದುವಾದ ಮತ್ತು ಫಲವತ್ತಾದ', icon: '🌾' },
        { id: 'sandy', label: 'ಮರಳಿನಂತೆ ಒರಟು', icon: '🏖️' },
        { id: 'silt', label: 'ಹಿಟ್ಟಿನಂತೆ ನುಣುಪಾದ', icon: '🌪️' },
      ],
    },
    {
      id: 'cracks',
      title: 'ಬೇಸಿಗೆಯಲ್ಲಿ ನೆಲದಲ್ಲಿ ಬಿರುಕುಗಳು ಬೀಳುತ್ತವೆಯೇ?',
      subtitle: 'ಮಳೆಯಿಲ್ಲದ ದಿನಗಳಲ್ಲಿ ಜಮೀನಿನ ಮೇಲ್ಮೈ ಗಮನಿಸಿ',
      options: [
        { id: 'deep_wide', label: 'ಆಳವಾದ ಮತ್ತು ಅಗಲವಾದ ಬಿರುಕುಗಳು', icon: '⚡' },
        { id: 'medium', label: 'ಸಣ್ಣ ತೆಳುವಾದ ಬಿರುಕುಗಳು', icon: '〰️' },
        { id: 'crust', label: 'ಮೇಲ್ಮೈ ಗಟ್ಟಿಯಾಗಿ ಹೆಪ್ಪುಗಟ್ಟುತ್ತದೆ', icon: '🧱' },
        { id: 'none', label: 'ಯಾವುದೇ ಬಿರುಕುಗಳಿಲ್ಲ', icon: '🍃' },
      ],
    },
    {
      id: 'cropsBefore',
      title: 'ಹಿಂದೆ ಈ ಜಮೀನಿನಲ್ಲಿ ಯಾವ ಬೆಳೆಗಳು ಚೆನ್ನಾಗಿ ಬೆಳೆದಿದ್ದವು?',
      subtitle: 'ಉತ್ತಮ ಇಳುವರಿ ನೀಡಿದ ಬೆಳೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      options: [
        { id: 'cotton_soybean', label: 'ಹತ್ತಿ, ಸೋಯಾಬೀನ್ ಅಥವಾ ಕಬ್ಬು', icon: '☁️' },
        { id: 'groundnut_millets', label: 'ಕಡಲೆಕಾಯಿ, ಸಿರಿಧಾನ್ಯಗಳು ಅಥವಾ ಬೇಳೆಕಾಳುಗಳು', icon: '🥜' },
        { id: 'paddy_wheat', label: 'ಭತ್ತ, ತರಕಾರಿಗಳು ಅಥವಾ ಗೋಧಿ', icon: '🍚' },
        { id: 'maize_mustard', label: 'ಮೆಕ್ಕೆಜೋಳ, ಸಾಸಿವೆ ಅಥವಾ ಆಲೂಗಡ್ಡೆ', icon: '🌽' },
      ],
    },
  ],
  ml: [
    {
      id: 'colour',
      title: 'നിങ്ങളുടെ കൃഷിഭൂമിയിലെ മണ്ണ് ഏത് നിറമാണ്?',
      subtitle: 'ഉണങ്ങിയ ഉപരിതല മണ്ണ് പരിശോധിക്കുക',
      options: [
        { id: 'black', label: 'കറുപ്പ് / കടും ചാരനിറം', icon: '🌑' },
        { id: 'red', label: 'ചുവപ്പ് / തവിട്ട്-ചുവപ്പ്', icon: '🔴' },
        { id: 'yellow_brown', label: 'ഇളം തവിട്ട് / മഞ്ഞ കലർന്നത്', icon: '🟡' },
        { id: 'pale_grey', label: 'ഇളം ചാരനിറം / മണൽ കലർന്ന വെളുപ്പ്', icon: '⚪' },
      ],
    },
    {
      id: 'waterHolding',
      title: 'മഴയ്ക്ക് ശേഷം വെള്ളം എങ്ങനെ നിൽക്കുന്നു?',
      subtitle: 'ഈർപ്പം എത്ര ദിവസം നിൽക്കുന്നു എന്ന് ശ്രദ്ധിക്കുക',
      options: [
        { id: 'very_high', label: 'ദിവസങ്ങളോളം വെള്ളം കെട്ടിനിൽക്കും / പശിമയുള്ള ചെളി', icon: '💧💧💧' },
        { id: 'moderate', label: '2-3 ദിവസം ഈർപ്പം നിലനിൽക്കും', icon: '💧💧' },
        { id: 'low', label: 'ഒരു ദിവസം കൊണ്ട് ഉണങ്ങും', icon: '💧' },
        { id: 'very_low', label: 'ഉടൻ തന്നെ വാർന്നുപോകും', icon: '🏜️' },
      ],
    },
    {
      id: 'texture',
      title: 'വിരലുകളിൽ തൊടുമ്പോൾ മണ്ണിന് എന്ത് തോന്നുന്നു?',
      subtitle: 'നനഞ്ഞ മണ്ണ് വിരലുകൊണ്ട് തിരുമ്മി നോക്കുക',
      options: [
        { id: 'clay', label: 'പശിമയുള്ള കളിമണ്ണ് പോലെ', icon: '🏺' },
        { id: 'loam', label: 'മൃദുവായതും ഫലഭൂയിഷ്ഠമായതും', icon: '🌾' },
        { id: 'sandy', label: 'മണൽ പോലെ പരുക്കൻ', icon: '🏖️' },
        { id: 'silt', label: 'പൊടി പോലെ മിനുസമാർന്നത്', icon: '🌪️' },
      ],
    },
    {
      id: 'cracks',
      title: 'വേനൽക്കാലത്ത് മണ്ണിൽ വിള്ളലുകൾ ഉണ്ടാകാറുണ്ടോ?',
      subtitle: 'മഴയില്ലാത്ത സമയത്തെ നിലം നിരീക്ഷിക്കുക',
      options: [
        { id: 'deep_wide', label: 'ആഴത്തിലുള്ള വലിയ വിള്ളലുകൾ', icon: '⚡' },
        { id: 'medium', label: 'ചെറിയ നേർത്ത വിള്ളലുകൾ', icon: '〰️' },
        { id: 'crust', label: 'മുകൾഭാഗം കട്ടിയുള്ള പാടയായി മാറുന്നു', icon: '🧱' },
        { id: 'none', label: 'വിള്ളലുകൾ ഇല്ല', icon: '🍃' },
      ],
    },
    {
      id: 'cropsBefore',
      title: 'മുമ്പ് ഈ ഭൂമിയിൽ ഏത് വിളകളാണ് നന്നായി വളർന്നത്?',
      subtitle: 'നല്ല വിളവ് തന്ന വിളകൾ തിരഞ്ഞെടുക്കുക',
      options: [
        { id: 'cotton_soybean', label: 'പരുത്തി, സോയാബീൻ അല്ലെങ്കിൽ കരിമ്പ്', icon: '☁️' },
        { id: 'groundnut_millets', label: 'നിലക്കടല, ചെറുധാന്യങ്ങൾ അല്ലെങ്കിൽ പയർവർഗ്ഗങ്ങൾ', icon: '🥜' },
        { id: 'paddy_wheat', label: 'നെല്ല്, പച്ചക്കറികൾ അല്ലെങ്കിൽ ഗോതമ്പ്', icon: '🍚' },
        { id: 'maize_mustard', label: 'മക്കച്ചോളം, കടുക് അല്ലെങ്കിൽ ഉരുളക്കിഴങ്ങ്', icon: '🌽' },
      ],
    },
  ],
  mr: [
    {
      id: 'colour',
      title: 'तुमच्या शेतातील मातीचा रंग कसा आहे?',
      subtitle: 'शेतातील वरची कोरडी माती पहा',
      options: [
        { id: 'black', label: 'गडद काळी / करडी', icon: '🌑' },
        { id: 'red', label: 'लालसर / तपकिरी-लाल', icon: '🔴' },
        { id: 'yellow_brown', label: 'हलकी तपकिरी / पिवळसर', icon: '🟡' },
        { id: 'pale_grey', label: 'फिकट करडी / वालुकामय पांढरी', icon: '⚪' },
      ],
    },
    {
      id: 'waterHolding',
      title: 'पावसानंतर मातीत पाणी किती वेळ टिकते?',
      subtitle: 'जमिनीत ओलावा किती दिवस राहतो',
      options: [
        { id: 'very_high', label: 'अनेक दिवस पाणी साचून राहते / चिकट चिखल', icon: '💧💧💧' },
        { id: 'moderate', label: '२-३ दिवस चांगला ओलावा राहतो', icon: '💧💧' },
        { id: 'low', label: 'एका दिवसात सुकते', icon: '💧' },
        { id: 'very_low', label: 'लगेच वाहून जाते / सुकते', icon: '🏜️' },
      ],
    },
    {
      id: 'texture',
      title: 'बोटांनी चोळल्यावर माती कशी वाटते?',
      subtitle: 'ओली माती बोटांनी चोळून पहा',
      options: [
        { id: 'clay', label: 'चिकट आणि मळलेल्या पिठासारखी', icon: '🏺' },
        { id: 'loam', label: 'मऊ, भुसभुशीत आणि सुपीक', icon: '🌾' },
        { id: 'sandy', label: 'वाळूसारखी खडबडीत', icon: '🏖️' },
        { id: 'silt', label: 'मैद्यासारखी मऊ रेशमी', icon: '🌪️' },
      ],
    },
    {
      id: 'cracks',
      title: 'उन्हाळ्यात जमिनीत भेगा पडतात का?',
      subtitle: 'कोरड्या दिवसांत जमिनीची स्थिती पहा',
      options: [
        { id: 'deep_wide', label: 'खोल आणि रुंद भेगा पडतात', icon: '⚡' },
        { id: 'medium', label: 'बारीक लहान भेगा', icon: '〰️' },
        { id: 'crust', label: 'वरचा थर कडक होतो', icon: '🧱' },
        { id: 'none', label: 'काहीही भेगा पडत नाहीत', icon: '🍃' },
      ],
    },
    {
      id: 'cropsBefore',
      title: 'पूर्वी या जमिनीत कोणती पिके चांगली आली होती?',
      subtitle: 'उत्तम उत्पादन देणारे पीक निवडा',
      options: [
        { id: 'cotton_soybean', label: 'कापूस, सोयाबीन किंवा ऊस', icon: '☁️' },
        { id: 'groundnut_millets', label: 'भुईमूग, बाजरी किंवा कडधान्ये', icon: '🥜' },
        { id: 'paddy_wheat', label: 'भात (धान), भाज्या किंवा गहू', icon: '🍚' },
        { id: 'maize_mustard', label: 'मका, मोहरी किंवा बटाटा', icon: '🌽' },
      ],
    },
  ],
  bn: [
    {
      id: 'colour',
      title: 'আপনার জমির মাটির রঙ কেমন?',
      subtitle: 'জমির উপরের শুকনো মাটি দেখুন',
      options: [
        { id: 'black', label: 'গাঢ় কালো / ধূসর', icon: '🌑' },
        { id: 'red', label: 'লালচে / বাদামী-লাল', icon: '🔴' },
        { id: 'yellow_brown', label: 'হালকা বাদামী / হলদেটে', icon: '🟡' },
        { id: 'pale_grey', label: 'ফ্যাকাশে ধূসর / বালুকাময় সাদা', icon: '⚪' },
      ],
    },
    {
      id: 'waterHolding',
      title: 'বৃষ্টির পর মাটিতে জল কেমন থাকে?',
      subtitle: 'মাটিতে আর্দ্রতা কত দিন থাকে লক্ষ্য করুন',
      options: [
        { id: 'very_high', label: 'অনেক দিন জল জমে থাকে / আঠালো কাদা', icon: '💧💧💧' },
        { id: 'moderate', label: '২-৩ দিন ভালো আর্দ্রতা থাকে', icon: '💧💧' },
        { id: 'low', label: 'একদিনেই শুকিয়ে যায়', icon: '💧' },
        { id: 'very_low', label: 'সাথে সাথে জল শুকিয়ে যায়', icon: '🏜️' },
      ],
    },
    {
      id: 'texture',
      title: 'আঙুল দিয়ে ঘষলে মাটি কেমন মনে হয়?',
      subtitle: 'ভেজা মাটি আঙুলে নিয়ে ঘষে দেখুন',
      options: [
        { id: 'clay', label: 'আঠালো এঁটেল মাটির মতো', icon: '🏺' },
        { id: 'loam', label: 'নরম ও ঝরঝরে দোআঁশ', icon: '🌾' },
        { id: 'sandy', label: 'বালুর মতো খসখসে ও দানাদার', icon: '🏖️' },
        { id: 'silt', label: 'ময়দার মতো মিহি পলল', icon: '🌪️' },
      ],
    },
    {
      id: 'cracks',
      title: 'গ্রীষ্মে কি মাটিতে ফাটল ধরে?',
      subtitle: 'অনাবৃষ্টির সময় জমির অবস্থা দেখুন',
      options: [
        { id: 'deep_wide', label: 'গভীর ও চওড়া ফাটল দেখা দেয়', icon: '⚡' },
        { id: 'medium', label: 'ছোট চিকন ফাটল', icon: '〰️' },
        { id: 'crust', label: 'উপরের স্তরে শক্ত স্তর পড়ে', icon: '🧱' },
        { id: 'none', label: 'কোনো ফাটল ধরে না', icon: '🍃' },
      ],
    },
    {
      id: 'cropsBefore',
      title: 'আগে এই জমিতে কোন ফসল সবচেয়ে ভালো হয়েছিল?',
      subtitle: 'ভালো ফলন দেওয়া ফসল নির্বাচন করুন',
      options: [
        { id: 'cotton_soybean', label: 'তুলা, সয়াবিন বা আখ', icon: '☁️' },
        { id: 'groundnut_millets', label: 'চীনাবাদাম, বাজরা বা ডাল', icon: '🥜' },
        { id: 'paddy_wheat', label: 'ধান, শাকসবজি বা গম', icon: '🍚' },
        { id: 'maize_mustard', label: 'ভুট্টা, সরিষা বা আলু', icon: '🌽' },
      ],
    },
  ],
  gu: [
    {
      id: 'colour',
      title: 'તમારા ખેતરની માટીનો રંગ કેવો છે?',
      subtitle: 'ખેતરની સૂકી માટી જુઓ',
      options: [
        { id: 'black', label: 'ઘાટો કાળો / કાળો-રાખોડી', icon: '🌑' },
        { id: 'red', label: 'લાલ / લાલ-કથ્થઈ', icon: '🔴' },
        { id: 'yellow_brown', label: 'આછો કથ્થઈ / પીળાશ પડતો', icon: '🟡' },
        { id: 'pale_grey', label: 'આછો રાખોડી / રેતાળ સફેદ', icon: '⚪' },
      ],
    },
    {
      id: 'waterHolding',
      title: 'વરસાદ પછી જમીનમાં પાણી કેટલું ટકે છે?',
      subtitle: 'જમીનમાં ભેજ કેટલા દિવસ રહે છે તે જુઓ',
      options: [
        { id: 'very_high', label: 'ઘણા દિવસો સુધી પાણી ભરાઈ રહે છે / ચીકણો કાદવ', icon: '💧💧💧' },
        { id: 'moderate', label: '૨-૩ દિવસ સુધી ભેજ રહે છે', icon: '💧💧' },
        { id: 'low', label: 'એક દિવસમાં સુકાઈ જાય છે', icon: '💧' },
        { id: 'very_low', label: 'તરત જ સુકાઈ જાય છે', icon: '🏜️' },
      ],
    },
    {
      id: 'texture',
      title: 'આંગળીઓથી સ્પર્શ કરવાથી માટી કેવી લાગે છે?',
      subtitle: 'ભીની માટીને આંગળીઓથી મસળીને જુઓ',
      options: [
        { id: 'clay', label: 'ચીકણી માટી જેવી', icon: '🏺' },
        { id: 'loam', label: 'નરમ, ભરભરી અને ફળદ્રુપ', icon: '🌾' },
        { id: 'sandy', label: 'રેતી જેવી ખરબચડી', icon: '🏖️' },
        { id: 'silt', label: 'મેંદા જેવી મુલાયમ', icon: '🌪️' },
      ],
    },
    {
      id: 'cracks',
      title: 'ઉનાળામાં જમીનમાં તિરાડો પડે છે?',
      subtitle: 'સૂકા મોસમમાં ખેતરની સપાટી તપાસો',
      options: [
        { id: 'deep_wide', label: 'ઊંડી અને પહોળી તિરાડો પડે છે', icon: '⚡' },
        { id: 'medium', label: 'ઝીણી નાની તિરાડો', icon: '〰️' },
        { id: 'crust', label: 'ઉપર કઠણ પોપડો બને છે', icon: '🧱' },
        { id: 'none', label: 'બિલકુલ તિરાડ પડતી નથી', icon: '🍃' },
      ],
    },
    {
      id: 'cropsBefore',
      title: 'પહેલા આ ખેતરમાં કયા પાક સારા થયા હતા?',
      subtitle: 'સારો પાક આપનાર સમૂહ પસંદ કરો',
      options: [
        { id: 'cotton_soybean', label: 'કપાસ, સોયાબીન અથવા શેરડી', icon: '☁️' },
        { id: 'groundnut_millets', label: 'મગફળી, બાજરી અથવા કઠોળ', icon: '🥜' },
        { id: 'paddy_wheat', label: 'ડાંગર, શાકભાજી અથવા ઘઉં', icon: '🍚' },
        { id: 'maize_mustard', label: 'મકાઈ, રાઈ અથવા બટાટા', icon: '🌽' },
      ],
    },
  ],
  pa: [
    {
      id: 'colour',
      title: 'ਤੁਹਾਡੇ ਖੇਤ ਦੀ ਮਿੱਟੀ ਦਾ ਰੰਗ ਕਿਹੋ ਜਿਹਾ ਹੈ?',
      subtitle: 'ਖੇਤ ਦੀ ਸੁੱਕੀ ਉੱਪਰਲੀ ਮਿੱਟੀ ਦੇਖੋ',
      options: [
        { id: 'black', label: 'ਡੂੰਘੀ ਕਾਲੀ / ਸਲੇਟੀ', icon: '🌑' },
        { id: 'red', label: 'ਲਾਲ / ਭੂਰੀ-ਲਾਲ', icon: '🔴' },
        { id: 'yellow_brown', label: 'ਹਲਕੀ ਭੂਰੀ / ਪੀਲੀ', icon: '🟡' },
        { id: 'pale_grey', label: 'ਹਲਕੀ ਸਲੇਟੀ / ਰੇਤਲੀ ਚਿੱਟੀ', icon: '⚪' },
      ],
    },
    {
      id: 'waterHolding',
      title: 'ਮੀਂਹ ਤੋਂ ਬਾਅਦ ਮਿੱਟੀ ਵਿੱਚ ਪਾਣੀ ਕਿਵੇਂ ਖੜ੍ਹਦਾ ਹੈ?',
      subtitle: 'ਖੇਤ ਵਿੱਚ ਨਮੀ ਕਿੰਨੇ ਦਿਨ ਰਹਿੰਦੀ ਹੈ',
      options: [
        { id: 'very_high', label: 'ਕਈ ਦਿਨਾਂ ਤੱਕ ਪਾਣੀ ਖੜ੍ਹਦਾ ਹੈ / ਚਿਪਚਿਪਾ ਚਿੱਕੜ', icon: '💧💧💧' },
        { id: 'moderate', label: '੨-੩ ਦਿਨ ਨਮੀ ਰਹਿੰਦੀ ਹੈ', icon: '💧💧' },
        { id: 'low', label: 'ਇੱਕ ਦਿਨ ਵਿੱਚ ਸੁੱਕ ਜਾਂਦੀ ਹੈ', icon: '💧' },
        { id: 'very_low', label: 'ਤੁਰੰਤ ਨਿਕਲ ਜਾਂਦਾ ਹੈ', icon: '🏜️' },
      ],
    },
    {
      id: 'texture',
      title: 'ਉਂਗਲਾਂ ਨਾਲ ਛੂਹਣ ਤੇ ਮਿੱਟੀ ਕਿਵੇਂ ਮਹਿਸੂਸ ਹੁੰਦੀ ਹੈ?',
      subtitle: 'ਗਿੱਲੀ ਮਿੱਟੀ ਨੂੰ ਉਂਗਲਾਂ ਨਾਲ ਰਗੜ ਕੇ ਦੇਖੋ',
      options: [
        { id: 'clay', label: 'ਚਿਪਚਿਪੀ ਚੀਕਣੀ ਮਿੱਟੀ ਵਰਗੀ', icon: '🏺' },
        { id: 'loam', label: 'ਨਰਮ, ਭੁਰਭੁਰੀ ਅਤੇ ਉਪਜਾਊ', icon: '🌾' },
        { id: 'sandy', label: 'ਰੇਤ ਵਾਂਗ ਖੁਰਦਰੀ', icon: '🏖️' },
        { id: 'silt', label: 'ਮੈਦੇ ਵਾਂਗ ਮੁਲਾਇਮ', icon: '🌪️' },
      ],
    },
    {
      id: 'cracks',
      title: 'ਗਰਮੀਆਂ ਵਿੱਚ ਜ਼ਮੀਨ ਵਿੱਚ ਤਰੇੜਾਂ ਪੈਂਦੀਆਂ ਹਨ?',
      subtitle: 'ਸੋਕੇ ਦੇ ਸਮੇਂ ਖੇਤ ਦੀ ਸਤ੍ਹਾ ਦੇਖੋ',
      options: [
        { id: 'deep_wide', label: 'ਡੂੰਘੀਆਂ ਅਤੇ ਚੌੜੀਆਂ ਤਰੇੜਾਂ ਪੈਂਦੀਆਂ ਹਨ', icon: '⚡' },
        { id: 'medium', label: 'ਬਰੀਕ ਨਿੱਕੀਆਂ ਤਰੇੜਾਂ', icon: '〰️' },
        { id: 'crust', label: 'ਉੱਪਰ ਸਖ਼ਤ ਪੇਪੜੀ ਜੰਮ ਜਾਂਦੀ ਹੈ', icon: '🧱' },
        { id: 'none', label: 'ਕੋਈ ਤਰੇੜ ਨਹੀਂ ਪੈਂਦੀ', icon: '🍃' },
      ],
    },
    {
      id: 'cropsBefore',
      title: 'ਪਹਿਲਾਂ ਇਸ ਖੇਤ ਵਿੱਚ ਕਿਹੜੀਆਂ ਫ਼ਸਲਾਂ ਵਧੀਆ ਹੋਈਆਂ ਸਨ?',
      subtitle: 'ਵਧੀਆ ਝਾੜ ਦੇਣ ਵਾਲੀਆਂ ਫ਼ਸਲਾਂ ਚੁਣੋ',
      options: [
        { id: 'cotton_soybean', label: 'ਕਪਾਹ, ਸੋਇਆਬੀਨ ਜਾਂ ਕਮਾਦ', icon: '☁️' },
        { id: 'groundnut_millets', label: 'ਮੂੰਗਫਲੀ, ਬਾਜਰਾ ਜਾਂ ਦਾਲਾਂ', icon: '🥜' },
        { id: 'paddy_wheat', label: 'ਝੋਨਾ (ਚਾਵਲ), ਸਬਜ਼ੀਆਂ ਜਾਂ ਕਣਕ', icon: '🍚' },
        { id: 'maize_mustard', label: 'ਮੱਕੀ, ਸਰ੍ਹੋਂ ਜਾਂ ਆਲੂ', icon: '🌽' },
      ],
    },
  ],
  or: [
    {
      id: 'colour',
      title: 'ଆପଣଙ୍କ ଜମି ମାଟିର ରଙ୍ଗ କିପରି?',
      subtitle: 'ଜମିର ଶୁଖିଲା ଉପର ମାଟି ଦେଖନ୍ତୁ',
      options: [
        { id: 'black', label: 'ଗାଢ଼ କଳା / ଧୂସର', icon: '🌑' },
        { id: 'red', label: 'ଲାଲ / ମାଟିଆ-ଲାଲ', icon: '🔴' },
        { id: 'yellow_brown', label: 'ହାଲୁକା ମାଟିଆ / ହଳଦିଆ', icon: '🟡' },
        { id: 'pale_grey', label: 'ଧଳାଳିଆ ଧୂସର / ବାଲିଆ ଧଳା', icon: '⚪' },
      ],
    },
    {
      id: 'waterHolding',
      title: 'ବର୍ଷା ପରେ ମାଟିରେ ପାଣି କିପରି ରହେ?',
      subtitle: 'ମାଟିରେ ଆର୍ଦ୍ରତା କେତେ ଦିନ ରହୁଛି ଲକ୍ଷ୍ୟ କରନ୍ତୁ',
      options: [
        { id: 'very_high', label: 'ଅନେକ ଦିନ ଧରି ପାଣି ଜମି ରହେ / ଅଠାଳିଆ କାଦୁଅ', icon: '💧💧💧' },
        { id: 'moderate', label: '୨-୩ ଦିନ ପର୍ଯ୍ୟନ୍ତ ଓଦା ରହେ', icon: '💧💧' },
        { id: 'low', label: 'ଗୋଟିଏ ଦିନରେ ଶୁଖିଯାଏ', icon: '💧' },
        { id: 'very_low', label: 'ତୁରନ୍ତ ଶୁଖିଯାଏ', icon: '🏜️' },
      ],
    },
    {
      id: 'texture',
      title: 'ହାତରେ ଘଷିଲେ ମାଟି କିପରି ଲାଗେ?',
      subtitle: 'ଓଦା ମାଟିକୁ ଆଙ୍ଗୁଠିରେ ଘଷି ଦେଖନ୍ତୁ',
      options: [
        { id: 'clay', label: 'ଅଠାଳିଆ ଚିକିଟା ମାଟି ଭଳି', icon: '🏺' },
        { id: 'loam', label: 'ନରମ ଏବଂ ଉର୍ବର ଦୋରସା', icon: '🌾' },
        { id: 'sandy', label: 'ବାଲି ଭଳି ଖସଖସିଆ', icon: '🏖️' },
        { id: 'silt', label: 'ମଇଦା ଭଳି ଚିକ୍କଣ', icon: '🌪️' },
      ],
    },
    {
      id: 'cracks',
      title: 'ଖରାଦିନେ ମାଟିରେ ଫାଟ ଦେଖାଯାଏ କି?',
      subtitle: 'ଖରାରେ ଜମିର ଅବସ୍ଥା ଦେଖନ୍ତୁ',
      options: [
        { id: 'deep_wide', label: 'ଗଭୀର ଏବଂ ଚଉଡ଼ା ଫାଟ ହୁଏ', icon: '⚡' },
        { id: 'medium', label: 'ଛୋଟ ପତଳା ଫାଟ', icon: '〰️' },
        { id: 'crust', label: 'ଉପରେ ଟାଣ ଚୋପା ବସିଯାଏ', icon: '🧱' },
        { id: 'none', label: 'କୌଣସି ଫାଟ ହୁଏ ନାହିଁ', icon: '🍃' },
      ],
    },
    {
      id: 'cropsBefore',
      title: 'ପୂର୍ବରୁ ଏହି ଜମିରେ କେଉଁ ଫସଲ ଭଲ ହୋଇଥିଲା?',
      subtitle: 'ଭଲ ଉତ୍ପାଦନ ଦେଇଥିବା ଫସଲ ବାଛନ୍ତୁ',
      options: [
        { id: 'cotton_soybean', label: 'କପା, ସୋୟାବିନ୍ କିମ୍ବା ଆଖୁ', icon: '☁️' },
        { id: 'groundnut_millets', label: 'ଚିନାବାଦାମ, ମାଣ୍ଡିଆ କିମ୍ବା ଡାଲି', icon: '🥜' },
        { id: 'paddy_wheat', label: 'ଧାନ, ପନିପରିବା କିମ୍ବା ଗହମ', icon: '🍚' },
        { id: 'maize_mustard', label: 'ମକା, ସୋରିଷ କିମ୍ବା ଆଳୁ', icon: '🌽' },
      ],
    },
  ],
};

// Rule-based mapping from 5 answers to soil type: 'black', 'red', 'sandy', 'loamy', 'alluvial'
export function evaluateSoilType(answers) {
  const scores = { black: 0, red: 0, sandy: 0, loamy: 0, alluvial: 0 };

  // 1. Colour
  if (answers.colour === 'black') scores.black += 4;
  else if (answers.colour === 'red') scores.red += 4;
  else if (answers.colour === 'yellow_brown') scores.alluvial += 3;
  else if (answers.colour === 'pale_grey') scores.sandy += 3;

  // 2. Water Holding
  if (answers.waterHolding === 'very_high') { scores.black += 3; scores.alluvial += 1; }
  else if (answers.waterHolding === 'moderate') { scores.loamy += 3; scores.alluvial += 2; scores.red += 1; }
  else if (answers.waterHolding === 'low') { scores.red += 2; scores.sandy += 2; }
  else if (answers.waterHolding === 'very_low') { scores.sandy += 4; }

  // 3. Texture
  if (answers.texture === 'clay') { scores.black += 3; scores.alluvial += 1; }
  else if (answers.texture === 'loam') { scores.loamy += 4; scores.alluvial += 2; }
  else if (answers.texture === 'sandy') { scores.sandy += 4; }
  else if (answers.texture === 'silt') { scores.alluvial += 4; scores.loamy += 2; }

  // 4. Cracks
  if (answers.cracks === 'deep_wide') { scores.black += 4; }
  else if (answers.cracks === 'medium') { scores.loamy += 2; scores.red += 2; }
  else if (answers.cracks === 'crust') { scores.alluvial += 3; }
  else if (answers.cracks === 'none') { scores.sandy += 3; }

  // 5. Previous Crops
  if (answers.cropsBefore === 'cotton_soybean') { scores.black += 3; }
  else if (answers.cropsBefore === 'groundnut_millets') { scores.red += 3; scores.sandy += 1; }
  else if (answers.cropsBefore === 'paddy_wheat') { scores.alluvial += 3; scores.loamy += 2; }
  else if (answers.cropsBefore === 'maize_mustard') { scores.loamy += 2; scores.alluvial += 2; }

  let bestType = 'loamy';
  let highest = -1;
  for (const [type, score] of Object.entries(scores)) {
    if (score > highest) {
      highest = score;
      bestType = type;
    }
  }

  const details = {
    black: { name: 'Black Soil', description: 'Rich in clay, retains deep moisture, ideal for cotton, pulses, and soybean.' },
    red: { name: 'Red Soil', description: 'Porous and well-drained, rich in iron, excellent for groundnut and millets.' },
    sandy: { name: 'Sandy Soil', description: 'Loose and highly draining, needs frequent light irrigation and organic mulch.' },
    loamy: { name: 'Loamy Soil', description: 'Balanced crumbly texture with great nutrients, perfect for diverse crops and vegetables.' },
    alluvial: { name: 'Alluvial Soil', description: 'Fertile river silt with superb yield potential for paddy, wheat, and sugarcane.' },
  };

  return {
    soilType: bestType,
    details: details[bestType] || details.loamy,
  };
}

// Current Season calculation: Kharif (Jun-Oct), Rabi (Nov-Mar), Zaid (Apr-May)
export function getCurrentSeason() {
  const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
  if (month >= 5 && month <= 9) return { id: 'Kharif', name: 'Kharif', months: 'Jun - Oct' };
  if (month >= 3 && month <= 4) return { id: 'Zaid', name: 'Zaid', months: 'Apr - May' };
  return { id: 'Rabi', name: 'Rabi', months: 'Nov - Mar' };
}

// Rule-based Crop Matrix (soil x season)
const CROP_DATABASE = {
  black: {
    Kharif: [
      { name: 'Cotton', icon: '☁️', duration: '150-180 days', water: 'Moderate', yield: '12-15 quintals/acre' },
      { name: 'Soybean', icon: '🌱', duration: '90-100 days', water: 'Medium', yield: '8-10 quintals/acre' },
      { name: 'Pigeon Pea (Arhar)', icon: '🌾', duration: '160-180 days', water: 'Low', yield: '6-8 quintals/acre' },
    ],
    Rabi: [
      { name: 'Wheat', icon: '🌾', duration: '120-130 days', water: 'Moderate', yield: '18-22 quintals/acre' },
      { name: 'Chickpea (Chana)', icon: '🧆', duration: '100-110 days', water: 'Low', yield: '8-10 quintals/acre' },
      { name: 'Safflower', icon: '🌻', duration: '120 days', water: 'Low', yield: '5-7 quintals/acre' },
    ],
    Zaid: [
      { name: 'Moong Dal (Green Gram)', icon: '🟢', duration: '60-65 days', water: 'Low', yield: '4-5 quintals/acre' },
      { name: 'Watermelon', icon: '🍉', duration: '75-80 days', water: 'Frequent', yield: '120-150 quintals/acre' },
      { name: 'Sesame (Til)', icon: '✨', duration: '75-85 days', water: 'Low', yield: '3-4 quintals/acre' },
    ],
  },
  red: {
    Kharif: [
      { name: 'Groundnut', icon: '🥜', duration: '105-120 days', water: 'Medium', yield: '10-14 quintals/acre' },
      { name: 'Ragi (Finger Millet)', icon: '🌾', duration: '110-120 days', water: 'Low', yield: '12-16 quintals/acre' },
      { name: 'Red Gram', icon: '🌱', duration: '140-160 days', water: 'Low', yield: '6-8 quintals/acre' },
    ],
    Rabi: [
      { name: 'Mustard', icon: '🌼', duration: '100-115 days', water: 'Low', yield: '6-8 quintals/acre' },
      { name: 'Horse Gram (Kollu)', icon: '🫘', duration: '90-100 days', water: 'Very Low', yield: '4-6 quintals/acre' },
      { name: 'Black Gram (Urad)', icon: '⚫', duration: '70-80 days', water: 'Low', yield: '4-5 quintals/acre' },
    ],
    Zaid: [
      { name: 'Cowpea', icon: '🫛', duration: '65-75 days', water: 'Low', yield: '5-6 quintals/acre' },
      { name: 'Cucumber / Gourd', icon: '🥒', duration: '60-70 days', water: 'Medium', yield: '40-60 quintals/acre' },
      { name: 'Groundnut (Summer)', icon: '🥜', duration: '100 days', water: 'Medium', yield: '12-15 quintals/acre' },
    ],
  },
  alluvial: {
    Kharif: [
      { name: 'Paddy (Rice)', icon: '🍚', duration: '120-140 days', water: 'High', yield: '25-30 quintals/acre' },
      { name: 'Maize', icon: '🌽', duration: '95-105 days', water: 'Medium', yield: '20-25 quintals/acre' },
      { name: 'Sugarcane', icon: '🎋', duration: '300-360 days', water: 'High', yield: '350-400 quintals/acre' },
    ],
    Rabi: [
      { name: 'Wheat', icon: '🌾', duration: '120-130 days', water: 'Moderate', yield: '20-25 quintals/acre' },
      { name: 'Potato', icon: '🥔', duration: '90-100 days', water: 'Medium', yield: '100-120 quintals/acre' },
      { name: 'Mustard', icon: '🌼', duration: '110-120 days', water: 'Low', yield: '7-9 quintals/acre' },
    ],
    Zaid: [
      { name: 'Moong Dal', icon: '🟢', duration: '60-65 days', water: 'Low', yield: '5-6 quintals/acre' },
      { name: 'Muskmelon', icon: '🍈', duration: '70-80 days', water: 'Medium', yield: '80-100 quintals/acre' },
      { name: 'Fodder Maize', icon: '🌽', duration: '50-60 days', water: 'Medium', yield: '120-150 quintals/acre' },
    ],
  },
  sandy: {
    Kharif: [
      { name: 'Pearl Millet (Bajra)', icon: '🌾', duration: '80-90 days', water: 'Very Low', yield: '10-12 quintals/acre' },
      { name: 'Cluster Bean (Guar)', icon: '🫛', duration: '90-100 days', water: 'Very Low', yield: '5-7 quintals/acre' },
      { name: 'Moth Bean', icon: '🌱', duration: '70-80 days', water: 'Very Low', yield: '3-4 quintals/acre' },
    ],
    Rabi: [
      { name: 'Barley', icon: '🌾', duration: '110-120 days', water: 'Low', yield: '14-16 quintals/acre' },
      { name: 'Mustard (Tarameera)', icon: '🌼', duration: '95-105 days', water: 'Low', yield: '5-6 quintals/acre' },
      { name: 'Gram', icon: '🧆', duration: '105-115 days', water: 'Low', yield: '6-8 quintals/acre' },
    ],
    Zaid: [
      { name: 'Watermelon', icon: '🍉', duration: '75-85 days', water: 'Drip/Frequent', yield: '100-130 quintals/acre' },
      { name: 'Muskmelon', icon: '🍈', duration: '70-80 days', water: 'Drip/Frequent', yield: '70-90 quintals/acre' },
      { name: 'Bottle Gourd', icon: '🥒', duration: '60-70 days', water: 'Moderate', yield: '50-70 quintals/acre' },
    ],
  },
  loamy: {
    Kharif: [
      { name: 'Maize', icon: '🌽', duration: '95-105 days', water: 'Medium', yield: '22-26 quintals/acre' },
      { name: 'Paddy', icon: '🍚', duration: '125-135 days', water: 'High', yield: '24-28 quintals/acre' },
      { name: 'Vegetables (Tomato/Chilli)', icon: '🍅', duration: '90-120 days', water: 'Medium', yield: '80-120 quintals/acre' },
    ],
    Rabi: [
      { name: 'Wheat', icon: '🌾', duration: '120-130 days', water: 'Moderate', yield: '22-25 quintals/acre' },
      { name: 'Peas (Green Peas)', icon: '🫛', duration: '80-90 days', water: 'Low', yield: '35-45 quintals/acre' },
      { name: 'Potato', icon: '🥔', duration: '90-100 days', water: 'Medium', yield: '110-130 quintals/acre' },
    ],
    Zaid: [
      { name: 'Okra (Bhindi)', icon: '🥬', duration: '60-70 days', water: 'Medium', yield: '35-45 quintals/acre' },
      { name: 'Moong Dal', icon: '🟢', duration: '60-65 days', water: 'Low', yield: '5-6 quintals/acre' },
      { name: 'Cucumber', icon: '🥒', duration: '55-65 days', water: 'Medium', yield: '50-70 quintals/acre' },
    ],
  },
};

export function getTopCrops(soilType, seasonId) {
  const soil = CROP_DATABASE[soilType] || CROP_DATABASE.loamy;
  const list = soil[seasonId] || soil.Kharif;
  return list.slice(0, 3);
}
