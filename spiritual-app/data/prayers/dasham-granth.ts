// Prayers from Dasham Granth
// Contains additional Sikh prayers composed by Guru Gobind Singh Ji

import type { HolyBookPrayerCollection } from './types';

export const dashamGranthPrayers: HolyBookPrayerCollection = {
  holy_book_id: 'dasham-granth',
  holy_book_name: 'Dasham Granth',
  holy_book_name_punjabi: 'ਦਸਮ ਗ੍ਰੰਥ',
  holy_book_name_hindi: 'दसम ग्रंथ',
  prayers: [
    {
      id: 'jaap-sahib',
      holy_book_id: 'dasham-granth',
      name: 'Jaap Sahib',
      name_punjabi: 'ਜਾਪੁ ਸਾਹਿਬ',
      name_hindi: 'जाप साहिब',
      description: 'Powerful morning prayer composed by Guru Gobind Singh Ji',
      type: 'morning',
      time_of_day: 'morning',
      lines: [
        {
          punjabi: 'ਸ੍ਰੀ ਮੁਖਵਾਕ ਪਾਤਿਸ਼ਾਹੀ ੧੦ ॥',
          english: 'From the Holy Mouth of the Tenth King.',
          transliteration_english: 'Sri Mukhvaak Patshahi 10'
        },
        {
          punjabi: 'ਛੁਪੈ ਛੰਦ ॥ ਤ੍ਵ ਪ੍ਰਸਾਦਿ ॥',
          english: 'Chupai Chhanda. By Your Grace.',
          transliteration_english: 'Chupai Chhanda. Tav Prasaad'
        },
        {
          punjabi: 'ਨਮਸਤੁ ਅੰਗ ॥ ਨਮਸਤੁ ਸੰਗ ॥',
          english: 'Salutations to Your Form. Salutations to Your Association.',
          transliteration_english: 'Namastu Ang. Namastu Sang'
        },
        {
          punjabi: 'ਨਮਸਤੁ ਰੰਗ ॥ ਨਮਸਤੁ ਭੰਗ ॥੧॥',
          english: 'Salutations to Your Color. Salutations to Your Breaking.',
          transliteration_english: 'Namastu Rang. Namastu Bhang'
        }
        // Add more lines here as needed
      ]
    },
    {
      id: 'tav-prasad-savaiye',
      holy_book_id: 'dasham-granth',
      name: 'Tav-Prasad Savaiye',
      name_punjabi: 'ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵਈਏ',
      name_hindi: 'तव प्रसाद स्वईये',
      description: 'Praise of God\'s glory, composed by Guru Gobind Singh Ji',
      type: 'morning',
      time_of_day: 'morning',
      lines: [
        {
          punjabi: 'ਸ੍ਰਾਵਗ ਸੁਧ ॥',
          english: 'Savaiyye in Pure Form.',
          transliteration_english: 'Sravag Sudh'
        },
        {
          punjabi: 'ਦੀਨਨ ਕੀ ਪ੍ਰਤਿਪਾਲ ਕਰੈ ਨਿਤ ਸੰਤ ਉਬਾਰਨ ਆਇ ॥',
          english: 'You always protect the meek and come to save the Saints.',
          transliteration_english: 'Deenan Ki Pratipal Kare Nit Sant Ubaaran Aai'
        },
        {
          punjabi: 'ਬੇਦ ਪੁਰਾਨ ਸਾਸਤ੍ਰ ਸਭੈ ਬਹੁ ਭੇਦ ਕਹੈ ਪਰ ਤੇਰੈ ॥',
          english: 'The Vedas, Puranas and all Shastras speak of Your many mysteries.',
          transliteration_english: 'Bed Puraan Saastar Sabhai Bahu Bhed Kahe Par Tere'
        }
        // Add more lines here as needed
      ]
    },
    {
      id: 'chaupai-sahib',
      holy_book_id: 'dasham-granth',
      name: 'Chaupai Sahib',
      name_punjabi: 'ਚੌਪਈ ਸਾਹਿਬ',
      name_hindi: 'चौपई साहिब',
      description: 'Prayer for protection, composed by Guru Gobind Singh Ji',
      type: 'evening',
      time_of_day: 'evening',
      lines: [
        {
          punjabi: 'ਪਾਂਇ ਗਹੇ ਜਬ ਤੇ ਤੁਮਰੇ ਤਬ ਤੇ ਕੋਊ ਆਂਖ ਤਰੇ ਨਹੀ ਆਨਯੋ ॥',
          english: 'Since I have grasped Your Feet, none has cast an evil eye on me.',
          transliteration_english: 'Paai Gahe Jab Te Tumare Tab Te Kou Aankh Tare Nahi Aanyo'
        },
        {
          punjabi: 'ਰਾਮ ਰਹੀਮ ਪੁਰਾਨ ਕੁਰਾਨ ਅਨੇਕ ਕਹੈਂ ਮਤਿ ਏਕ ਨ ਮਾਨਯੋ ॥',
          english: 'The Hindu Puranas and the Muslim Quran speak differently, but I have not accepted any of them.',
          transliteration_english: 'Raam Raheem Puraan Kuraan Anek Kahe Mat Ek Na Manyo'
        }
        // Add more lines here as needed
      ]
    },
    {
      id: 'anand-sahib',
      holy_book_id: 'dasham-granth',
      name: 'Anand Sahib',
      name_punjabi: 'ਆਨੰਦ ਸਾਹਿਬ',
      name_hindi: 'आनंद साहिब',
      description: 'Song of Bliss',
      type: 'anytime',
      lines: [
        {
          punjabi: 'ਅਨੰਦੁ ਭੈਆ ਮੇਰੀ ਮਾਏ ਸਤਿਗੁਰੂ ਮੈ ਪਾਇਆ ॥',
          english: 'I am in ecstasy, O my mother, for I have found my True Guru.',
          transliteration_english: 'Anand Bhaia Meri Maae Satguru Mai Paaia'
        },
        {
          punjabi: 'ਸਤਿਗੁਰੁ ਤ ਪਾਇਆ ਸਹਜ ਸੇਤੀ ਮਨਿ ਵਜੀਆ ਵਾਧਾਈਆ ॥',
          english: 'I have found the True Guru, with intuitive ease, and my mind vibrates with the music of bliss.',
          transliteration_english: 'Satgur Ta Paaia Sahaj Seti Man Vajia Vadhaaiaaia'
        }
        // Add more lines here as needed
      ]
    }
  ]
};

