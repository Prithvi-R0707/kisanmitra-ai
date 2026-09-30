export const CATEGORY_NAMES = {
  seeds: { ta: 'விதை', en: 'seeds', hi: 'बीज', te: 'విత్తనాలు', kn: 'ಬೀಜ', ml: 'വിത്ത്', mr: 'बियाणे', bn: 'বীজ', gu: 'બિયારણ', pa: 'ਬੀਜ', or: 'ବିହନ' },
  fertilizer: { ta: 'உரம்', en: 'fertilizer', hi: 'खाद', te: 'ఎరువులు', kn: 'ಗೊಬ್ಬರ', ml: 'വളം', mr: 'खत', bn: 'সার', gu: 'ખાતર', pa: 'ਖਾਦ', or: 'ସାର' },
  pesticide: { ta: 'மருந்து', en: 'pesticide', hi: 'दवा', te: 'పురుగుమందు', kn: 'ಕೀಟನಾಶಕ', ml: 'കീടനാശിനി', mr: 'कीटकनाशक', bn: 'কীটনাশক', gu: 'જંતુનાશક', pa: 'ਕੀਟਨਾਸ਼ਕ', or: 'କୀଟନାଶକ' },
  labor: { ta: 'கூலி', en: 'labour', hi: 'मजदूरी', te: 'కూలీ', kn: 'ಕೂಲಿ', ml: 'കൂലി', mr: 'मजुरी', bn: 'মজুরি', gu: 'મજૂરી', pa: 'ਮਜ਼ਦੂਰੀ', or: 'ମୂଲିଆ' },
  water: { ta: 'பாசனம்', en: 'water', hi: 'सिंचाई', te: 'సాగునీరు', kn: 'ನೀರಾವರಿ', ml: 'നനയ്ക്കൽ', mr: 'पाणी', bn: 'সেচ', gu: 'પિયત', pa: 'ਸਿੰਚਾਈ', or: 'ଜଳସେଚନ' },
  machinery: { ta: 'இயந்திரம்', en: 'machinery', hi: 'मशीनरी', te: 'యంత్రాలు', kn: 'ಯಂತ್ರೋಪಕರಣ', ml: 'യന്ത്രങ്ങൾ', mr: 'यंत्रे', bn: 'যন্ত্রপাতি', gu: 'મશીનરી', pa: 'ਮਸ਼ੀਨਰੀ', or: 'ଯନ୍ତ୍ରପାତି' },
  fuel: { ta: 'எரிபொருள்', en: 'fuel', hi: 'ईंधन', te: 'ఇంధనం', kn: 'ಇಂಧನ', ml: 'ഇന്ധനം', mr: 'इंधन', bn: 'জ্বালানি', gu: 'ઈંધણ', pa: 'ਤੇਲ', or: 'ତେଲ' },
  other: { ta: 'இதர', en: 'other', hi: 'अन्य', te: 'ఇతర', kn: 'ಇತರೆ', ml: 'മറ്റുള്ളവ', mr: 'इतर', bn: 'অন্যান্য', gu: 'અન્ય', pa: 'ਹੋਰ', or: 'ଅନ୍ୟାନ୍ୟ' },
};

export const ACTION_NAMES = {
  sowing: { ta: 'விதைத்தல்', en: 'sowing', hi: 'बुवाई', te: 'నాటడం', kn: 'ಬಿತ್ತನೆ', ml: 'വിതയ്ക്കൽ', mr: 'पेरणी', bn: 'বপন', gu: 'વાવણી', pa: 'ਬਿਜਾਈ', or: 'ବୁଣିବା' },
  watering: { ta: 'நீர்ப்பாசனம்', en: 'watering', hi: 'सिंचाई', te: 'నీరు పెట్టడం', kn: 'ನೀರಾವರಿ', ml: 'നനയ്ക്കൽ', mr: 'पाणी देणे', bn: 'সেচ', gu: 'પિયત', pa: 'ਸਿੰਚਾਈ', or: 'ଜଳସେଚନ' },
  fertilizer: { ta: 'உரமிடுதல்', en: 'fertilizer', hi: 'खाद डालना', te: 'ఎరువు వేయడం', kn: 'ಗೊಬ್ಬರ ಹಾಕುವುದು', ml: 'വളം പ്രയോഗം', mr: 'खत देणे', bn: 'সার প্রয়োগ', gu: 'ખાતર નાખવું', pa: 'ਖਾਦ ਪਾਉਣਾ', or: 'ସାର ଦେବା' },
  spray: { ta: 'மருந்து தெளித்தல்', en: 'spraying', hi: 'छिड़काव', te: 'స్ప్రే చేయడం', kn: 'ಔಷಧ ಸಿಂಪರಣೆ', ml: 'മരുന്ന് തളിക്കൽ', mr: 'फवारणी', bn: 'কীটনাশক স্প্রে', gu: 'દવા છંટકાવ', pa: 'ਸਪਰੇਅ', or: 'ଔଷଧ ସିଞ୍ଚନ' },
  harvest: { ta: 'அறுவடை', en: 'harvesting', hi: 'कटाई', te: 'కోత', kn: 'ಕೊಯ್ಲು', ml: 'വിളവെടുപ്പ്', mr: 'कापणी', bn: 'ফসল তোলা', gu: 'લણણી', pa: 'ਵਾਢੀ', or: 'ଅମଳ' },
  activity: { ta: 'பணி', en: 'activity', hi: 'कार्य', te: 'పని', kn: 'ಕೆಲಸ', ml: 'പ്രവൃത്തി', mr: 'काम', bn: 'কাজ', gu: 'કામ', pa: 'ਕੰਮ', or: 'କାମ' },
};

export const FALLBACK_REPLIES = {
  ta: (name) => `வணக்கம் ${name}, உங்கள் பயிர் அல்லது விவசாயம் பற்றி என்னிடம் கேட்கலாம்.`,
  hi: (name) => `नमस्ते ${name} जी, अपनी फसल या खेती के बारे में कुछ भी पूछें।`,
  te: (name) => `నమస్కారం ${name} గారూ, మీ పంట లేదా వ్యవసాయం గురించి ఏదైనా అడగండి.`,
  kn: (name) => `ನಮಸ್ಕಾರ ${name} ಅವರೇ, ನಿಮ್ಮ ಬೆಳೆ ಅಥವಾ ಕೃಷಿ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ.`,
  ml: (name) => `നമസ്കാരം ${name}, നിങ്ങളുടെ കൃഷി കാര്യങ്ങൾ ചോദിക്കൂ.`,
  mr: (name) => `नमस्कार ${name} जी, आपल्या पिकाबद्दल प्रश्न विचारा.`,
  bn: (name) => `নমস্কার ${name} বাবু, আপনার ফসল নিয়ে কিছু জানার থাকলে বলুন।`,
  gu: (name) => `નમસ્તે ${name} ભાઈ, તમારા પાક વિશે કંઈપણ પૂછો.`,
  pa: (name) => `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ${name} ਜੀ, ਆਪਣੀ ਫ਼ਸਲ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ।`,
  or: (name) => `ନମସ୍କାର ${name} ବାବୁ, ଆପଣଙ୍କ ଫସଲ ବିଷୟରେ ଯାହା ପଚାରିବାକୁ ଚାହାଁନ୍ତି ପଚାରନ୍ତୁ।`,
  en: (name) => `Hello ${name}, feel free to ask anything about your crops or farming.`,
};

export function getFallbackReply(langCode, name = 'Farmer') {
  const code = (langCode || 'en').toLowerCase().slice(0, 2);
  const generator = FALLBACK_REPLIES[code] || FALLBACK_REPLIES.en;
  return generator(name);
}

export function getExpenseConfirmedReply(langCode, farmerName = 'Farmer', amount, catKey = 'other') {
  const code = (langCode || 'en').toLowerCase().slice(0, 2);
  const cat = CATEGORY_NAMES[catKey]?.[code] || CATEGORY_NAMES[catKey]?.en || catKey;
  const map = {
    ta: `${farmerName}, ₹${amount} ${cat} செலவு உங்கள் பண்ணைக் குறிப்பேட்டில் சேமிக்கப்பட்டது.`,
    en: `Hello ${farmerName}, your expense of ₹${amount} for ${cat} has been saved to your farm records.`,
    hi: `${farmerName} जी, ₹${amount} का ${cat} खर्च आपकी डायरी में दर्ज कर दिया गया है।`,
    te: `${farmerName} గారూ, ₹${amount} ${cat} ఖర్చు మీ డైరీలో నమోదు చేయబడింది.`,
    kn: `${farmerName} ಅವರೇ, ₹${amount} ${cat} ವೆಚ್ಚವನ್ನು ನಿಮ್ಮ ಡೈರಿಯಲ್ಲಿ ದಾಖಲಿಸಲಾಗಿದೆ.`,
    ml: `${farmerName}, ₹${amount} ${cat} ചെലവ് നിങ്ങളുടെ ഡയറിയിൽ രേഖപ്പെടുത്തി.`,
    mr: `${farmerName} जी, ₹${amount} चा ${cat} खर्च तुमच्या डायरीत नोंदवला गेला आहे.`,
    bn: `${farmerName}, ₹${amount} ${cat} বাবদ খরচ আপনার ডায়েরিতে নথিভুক্ত করা হয়েছে।`,
    gu: `${farmerName} ભાઈ, ₹${amount} નો ${cat} ખર્ચ તમારી ડાયરીમાં નોંધાઈ ગયો છે.`,
    pa: `${farmerName} ਜੀ, ₹${amount} ਦਾ ${cat} ਖਰਚਾ ਤੁਹਾਡੀ ਡਾਇਰੀ ਵਿੱਚ ਦਰਜ ਕਰ ਲਿਆ ਗਿਆ ਹੈ।`,
    or: `${farmerName} ବାବୁ, ₹${amount} ${cat} ଖର୍ଚ୍ଚ ଆପଣଙ୍କ ଡାଏରୀରେ ଲେଖାଗଲା।`,
  };
  return map[code] || map.en;
}

export function getMissingAmountReply(langCode, farmerName = 'Farmer') {
  const code = (langCode || 'en').toLowerCase().slice(0, 2);
  const map = {
    ta: `${farmerName}, இதற்காக நீங்கள் எவ்வளவு செலவழித்தீர்கள்? தொகையைக் கூறவும், நான் குறித்துக் கொள்கிறேன்.`,
    en: `${farmerName}, how much did you spend on this? Please let me know the amount so I can record it.`,
    hi: `${farmerName} जी, आपने इसमें कितने रुपये खर्च किए? कृपया राशि बताएं ताकि मैं इसे दर्ज कर सकूं।`,
    te: `${farmerName} గారూ, దీని కోసం మీరు ఎంత ఖర్చు చేశారు? మొత్తం చెబితే నమోదు చేస్తాను.`,
    kn: `${farmerName} ಅವರೇ, ಇದಕ್ಕೆ ನೀವು ಎಷ್ಟು ಖರ್ಚು ಮಾಡಿದಿರಿ? ಮೊತ್ತವನ್ನು ತಿಳಿಸಿದರೆ ನಾನು ದಾಖಲಿಸುತ್ತೇನೆ.`,
    ml: `${farmerName}, ഇതിനായി എത്ര രൂപ ചെലവഴിച്ചു? തുക പറഞ്ഞാൽ ഞാൻ കുറിച്ചെടുക്കാം.`,
    mr: `${farmerName} जी, यासाठी आपण किती खर्च केला? कृपया रक्कम सांगा म्हणजे मी नोंद करू शकेन.`,
    bn: `${farmerName}, এর জন্য আপনি কত টাকা খরচ করেছেন? পরিমাণটি বললে আমি লিখে রাখব।`,
    gu: `${farmerName} ભાઈ, આમાં તમે કેટલા રૂપિયા ખર્ચ્યા? રકમ જણાવો જેથી હું નોંધી લઉં.`,
    pa: `${farmerName} ਜੀ, ਤੁਸੀਂ ਇਸ ਉੱਤੇ ਕਿੰਨਾ ਖਰਚ ਕੀਤਾ? ਕਿਰਪਾ ਕਰਕੇ ਰਕਮ ਦੱਸੋ ਤਾਂ ਜੋ ਮੈਂ ਦਰਜ ਕਰ ਸਕਾਂ।`,
    or: `${farmerName} ବାବୁ, ଏଥିପାଇଁ କେତେ ଟଙ୍କା ଖର୍ଚ୍ଚ କଲେ? ଟଙ୍କା ପରିମାଣ କହିଲେ ମୁଁ ଲେଖି ରଖିବି।`,
  };
  return map[code] || map.en;
}

export function getActivityConfirmedReply(langCode, farmerName = 'Farmer', actKey = 'activity') {
  const code = (langCode || 'en').toLowerCase().slice(0, 2);
  const act = ACTION_NAMES[actKey]?.[code] || ACTION_NAMES[actKey]?.en || actKey;
  const map = {
    ta: `${farmerName}, உங்கள் விவசாயப் பணி (${act}) பண்ணை வரலாற்றில் குறிக்கப்பட்டது.`,
    en: `Hello ${farmerName}, your farming task (${act}) has been added to your field timeline.`,
    hi: `${farmerName} जी, आपका कार्य (${act}) खेत की समयरेखा में जोड़ दिया गया है।`,
    te: `${farmerName} గారూ, మీ పని (${act}) పొలం టైమ్‌లైన్‌లో చేర్చబడింది.`,
    kn: `${farmerName} ಅವರೇ, ನಿಮ್ಮ ಕೆಲಸ (${act}) ಹೊಲದ ಟೈಮ್‌ಲೈನ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ.`,
    ml: `${farmerName}, നിങ്ങളുടെ പ്രവൃത്തി (${act}) ഫാം ടൈംലൈനിൽ ചേർത്തു.`,
    mr: `${farmerName} जी, आपले काम (${act}) शेताच्या नोंदवहीत जोडले गेले आहे.`,
    bn: `${farmerName}, আপনার কৃষিকাজ (${act}) খামারের সময়রেখায় যুক্ত করা হয়েছে।`,
    gu: `${farmerName} ભાઈ, તમારું કામ (${act}) ખેતરની સમયરેખામાં ઉમેરાઈ ગયું છે.`,
    pa: `${farmerName} ਜੀ, ਤੁਹਾਡਾ ਕੰਮ (${act}) ਖੇਤ ਦੀ ਟਾਈਮਲਾਈਨ ਵਿੱਚ ਜੋੜ ਦਿੱਤਾ ਗਿਆ ਹੈ।`,
    or: `${farmerName} ବାବୁ, ଆପଣଙ୍କ କାମ (${act}) ଫାର୍ମ ଟାଇମଲାଇନରେ ଯୋଡ଼ାଗଲା।`,
  };
  return map[code] || map.en;
}

export function getFallbackDiagnosis(langCode, farmerName = 'Farmer', crop = 'Crop') {
  const code = (langCode || 'en').toLowerCase().slice(0, 2);
  const map = {
    ta: {
      problem: 'இலை ஆய்வு முடிந்தது (சிறிய ஊட்டச்சத்து பற்றாக்குறை)',
      severity: 'low',
      advice: 'பயிர்களின் இலைகளில் மிதமான சத்து குறைபாடு தெரிகிறது. தேவையான நுண்ணூட்ட உரமிட்டு ஈரப்பதத்தை சீராக பராமரிக்கவும்.',
      see_expert: false,
    },
    en: {
      problem: 'Leaf Inspection Completed (Minor Nutrient Need)',
      severity: 'low',
      advice: 'Leaves show slight lightening or minor stress. Maintain balanced watering and apply recommended organic fertilizer.',
      see_expert: false,
    },
    hi: {
      problem: 'पत्ती निरीक्षण पूर्ण (हल्की पोषक तत्व कमी)',
      severity: 'low',
      advice: 'पत्तियों पर हल्का पीलापन दिख रहा है। संतुलित सिंचाई बनाए रखें और आवश्यक सूक्ष्म पोषक तत्व दें।',
      see_expert: false,
    },
    te: {
      problem: 'ఆకుల పరిశీలన పూర్తయింది (స్వల్ప పోషక లోపం)',
      severity: 'low',
      advice: 'ఆకులలో తేలికపాటి పసుపు రంగు కనిపిస్తోంది. తగినంత తేమను ఉంచి సమతుల్య పోషకాలు అందించండి.',
      see_expert: false,
    },
    kn: {
      problem: 'ಎಲೆ ತಪಾಸಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ (ಸಣ್ಣ ಪೋಷಕಾಂಶ ಕೊರತೆ)',
      severity: 'low',
      advice: 'ಎಲೆಗಳಲ್ಲಿ ಸ್ವಲ್ಪ ಹಳದಿ ಬಣ್ಣ ಕಂಡುಬರುತ್ತಿದೆ. ನಿಯಮಿತ ನೀರಾವರಿ ಮಾಡಿ ಸೂಕ್ತ ಪೋಷಕಾಂಶಗಳನ್ನು ನೀಡಿ.',
      see_expert: false,
    },
    ml: {
      problem: 'ഇല പരിശോധന പൂർത്തിയായി (ചെറിയ പോഷകക്കുറവ്)',
      severity: 'low',
      advice: 'ഇലകളിൽ നേരിയ മഞ്ഞനിറം കാണുന്നു. ആവശ്യത്തിന് നനയ്ക്കുകയും സമീകൃത വളം നൽകുകയും ചെയ്യുക.',
      see_expert: false,
    },
    mr: {
      problem: 'पानांची तपासणी पूर्ण (किरकोळ पोषक तत्वांची कमतरता)',
      severity: 'low',
      advice: 'पानांवर थोडा पिवळेपणा दिसत आहे. योग्य पाणी व्यवस्थापन ठेवा आणि आवश्यक खते द्या.',
      see_expert: false,
    },
    bn: {
      problem: 'পাতা পরীক্ষা সম্পন্ন (সামান্য পুষ্টির ঘাটতি)',
      severity: 'low',
      advice: 'পাতায় হালকা হলুদ ভাব দেখা যাচ্ছে। জমিতে পরিমিত আর্দ্রতা রাখুন এবং সুষম সার প্রয়োগ করুন।',
      see_expert: false,
    },
    gu: {
      problem: 'પાંદડાની તપાસ પૂર્ણ (હળવી પોષક તત્વોની ખામી)',
      severity: 'low',
      advice: 'પાંદડા પર થોડી પીળાશ દેખાય છે. સંતુલિત ભેજ જાળવો અને ભલામણ કરેલ ખાતર આપો.',
      see_expert: false,
    },
    pa: {
      problem: 'ਪੱਤਿਆਂ ਦੀ ਜਾਂਚ ਮੁਕੰਮਲ (ਹਲਕੀ ਖੁਰਾਕੀ ਘਾਟ)',
      severity: 'low',
      advice: 'ਪੱਤਿਆਂ ਤੇ ਹਲਕਾ ਪੀਲਾਪਣ ਦਿਖਾਈ ਦੇ ਰਿਹਾ ਹੈ। ਸੰਤੁਲਿਤ ਸਿੰਚਾਈ ਰੱਖੋ ਅਤੇ ਲੋੜੀਂਦੀ ਖਾਦ ਪਾਓ।',
      see_expert: false,
    },
    or: {
      problem: 'ପତ୍ର ପରୀକ୍ଷା ସମ୍ପୂର୍ଣ୍ଣ (ସାମାନ୍ୟ ପୋଷକ ତତ୍ତ୍ୱ ଅଭାବ)',
      severity: 'low',
      advice: 'ପତ୍ରରେ ସାମାନ୍ୟ ହଳଦିଆ ଭାବ ଦେଖାଯାଉଛି। ନିୟମିତ ପାଣି ଦିଅନ୍ତୁ ଏବଂ ସୁଷମ ସାର ପ୍ରୟୋଗ କରନ୍ତୁ।',
      see_expert: false,
    },
  };
  return map[code] || map.en;
}
