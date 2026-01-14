// Prayers from Guru Granth Sahib Ji
// Contains Sikh prayers (Banis) with Punjabi text and English meanings

import type { HolyBookPrayerCollection } from './types';

export const guruGranthSahibPrayers: HolyBookPrayerCollection = {
  holy_book_id: 'guru-granth-sahib',
  holy_book_name: 'Guru Granth Sahib',
  holy_book_name_punjabi: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ',
  holy_book_name_hindi: 'गुरु ग्रंथ साहिब',
  prayers: [
    {
      id: 'japji-sahib',
      holy_book_id: 'guru-granth-sahib',
      name: 'Japji Sahib',
      name_punjabi: 'ਜਪੁਜੀ ਸਾਹਿਬ',
      name_hindi: 'जपुजी साहिब',
      description: 'The morning prayer, first composition in Guru Granth Sahib',
      type: 'morning',
      time_of_day: 'morning',
      lines: [
        {
          punjabi: '੧ ਓਅੰਕਾਰੁ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥',
          english: 'One Universal Creator God. The Name Is Truth. Creative Power Personified. No Fear. No Hatred. Image Of The Undying, Beyond Birth, Self-Existent. By Guru\'s Grace.',
          transliteration_english: 'Ik Onkar Sat Naam Karta Purakh Nirbhau Nirvair Akaal Moorat Ajuni Saibhan Gur Prasad'
        },
        {
          punjabi: 'ਜਪੁ ॥',
          english: 'Chant And Meditate:',
          transliteration_english: 'Jap'
        },
        {
          punjabi: 'ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥',
          english: 'True In The Primal Beginning. True Throughout The Ages.',
          transliteration_english: 'Aad Sach Jugaad Sach'
        },
        {
          punjabi: 'ਹੈ ਭੀ ਸਚੁ ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ ॥੧॥',
          english: 'True Here And Now. O Nanak, Forever And Ever True.',
          transliteration_english: 'Hai Bhi Sach Nanak Hosi Bhi Sach'
        },
        {
          punjabi: 'ਸੋਚੈ ਸੋਚਿ ਨ ਹੋਵਈ ਜੇ ਸੋਚੀ ਲਖ ਵਾਰ ॥',
          english: 'By thinking, He cannot be reduced to thought, even by thinking hundreds of thousands of times.',
          transliteration_english: 'Sochai Soch Na Hovai Je Sochi Lakh Vaar'
        },
        {
          punjabi: 'ਚੁਪੈ ਚੁਪ ਨ ਹੋਵਈ ਜੇ ਲਾਇ ਰਹਾ ਲਿਵ ਤਾਰ ॥',
          english: 'By remaining silent, inner silence is not obtained, even by remaining lovingly absorbed deep within.',
          transliteration_english: 'Chupai Chup Na Hovai Je Laai Raha Liv Taar'
        }
      ]
    },
    {
      id: 'rehraas-sahib',
      holy_book_id: 'guru-granth-sahib',
      name: 'Rehraas Sahib',
      name_punjabi: 'ਰਹਿਰਾਸ ਸਾਹਿਬ',
      name_hindi: 'रहिरास साहिब',
      description: 'Evening prayer, recited at sunset',
      type: 'evening',
      time_of_day: 'evening',
      lines: [
        {
          punjabi: 'ਸੋ ਦਰੁ ਰਾਗੁ ਆਸਾ ਮਹਲਾ ੧',
          english: 'So Dar, Raag Aasaa, First Mehl:',
          transliteration_english: 'So Dar Raag Aasa Mahala 1'
        },
        {
          punjabi: 'ਸੋ ਦਰੁ ਤੇਰਾ ਕੇਹਾ ਸੋ ਘਰੁ ਕੇਹਾ ਜਿਤੁ ਬਹਿ ਸਰਬ ਸਮਾਲੇ ॥',
          english: 'Where is That Door of Yours, and where is That Home, in which You sit and take care of all?',
          transliteration_english: 'So Dar Tera Keha So Ghar Keha Jit Bahi Sarab Samale'
        },
        {
          punjabi: 'ਵਾਜੇ ਤੇਰੇ ਨਾਦ ਅਨੇਕ ਅਸੰਖਾ ਕੇਤੇ ਤੇਰੇ ਵਾਵਣਹਾਰੇ ॥',
          english: 'The Sound-current of the Naad vibrates there for You, and countless musicians play all sorts of instruments there for You.',
          transliteration_english: 'Vaaje Tere Naad Anek Asankha Kete Tere Vaavanhare'
        },
        {
          punjabi: 'ਕੇਤੇ ਤੇਰੇ ਰਾਗ ਪਰੀ ਸਿਉ ਕਹੀਅਨਿ ਕੇਤੇ ਤੇਰੇ ਗਾਵਣਹਾਰੇ ॥',
          english: 'So many Ragas and musical harmonies are sung for You, and countless are Your singers.',
          transliteration_english: 'Kete Tere Raag Pari Siu Kahian Kete Tere Gaavanhare'
        }
      ]
    },
    {
      id: 'kirtan-sohila',
      holy_book_id: 'guru-granth-sahib',
      name: 'Kirtan Sohila',
      name_punjabi: 'ਕੀਰਤਨ ਸੋਹਿਲਾ',
      name_hindi: 'कीर्तन सोहिला',
      description: 'Bedtime prayer, recited before sleeping',
      type: 'bedtime',
      time_of_day: 'night',
      lines: [
        {
          punjabi: 'ਕੀਰਤਨ ਸੋਹਿਲਾ ਰਾਗੁ ਗਉੜੀ ਦੀਪਕੀ ਮਹਲਾ ੧',
          english: 'Kirtan Sohila, Raag Gauree Deepakee, First Mehl:',
          transliteration_english: 'Kirtan Sohila Raag Gauree Deepaki Mahala 1'
        },
        {
          punjabi: '੧ ਓਅੰਕਾਰੁ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥',
          english: 'One Universal Creator God. The Name Is Truth. Creative Power Personified. No Fear. No Hatred. Image Of The Undying, Beyond Birth, Self-Existent. By Guru\'s Grace.',
          transliteration_english: 'Ik Onkar Sat Naam Karta Purakh Nirbhau Nirvair Akaal Moorat Ajuni Saibhan Gur Prasad'
        },
        {
          punjabi: 'ਪਹਰ ਪਹਰ ਨਾਮੁ ਧਿਆਈਐ ॥',
          english: 'Hour after hour, meditate on the Naam.',
          transliteration_english: 'Pahar Pahar Naam Dhiaaeeai'
        },
        {
          punjabi: 'ਸਾਹਸ ਸਿਆਣਪ ਸਗਲੀ ਗੁਰ ਮੁਖਿ ਜਾਣੀਐ ॥',
          english: 'All wisdom and understanding comes through the Guru.',
          transliteration_english: 'Sahas Siaanap Saglee Gur Mukh Jaaneeai'
        }
      ]
    },
    {
      id: 'ardas',
      holy_book_id: 'guru-granth-sahib',
      name: 'Ardas',
      name_punjabi: 'ਅਰਦਾਸ',
      name_hindi: 'अरदास',
      description: 'Sikh prayer of supplication',
      type: 'supplication',
      lines: [
        {
          punjabi: '੧ ਓਅੰਕਾਰ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫ਼ਤਹਿ ॥',
          english: 'One Universal Creator God. Victory belongs to God.',
          transliteration_english: 'Ik Onkar Waheguru Ji Ki Fateh'
        },
        {
          punjabi: 'ਸ੍ਰੀ ਭਗੌਤੀ ਜੀ ਸਹਾਇ ॥',
          english: 'May the Almighty God help us.',
          transliteration_english: 'Sri Bhagauti Ji Sahai'
        },
        {
          punjabi: 'ਵਾਰ ਸ੍ਰੀ ਭਗੌਤੀ ਜੀ ਕੀ ਪਾਤਸ਼ਾਹੀ ੧੦ ॥',
          english: 'Ballad of the Almighty God, composed by the Tenth Guru.',
          transliteration_english: 'Var Sri Bhagauti Ji Ki Patshahi 10'
        },
        {
          punjabi: 'ਪ੍ਰਿਥਮ ਭਗੌਤੀ ਸਿਮਰਿ ਕੈ ਗੁਰ ਨਾਨਕ ਲਈਂ ਧਿਆਇ ॥',
          english: 'First, I remember God, then I meditate on Guru Nanak.',
          transliteration_english: 'Pritham Bhagauti Simar Kai Gur Nanak Laee Dhiaai'
        },
        {
          punjabi: 'ਫਿਰ ਅੰਗਦ ਗੁਰ ਤੇ ਅਮਰਦਾਸੁ ਰਾਮਦਾਸੇ ਹੋਈਂ ਸਹਾਇ ॥',
          english: 'Then Guru Angad, Guru Amar Das and Guru Ram Das - may they help us.',
          transliteration_english: 'Phir Angad Gur Te Amar Das Ramdase Hoee Sahai'
        }
      ]
    },
    {
      id: 'sukhmani-sahib',
      holy_book_id: 'guru-granth-sahib',
      name: 'Sukhmani Sahib',
      name_punjabi: 'ਸੁਖਮਨੀ ਸਾਹਿਬ',
      name_hindi: 'सुखमनी साहिब',
      description: 'The Psalm of Peace, brings peace to the mind',
      type: 'morning',
      time_of_day: 'morning',
      lines: [
        {
          punjabi: 'ਸੁਖਮਨੀ ਸਾਹਿਬ ਰਾਗੁ ਗਉੜੀ ਮਹਲਾ ੫',
          english: 'Sukhmani Sahib, Raag Gauree, Fifth Mehl:',
          transliteration_english: 'Sukhmani Sahib Raag Gauree Mahala 5'
        },
        {
          punjabi: '੧ ਓਅੰਕਾਰੁ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥',
          english: 'One Universal Creator God. The Name Is Truth. Creative Power Personified. No Fear. No Hatred. Image Of The Undying, Beyond Birth, Self-Existent. By Guru\'s Grace.',
          transliteration_english: 'Ik Onkar Sat Naam Karta Purakh Nirbhau Nirvair Akaal Moorat Ajuni Saibhan Gur Prasad'
        },
        {
          punjabi: 'ਸਲੋਕੁ ॥',
          english: 'Shalok:',
          transliteration_english: 'Salok'
        },
        {
          punjabi: 'ਆਦਿ ਗੁਰੇ ਨਮਹ ॥',
          english: 'I bow to the Primal Guru.',
          transliteration_english: 'Aad Gure Namah'
        },
        {
          punjabi: 'ਜੁਗਾਦਿ ਗੁਰੇ ਨਮਹ ॥',
          english: 'I bow to the Guru of the Ages.',
          transliteration_english: 'Jugaad Gure Namah'
        },
        {
          punjabi: 'ਸਤਿਗੁਰੇ ਨਮਹ ॥',
          english: 'I bow to the True Guru.',
          transliteration_english: 'Satigure Namah'
        },
        {
          punjabi: 'ਸ੍ਰੀ ਗੁਰਦੇਵੇ ਨਮਹ ॥੧॥',
          english: 'I bow to the Great Divine Guru.',
          transliteration_english: 'Sri Gurdeve Namah'
        }
      ]
    },
    {
      id: 'asa-di-var',
      holy_book_id: 'guru-granth-sahib',
      name: 'Asa Di Var',
      name_punjabi: 'ਆਸਾ ਦੀ ਵਾਰ',
      name_hindi: 'आसा दी वार',
      description: 'Ballad of Hope, morning prayer',
      type: 'morning',
      time_of_day: 'morning',
      lines: [
        {
          punjabi: 'ਆਸਾ ਦੀ ਵਾਰ ਮਹਲਾ ੧',
          english: 'Asa Di Var, First Mehl:',
          transliteration_english: 'Asa Di Var Mahala 1'
        },
        {
          punjabi: 'ਸਲੋਕੁ ਮਃ ੧ ॥',
          english: 'Shalok, First Mehl:',
          transliteration_english: 'Salok Mahala 1'
        },
        {
          punjabi: 'ਜੇ ਰਤੁ ਲਗੈ ਕਪੜੈ ਜਾਮਾ ਹੋਇ ਪਲੀਤੁ ॥',
          english: 'If one\'s clothes are stained with blood, the garment becomes polluted.',
          transliteration_english: 'Je Rat Lagai Kaparrai Jama Hoi Paleet'
        },
        {
          punjabi: 'ਜੋ ਰਤੁ ਪੀਵਹਿ ਮਾਣਸਾ ਤਿਨ ਕਿਉ ਨਿਰਮਲੁ ਚੀਤੁ ॥',
          english: 'How can the consciousness of those who suck the blood of human beings be pure?',
          transliteration_english: 'Jo Rat Peevah Maansa Tin Kio Nirmal Cheet'
        },
        {
          punjabi: 'ਨਾਨਕ ਨਾਉ ਖੁਦਾਇ ਕਾ ਦਿਲਿ ਹਛੈ ਮੁਖਿ ਲੇਹੁ ॥',
          english: 'O Nanak, chant the Name of God, with heart-felt devotion.',
          transliteration_english: 'Nanak Naao Khudaai Ka Dil Hachai Mukh Lehu'
        }
      ]
    }
  ]
};

