// Database for Prayers (Banis)
// Contains prayers like Japji Sahib, Rehraas Sahib, etc. with Punjabi text and English meanings

export interface PrayerLine {
  punjabi: string;
  english: string;
}

export interface Prayer {
  id: string;
  name: string;
  namePunjabi: string;
  description: string;
  lines: PrayerLine[];
}

// Dummy data for Prayers
export const prayersData: Prayer[] = [
  {
    id: "japji-sahib",
    name: "Japji Sahib",
    namePunjabi: "ਜਪੁਜੀ ਸਾਹਿਬ",
    description: "The morning prayer, first composition in Guru Granth Sahib",
    lines: [
      {
        punjabi: "ੴ ਸਤਿਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ॥",
        english: "One Universal Creator God. The Name Is Truth. Creative Power Personified. No Fear. No Hatred. Image Of The Undying, Beyond Birth, Self-Existent. By Guru's Grace."
      },
      {
        punjabi: "ਜਪੁ॥",
        english: "Chant And Meditate:"
      },
      {
        punjabi: "ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ॥",
        english: "True In The Primal Beginning. True Throughout The Ages."
      },
      {
        punjabi: "ਹੈ ਭੀ ਸਚੁ ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ॥੧॥",
        english: "True Here And Now. O Nanak, Forever And Ever True."
      },
      {
        punjabi: "ਸੋਚੈ ਸੋਚਿ ਨ ਹੋਵਈ ਜੇ ਸੋਚੀ ਲਖ ਵਾਰ॥",
        english: "By thinking, He cannot be reduced to thought, even by thinking hundreds of thousands of times."
      },
      {
        punjabi: "ਚੁਪੈ ਚੁਪ ਨ ਹੋਵਈ ਜੇ ਲਾਇ ਰਹਾ ਲਿਵ ਤਾਰ॥",
        english: "By remaining silent, inner silence is not obtained, even by remaining lovingly absorbed deep within."
      }
    ]
  },
  {
    id: "rehraas-sahib",
    name: "Rehraas Sahib",
    namePunjabi: "ਰਹਿਰਾਸ ਸਾਹਿਬ",
    description: "Evening prayer, recited at sunset",
    lines: [
      {
        punjabi: "ਸੋ ਦਰੁ ਰਾਜਾ ਰਾਮ ਦਾ ਜਿਤੁ ਬਸੇ ਸਰਬ ਜੀਅ॥",
        english: "That is the Door of the Lord's Palace, where all beings dwell."
      },
      {
        punjabi: "ਜਿਤੁ ਬਸੇ ਸਰਬ ਜੀਅ ਤਿਤੁ ਲਗਿ ਰਹੀਐ ਚਿਤੁ॥",
        english: "Where all beings dwell, there keep your consciousness focused."
      },
      {
        punjabi: "ਤਿਤੁ ਲਗਿ ਰਹੀਐ ਚਿਤੁ ਤਾ ਸੁਖੁ ਪਾਈਐ॥",
        english: "Keep your consciousness focused there, and you shall find peace."
      },
      {
        punjabi: "ਤਾ ਸੁਖੁ ਪਾਈਐ ਸਹਜੇ ਹੀ ਮਨਿ ਵਜਹਿ ਇਕਾਲਾ॥",
        english: "You shall find peace, and your mind shall be naturally attuned to the One Lord."
      },
      {
        punjabi: "ਮਨਿ ਵਜਹਿ ਇਕਾਲਾ ਤਾ ਦਰਗਹ ਮਿਲਹਿ ਸਾਚੇ॥",
        english: "When your mind is attuned to the One Lord, you shall be united with the True Court."
      },
      {
        punjabi: "ਤਾ ਦਰਗਹ ਮਿਲਹਿ ਸਾਚੇ ਸਚੁ ਕਮਾਵਹਿ ਸੇਵਾ॥",
        english: "United with the True Court, you shall perform true service."
      }
    ]
  },
  {
    id: "kirtan-sohila",
    name: "Kirtan Sohila",
    namePunjabi: "ਕੀਰਤਨ ਸੋਹਿਲਾ",
    description: "Bedtime prayer, recited before sleeping",
    lines: [
      {
        punjabi: "ਸੋਹਿਲਾ ਮਹਲਾ ੧॥",
        english: "Sohila, First Mehl:"
      },
      {
        punjabi: "ਇਕ ਓਅੰਕਾਰੁ ਸਤਿਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ॥",
        english: "One Universal Creator God. The Name Is Truth. Creative Power Personified. No Fear. No Hatred. Image Of The Undying, Beyond Birth, Self-Existent. By Guru's Grace."
      },
      {
        punjabi: "ਚੌਪਈ॥",
        english: "Chaupey:"
      },
      {
        punjabi: "ਗਾਗਰਿ ਭਰੇ ਘਟੁ ਭਰੇ ਮਾਤਾ ਧਰਤਿ ਮਹਤੁ॥",
        english: "The water-jug is filled, the vessel is filled, O mother, with the Greatness of the Earth."
      },
      {
        punjabi: "ਜੇ ਕੋ ਖਾਵੈ ਜੇ ਕੋ ਭੰਚੈ ਤਿਸੁ ਕਾ ਹੋਇ ਉਧਤੁ॥",
        english: "Whoever eats or drinks it, their hunger and thirst are satisfied."
      },
      {
        punjabi: "ਜੇਤੇ ਦਾਨਿ ਅਪਾਰ॥",
        english: "So many are the unlimited gifts."
      }
    ]
  },
  {
    id: "ardas",
    name: "Ardas",
    namePunjabi: "ਅਰਦਾਸ",
    description: "Sikh prayer of supplication",
    lines: [
      {
        punjabi: "ਅਰਦਾਸ",
        english: "Ardas - Supplication"
      },
      {
        punjabi: "ੴ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫ਼ਤਹਿ॥",
        english: "One God. Victory belongs to Waheguru."
      },
      {
        punjabi: "ਸ੍ਰੀ ਭਗੌਤੀ ਜੀ ਸਹਾਇ॥",
        english: "May the Almighty God help us."
      },
      {
        punjabi: "ਵਾਰ ਸ੍ਰੀ ਭਗੌਤੀ ਜੀ ਕੀ ਪਾਤਸ਼ਾਹੀ ੧੦॥",
        english: "Ode to the Almighty God, the Sovereign of the Tenth Kingdom."
      },
      {
        punjabi: "ਪ੍ਰਿਥਮ ਭਗੌਤੀ ਸਿਮਰਿ ਕੈ ਗੁਰ ਨਾਨਕ ਲਈਂ ਧਿਆਇ॥",
        english: "First, I remember Bhagauti, then I meditate on Guru Nanak."
      },
      {
        punjabi: "ਫਿਰ ਅੰਗਦ ਗੁਰ ਤੇ ਅਮਰਦਾਸੁ ਰਾਮਦਾਸੇ ਹੋਈਂ ਸਹਾਇ॥",
        english: "Then Guru Angad, Guru Amar Das and Guru Ram Das - may they help us."
      }
    ]
  },
  {
    id: "sukhmani-sahib",
    name: "Sukhmani Sahib",
    namePunjabi: "ਸੁਖਮਨੀ ਸਾਹਿਬ",
    description: "The Psalm of Peace, brings peace to the mind",
    lines: [
      {
        punjabi: "ਸੁਖਮਨੀ ਸਾਹਿਬ",
        english: "Sukhmani Sahib - The Psalm of Peace"
      },
      {
        punjabi: "ਸਲੋਕੁ॥",
        english: "Shalok:"
      },
      {
        punjabi: "ਗੁਰ ਪਰਸਾਦੀ ਜਿਨਿ ਸੁਖੁ ਪਾਇਆ ਸੇਵ ਕਰਤ ਜਨੁ ਨੀਕਾ॥",
        english: "By Guru's Grace, one who has found peace, serves as a humble servant."
      },
      {
        punjabi: "ਜਿਸੁ ਨੋ ਦਇਆਲੁ ਹੋਵੈ ਮੇਰਾ ਸੁਆਮੀ ਤਿਸੁ ਗੁਰੁ ਸਬਦੁ ਸੁਣਾਇਆ॥",
        english: "One to whom my Lord is merciful, to him the Guru has revealed the Word."
      },
      {
        punjabi: "ਜਿਨਿ ਸੁਣੀ ਸਿਖਾ ਸਿਖਿਆ ਪਰੀਆ ਸਤਿਗੁਰੁ ਭੇਟਿਆ ਆਇਆ॥",
        english: "One who has heard and learned the teachings, has met the True Guru."
      },
      {
        punjabi: "ਜਿਨ ਕਉ ਨਦਰਿ ਕਰਮੁ ਹੋਇਆ ਹਰਿ ਨਾਮਿ ਰਤੇ ਮਨੁ ਲਾਇਆ॥",
        english: "One upon whom the Glance of Grace has fallen, is attuned to the Lord's Name."
      }
    ]
  },
  {
    id: "asa-di-var",
    name: "Asa Di Var",
    namePunjabi: "ਆਸਾ ਦੀ ਵਾਰ",
    description: "Ballad of Hope, morning prayer",
    lines: [
      {
        punjabi: "ਆਸਾ ਦੀ ਵਾਰ",
        english: "Asa Di Var - Ballad of Hope"
      },
      {
        punjabi: "ਵਾਰ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਕੀ॥",
        english: "Ballad from Sri Guru Granth Sahib Ji"
      },
      {
        punjabi: "ਤਿਥਾ ਨਾਨਕੁ ਨਰੁ ਕਰਮੀ ਆਵੈ ਜਾਇ॥",
        english: "O Nanak, by the karma of past actions, the robe of this physical body is obtained."
      },
      {
        punjabi: "ਜਿਤੁ ਦੁਖੁ ਪਾਈਐ ਸੁਖੁ ਸੁਣੀਐ ਮਾਇਆ ਮੋਹੁ ਵਿਸਾਰਿ॥",
        english: "By the karma of past actions, we come to receive pain or pleasure; listen, and give up your emotional attachment to Maya."
      },
      {
        punjabi: "ਜਿਤੁ ਦੁਖੁ ਪਾਈਐ ਸੁਖੁ ਸੁਣੀਐ ਮਾਇਆ ਮੋਹੁ ਵਿਸਾਰਿ॥",
        english: "By the karma of past actions, we come to receive pain or pleasure; listen, and give up your emotional attachment to Maya."
      }
    ]
  }
];

// Helper function to get prayer by ID
export function getPrayerById(id: string): Prayer | undefined {
  return prayersData.find(prayer => prayer.id === id);
}

// Helper function to search prayers
export function searchPrayers(query: string): Prayer[] {
  const lowerQuery = query.toLowerCase();
  return prayersData.filter(prayer => 
    prayer.name.toLowerCase().includes(lowerQuery) ||
    prayer.namePunjabi.toLowerCase().includes(lowerQuery) ||
    prayer.description.toLowerCase().includes(lowerQuery) ||
    prayer.lines.some(line => 
      line.punjabi.toLowerCase().includes(lowerQuery) ||
      line.english.toLowerCase().includes(lowerQuery)
    )
  );
}

// Get all prayers
export function getAllPrayers(): Prayer[] {
  return prayersData;
}

