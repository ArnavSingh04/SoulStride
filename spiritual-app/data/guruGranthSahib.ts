// Database for Guru Granth Sahib Ji
// Contains pages with Punjabi text and English meanings

export interface GurbaniLine {
  punjabi: string;
  english: string;
}

export interface GuruGranthSahibPage {
  pageNumber: number;
  lines: GurbaniLine[];
}

// Dummy data for Guru Granth Sahib Ji
// In a real app, this would be loaded from a proper database
export const guruGranthSahibData: GuruGranthSahibPage[] = [
  {
    pageNumber: 1,
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
      }
    ]
  },
  {
    pageNumber: 2,
    lines: [
      {
        punjabi: "ਸੋਚੈ ਸੋਚਿ ਨ ਹੋਵਈ ਜੇ ਸੋਚੀ ਲਖ ਵਾਰ॥",
        english: "By thinking, He cannot be reduced to thought, even by thinking hundreds of thousands of times."
      },
      {
        punjabi: "ਚੁਪੈ ਚੁਪ ਨ ਹੋਵਈ ਜੇ ਲਾਇ ਰਹਾ ਲਿਵ ਤਾਰ॥",
        english: "By remaining silent, inner silence is not obtained, even by remaining lovingly absorbed deep within."
      },
      {
        punjabi: "ਭੁਖਿਆ ਭੁਖ ਨ ਉਤਰੀ ਜੇ ਬੰਨਾ ਪੁਰੀਆ ਭਾਰ॥",
        english: "The hunger of the hungry is not appeased, even by piling up loads of worldly goods."
      },
      {
        punjabi: "ਸਹਸ ਸਿਆਣਪਾ ਲਖ ਹੋਹਿ ਤ ਇਕ ਨ ਚਲੈ ਨਾਲਿ॥",
        english: "Hundreds of thousands of clever tricks, but not even one of them will go along with you in the end."
      }
    ]
  },
  {
    pageNumber: 3,
    lines: [
      {
        punjabi: "ਕਿਵ ਸਚਿਆਰਾ ਹੋਈਐ ਕਿਵ ਕੂੜੈ ਤੁਟੈ ਪਾਲਿ॥",
        english: "So what can make us truthful? What can break the wall of falsehood?"
      },
      {
        punjabi: "ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ ਨਾਨਕ ਲਿਖਿਆ ਨਾਲਿ॥੧॥",
        english: "O Nanak, it is written that you shall obey the Hukam of His Command, and walk in the Way of His Will."
      },
      {
        punjabi: "ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ ਹੁਕਮੁ ਨ ਕਹਿਆ ਜਾਈ॥",
        english: "By the Hukam of His Command, all forms are created. His Command cannot be described."
      },
      {
        punjabi: "ਹੁਕਮੀ ਹੋਵਨਿ ਜੀਅ ਹੁਕਮਿ ਮਿਲੈ ਵਡਿਆਈ॥",
        english: "By the Hukam of His Command, souls come into being. By the Hukam of His Command, glory and greatness are obtained."
      }
    ]
  },
  {
    pageNumber: 4,
    lines: [
      {
        punjabi: "ਹੁਕਮੀ ਉਤਮੁ ਨੀਚੁ ਹੁਕਮਿ ਲਿਖਿ ਦੁਖ ਸੁਖ ਪਾਈਅਹਿ॥",
        english: "By the Hukam of His Command, some are high and some are low. By the Hukam of His Command, pain and pleasure are obtained."
      },
      {
        punjabi: "ਇਕਨਾ ਹੁਕਮੀ ਬਖਸੀਸ ਇਕਿ ਹੁਕਮੀ ਸਦਾ ਭਵਾਈਅਹਿ॥",
        english: "Some, by His Command, are blessed and forgiven. Others, by His Command, wander aimlessly forever."
      },
      {
        punjabi: "ਹੁਕਮੈ ਅੰਦਰਿ ਸਭੁ ਕੋ ਬਾਹਰਿ ਹੁਕਮ ਨ ਕੋਇ॥",
        english: "Everyone is subject to His Command. No one is beyond His Command."
      },
      {
        punjabi: "ਨਾਨਕ ਹੁਕਮੈ ਜੇ ਬੁਝੈ ਤ ਹਉਮੈ ਕਹੈ ਨ ਕੋਇ॥੨॥",
        english: "O Nanak, one who understands His Hukam, does not speak in ego."
      }
    ]
  },
  {
    pageNumber: 5,
    lines: [
      {
        punjabi: "ਗਾਵੈ ਕੋ ਤਾਣੁ ਹੋਵੈ ਕਿਸੈ ਤਾਣੁ॥",
        english: "Some sing of His Power—who has that Power?"
      },
      {
        punjabi: "ਗਾਵੈ ਕੋ ਦਾਤਿ ਜਾਣੈ ਨੀਸਾਣੁ॥",
        english: "Some sing of His Gifts, and know His Sign."
      },
      {
        punjabi: "ਗਾਵੈ ਕੋ ਗੁਣ ਵਡਿਆਈਆ ਚਾਰ॥",
        english: "Some sing of His Glorious Virtues, Greatness and Beauty."
      },
      {
        punjabi: "ਗਾਵੈ ਕੋ ਵਿਦਿਆ ਵਿਖਮੁ ਵੀਚਾਰੁ॥",
        english: "Some sing of knowledge obtained of Him, through difficult philosophical studies."
      }
    ]
  },
  {
    pageNumber: 10,
    lines: [
      {
        punjabi: "ਜੇਤੇ ਸਿਰਿ ਸਿਰਿ ਆਲਿਆ ਪਾਹਿਆ॥",
        english: "As many heads as there are, He has given each one a task."
      },
      {
        punjabi: "ਤੇਤੇ ਮੁਖਿ ਹੋਵਹਿ ਬਾਦਿਆਹਿਆ॥",
        english: "As many mouths as there are, He has given each one sustenance."
      },
      {
        punjabi: "ਜੇਤੇ ਪਉਣ ਪਾਣੀ ਬੈਸੰਤਰੁ ਤੇਤੇ ਕਾਲ ਧਰਮ ਰਾਇ॥",
        english: "As many airs, waters, fires and nether regions as there are, so many are the incarnations of death and the forms of Dharma."
      },
      {
        punjabi: "ਜੇਤੇ ਭਾਂਤਿ ਭਾਂਤਿ ਰੂਪ ਰੰਗਾ ਤੇਤੇ ਭਾਂਤਿ ਭਾਂਤਿ ਭਖ॥",
        english: "As many varieties of form, color and beauty as there are, so many are the varieties of hunger and thirst."
      }
    ]
  },
  {
    pageNumber: 15,
    lines: [
      {
        punjabi: "ਜੇਤੇ ਖਾਣੀ ਖਾਹਿ ਤੇਤੇ ਖਾਹਿ ਖੁਸੀਆਹੁ॥",
        english: "As many pleasures as there are, so many are the enjoyers of pleasures."
      },
      {
        punjabi: "ਜੇਤੇ ਬੋਲਣਿ ਬੋਲਿ ਤੇਤੇ ਸੁਣਿ ਸੁਣਿ ਧਾਹੁ॥",
        english: "As many words as there are, so many are the listeners who hear them."
      },
      {
        punjabi: "ਜੇਤੇ ਰੰਗ ਰੂਪ ਤੇਤੇ ਰੰਗ ਰੂਪਾ॥",
        english: "As many colors and forms as there are, so many are the colors and forms."
      },
      {
        punjabi: "ਜੇਤੇ ਭਾਂਤਿ ਭਾਂਤਿ ਭਖ ਤੇਤੇ ਭਾਂਤਿ ਭਾਂਤਿ ਭੁਖ॥",
        english: "As many varieties of hunger and thirst as there are, so many are the varieties of hunger and thirst."
      }
    ]
  },
  {
    pageNumber: 20,
    lines: [
      {
        punjabi: "ਜੇਤੇ ਗੁਣ ਗਾਵਹਿ ਤੇਤੇ ਗੁਣ ਗਾਵਹਿ॥",
        english: "As many virtues as there are, so many are the virtues to sing."
      },
      {
        punjabi: "ਜੇਤੇ ਗੁਣ ਗਾਵਹਿ ਤੇਤੇ ਗੁਣ ਗਾਵਹਿ॥",
        english: "As many virtues as there are, so many are the virtues to sing."
      },
      {
        punjabi: "ਨਾਨਕ ਗੁਣ ਗਾਵਹਿ ਤੇਤੇ ਗੁਣ ਗਾਵਹਿ॥",
        english: "O Nanak, as many virtues as there are, so many are the virtues to sing."
      },
      {
        punjabi: "ਜੇਤੇ ਗੁਣ ਗਾਵਹਿ ਤੇਤੇ ਗੁਣ ਗਾਵਹਿ॥",
        english: "As many virtues as there are, so many are the virtues to sing."
      }
    ]
  }
];

// Helper function to get page by number
export function getPageByNumber(pageNumber: number): GuruGranthSahibPage | undefined {
  return guruGranthSahibData.find(page => page.pageNumber === pageNumber);
}

// Helper function to search pages
export function searchPages(query: string): GuruGranthSahibPage[] {
  const lowerQuery = query.toLowerCase();
  return guruGranthSahibData.filter(page => 
    page.lines.some(line => 
      line.punjabi.toLowerCase().includes(lowerQuery) ||
      line.english.toLowerCase().includes(lowerQuery)
    )
  );
}

// Get total number of pages
export function getTotalPages(): number {
  return guruGranthSahibData.length;
}

