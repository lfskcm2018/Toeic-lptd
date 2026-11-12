/**
 * EPIData.gs — English Pronunciation in Use Elementary (Cambridge, 2007)
 *
 * 50 unit (Section A/B/C/D) + Section E (E1–E8).
 * Audio: 5 CD (351 track) phát trực tiếp từ GitHub Pages.
 *
 * Nguồn dữ liệu: work/data/epu-lessons.json (sinh bởi work/tools/build-epu-data.js)
 * Mapping audio ↔ unit: đọc marker <CD><số><phần> trong sách (xem work/data/epu-track-map.js)
 *
 * @author 2026 Nguyễn Văn Quyết
 */

function EPI_META() { return {
  "schemaVersion": 3,
  "sourceId": "epu-elementary",
  "sourceName": "English Pronunciation in Use Elementary",
  "author": "Jonathan Marks",
  "publisher": "Cambridge University Press (2007)",
  "type": "pronunciation-course",
  "language": "en",
  "sections": [
    "A",
    "B",
    "C",
    "D",
    "E"
  ],
  "units": 50,
  "sectionECount": 8,
  "cdnBase": "https://lfskcm2018.github.io/Toeic-lptd/epu-audio",
  "cdTrackCount": {
    "A": 81,
    "B": 92,
    "C": 85,
    "D": 55,
    "E": 38
  },
  "totals": {
    "units": 50,
    "sentences": 147,
    "exercises": 173,
    "answers": 137,
    "words": 28,
    "sectionE": 8,
    "audioTracks": 351,
    "unitAudioTracks": 288
  },
  "generatedAt": "2026-11-12T20:26:49.382Z"
}; }

function EPI_UNITS() { return [
 {
  "id": "epu-u01",
  "unit": 1,
  "section": "A",
  "cd": "A",
  "title": "How many letters, how many sounds?",
  "focus": "Spelling and pronunciation",
  "sounds": [],
  "page": 10,
  "sentences": [
   "A2a There are 26 letters in the English alphabet.",
   "Ad But there are more than 40 vowel and consonant sounds in English.",
   "In some words, the number of letters is the same as the number of sounds.",
   "| But sometimes the number of sounds is different from the number of letters.",
   "A3d In some words, one letter is two sounds. The x in six is two sounds like k + s.",
   "before stressed syllables (see Section B Syllables and words)."
  ],
  "words": [],
  "exercises": [
   {
    "n": "1.7",
    "prompt": "Write the number of letters and the number of sounds in these words.",
    "answer": ""
   },
   {
    "n": "1.2",
    "prompt": "Some pronunciation symbols are easy. Write these words in their normal spelling.",
    "answer": "1big 2dress 3 friend 4give Shep 6next 7very 8 wel"
   },
   {
    "n": "1.3",
    "prompt": "All five words in each group have the same vowel letter - a, €, i, 0 or u - but one has a different",
    "answer": "1time 2 wash 3 push 4 many"
   },
   {
    "n": "1.4",
    "prompt": "Write words that rhyme (the end part of the word sounds the same).",
    "answer": "1 tee 2 shoe 3 what 4 run § wait / weight 6 why 7 show 8 near"
   }
  ],
  "audioTracks": [
   "CD1-Track01.mp3",
   "CD1-Track02.mp3",
   "CD1-Track03.mp3",
   "CD1-Track04.mp3",
   "CD1-Track05.mp3",
   "CD1-Track06.mp3",
   "CD1-Track07.mp3",
   "CD1-Track08.mp3"
  ],
  "trackRange": [
   1,
   8
  ]
 },
 {
  "id": "epu-u02",
  "unit": 2,
  "section": "A",
  "cd": "A",
  "title": "Pizza for dinner",
  "focus": "/ɪ/ and /iː/",
  "sounds": [
   "ɪ",
   "iː"
  ],
  "page": 12,
  "sentences": [
   "A10f Note: Units 2 to 10 focus on vowel sounds in stressed syllables (see Section B Syllables and words)."
  ],
  "words": [],
  "exercises": [
   {
    "n": "2.1",
    "prompt": "Put these [iz words in the dialogues.",
    "answer": "1 A: What shall we do this evening? B: Lets stay at home and watch TV. B: No - it’s a secret! B: Yes. A: Well, he’s got a new job. He’s joined the police!"
   },
   {
    "n": "2.7",
    "prompt": "Find the [1/ words from these clues. 1.00",
    "answer": ""
   },
   {
    "n": "2.3",
    "prompt": "Circle all the [iz/ sounds and underline all the [1] sounds.",
    "answer": "fi sounds: green meet people pizza please repeat tea three IM sounds: big busy dinner give in listen office repeat six"
   },
   {
    "n": "2.4",
    "prompt": "Match the beginnings and endings of the sentences.",
    "answer": ""
   },
   {
    "n": "2.5",
    "prompt": "Listen and circle the word you hear. Check with the Key. If any of these are difficult for you, go to",
    "answer": "1leave 2 near 3 letter"
   }
  ],
  "audioTracks": [
   "CD1-Track09.mp3",
   "CD1-Track10.mp3",
   "CD1-Track11.mp3",
   "CD1-Track12.mp3",
   "CD1-Track13.mp3",
   "CD1-Track14.mp3",
   "CD1-Track15.mp3"
  ],
  "trackRange": [
   9,
   15
  ]
 },
 {
  "id": "epu-u03",
  "unit": 3,
  "section": "A",
  "cd": "A",
  "title": "A spoonful of sugar",
  "focus": "/ʊ/ and /uː/",
  "sounds": [
   "ʊ",
   "uː"
  ],
  "page": 14,
  "sentences": [],
  "words": [],
  "exercises": [
   {
    "n": "3.1",
    "prompt": "Circle the words with /uz/. (There are nine.)",
    "answer": "food June news room school soup spoon Tuesday two"
   },
   {
    "n": "3.2",
    "prompt": "Put the fuz/ words from Exercise 3.1 in the sentences. Gam",
    "answer": "1 Do you like fast food?"
   },
   {
    "n": "3.3",
    "prompt": "Circle the words with fu]. (There are six.)",
    "answer": "book cookery could good looking sugar"
   },
   {
    "n": "3.4",
    "prompt": "Put the Ju] words from Exercise 3.3 in the sentences.",
    "answer": "1 Do you take sugar?"
   },
   {
    "n": "3.5",
    "prompt": "Circle the words that have /u:/ or fu, then put them in the correct column.",
    "answer": "my Iv) true foot toothbrush good soon cook lose push through pull put"
   },
   {
    "n": "3.6",
    "prompt": "Listen and circle the word you hear. Check with the Key. If any of these are difficult for you, go to",
    "answer": "1pool 2luck 3 soap"
   }
  ],
  "audioTracks": [
   "CD1-Track16.mp3",
   "CD1-Track17.mp3",
   "CD1-Track18.mp3",
   "CD1-Track19.mp3",
   "CD1-Track20.mp3",
   "CD1-Track21.mp3",
   "CD1-Track22.mp3"
  ],
  "trackRange": [
   16,
   22
  ]
 },
 {
  "id": "epu-u04",
  "unit": 4,
  "section": "A",
  "cd": "A",
  "title": "Father and mother",
  "focus": "/ɑː/ and /ʌ/",
  "sounds": [
   "ɑː",
   "ʌ"
  ],
  "page": 16,
  "sentences": [
   "2 We went to a large bar full of film stars.",
   "3 We're starting in half an hour.",
   "1 See you tomorrow afternoon. 3 We were laughing and dancing in the classroom.",
   "A Note: The words son and sun have the same pronunciation.",
   "1 Good luck with your exam next month!",
   "2 Take the number one bus.",
   "4 My brother’s studying in London."
  ],
  "words": [],
  "exercises": [
   {
    "n": "4.1",
    "prompt": "Listen and write the words in the correct column.",
    "answer": "words with /ai/: artist garden March part words with other vowel sounds: square talk warm watch"
   },
   {
    "n": "4.2",
    "prompt": "Listen and write the words in the correct column.",
    "answer": "words with /a/: country fun money mother words with other vowel sounds: business home lots push"
   },
   {
    "n": "4.3",
    "prompt": "Complete the sentences with one /a:/ word and one /a/ word.",
    "answer": "1 The butter’s too hard. 3 Their son's got dark hair."
   },
   {
    "n": "4.4",
    "prompt": "Listen and circle the word you hear. Check with the Key. If any of these are difficult for you, go to",
    "answer": ""
   }
  ],
  "audioTracks": [
   "CD1-Track23.mp3",
   "CD1-Track24.mp3",
   "CD1-Track25.mp3",
   "CD1-Track26.mp3",
   "CD1-Track27.mp3",
   "CD1-Track28.mp3",
   "CD1-Track29.mp3"
  ],
  "trackRange": [
   23,
   29
  ]
 },
 {
  "id": "epu-u05",
  "unit": 5,
  "section": "A",
  "cd": "A",
  "title": "A dog in the corner",
  "focus": "/ɒ/ and /ɔː/",
  "sounds": [
   "ɒ",
   "ɔː"
  ],
  "page": 18,
  "sentences": [
   "A Note: The word cough is pronounced [kof].",
   "1 Have you got a lot of shopping? 3 How much did your holiday cost?",
   "pupoe tant 1 Have you got a lot of shopping? ~~ 3 How much did your holiday cost?",
   "ing) 3 John's gone to the shops. 4 She said the coffee wasn't very good, but | thought it was."
  ],
  "words": [],
  "exercises": [
   {
    "n": "5.1",
    "prompt": "Write these words.",
    "answer": "1clock 2gone 3 want 4 wanted S sorry 6 what"
   },
   {
    "n": "5.2",
    "prompt": "Listen and complete the dialogues with these /p/ words.",
    "answer": "1 A: What time is it? B: I don’t know. The clock’s stopped. B: A box of chocolates. B: He's gone on holiday."
   },
   {
    "n": "5.3",
    "prompt": "Write the underlined verbs in the past tense.",
    "answer": "1 thought 2 walked 3 caught 4 taught"
   },
   {
    "n": "5.4",
    "prompt": "Write the names of the things in the picture. J 7 0] p a= (5-2",
    "answer": "1 bottle 2 salt (and pepper) 3 box (of shopping) 4 floor"
   },
   {
    "n": "5.5",
    "prompt": "Listen and write the missing /o/ and /o:/ words. 6",
    "answer": "This is our kitchen. On the table theres a big box full of shopping, a bottle of wine and some salt and pepper. There's a ball on the floor and the dog's asleep in the corner behind the door."
   },
   {
    "n": "5.6",
    "prompt": "Listen and circle the word you hear. Check with the Key. If any of these are difficult for you, go to",
    "answer": ""
   }
  ],
  "audioTracks": [
   "CD1-Track30.mp3",
   "CD1-Track31.mp3",
   "CD1-Track32.mp3",
   "CD1-Track33.mp3",
   "CD1-Track34.mp3",
   "CD1-Track35.mp3",
   "CD1-Track36.mp3"
  ],
  "trackRange": [
   30,
   36
  ]
 },
 {
  "id": "epu-u06",
  "unit": 6,
  "section": "A",
  "cd": "A",
  "title": "Bread and jam",
  "focus": "/e/ and /æ/",
  "sounds": [
   "e",
   "æ"
  ],
  "page": 20,
  "sentences": [
   "3 Correct these sentences.",
   "4 Twenty to twelve.",
   "5 Help your friend.",
   "1 Thanks for the cash.",
   "3 Where’s my black jacket?",
   "4 That man works in a jam factory.",
   "5 Let me carry your bags."
  ],
  "words": [],
  "exercises": [
   {
    "n": "6.1",
    "prompt": "Write these words.",
    "answer": "1hand 2best 3egg 4 man 5 men 6 many 7 have 8 next"
   },
   {
    "n": "6.2",
    "prompt": "Seven of these numbers have [e/. Which are they?",
    "answer": "7 10 11 12 17 20 70"
   },
   {
    "n": "6.3",
    "prompt": "Match the phrases to make sentences with an [ef and an Je].",
    "answer": ""
   },
   {
    "n": "6.4",
    "prompt": "Listen and circle the word you hear. Check with the Key. If any of these are difficult for you, go to",
    "answer": ""
   }
  ],
  "audioTracks": [
   "CD1-Track37.mp3",
   "CD1-Track38.mp3",
   "CD1-Track39.mp3",
   "CD1-Track40.mp3",
   "CD1-Track41.mp3",
   "CD1-Track42.mp3"
  ],
  "trackRange": [
   37,
   42
  ]
 },
 {
  "id": "epu-u07",
  "unit": 7,
  "section": "A",
  "cd": "A",
  "title": "My birthday's on Thursday",
  "focus": "/ɜː/",
  "sounds": [
   "ɜː"
  ],
  "page": 22,
  "sentences": [
   "VEEN thirty-first and hers is a week later.",
   "1 My birthday’s on Thursday the thirty-first, and hers is a week later.",
   "2 When would you prefer, Tuesday or Thursday?",
   "3 That was the worst journey in the world!",
   "4 Have you ever heard this word? B: I thought they were.",
   "6 She went to university to learn German.",
   "Gor kein 1 My birthday's on Thursday the thirty-first, and hers is a week later."
  ],
  "words": [],
  "exercises": [
   {
    "n": "7.1",
    "prompt": "Listen and put the words in the correct groups.",
    "answer": "words with /=:/: words with />:/: words with /o:/: lcar 2 large 3 March 4 parked § stars words with other sounds:"
   },
   {
    "n": "7.2",
    "prompt": "Look at the picture and complete the sentences, using the",
    "answer": "1 The nurse is sitting on a chair next to the girl. stars in the sky."
   },
   {
    "n": "7.3",
    "prompt": "Listen and write the numbers you hear.",
    "answer": "134 213 31st 430 53d 62st 714 837"
   },
   {
    "n": "7.4",
    "prompt": "Listen and circle the word you hear. Check with the Key. If you find any of these difficult, go to",
    "answer": "1shirts 2 first 3 beard 4 head"
   }
  ],
  "audioTracks": [
   "CD1-Track43.mp3",
   "CD1-Track44.mp3",
   "CD1-Track45.mp3",
   "CD1-Track46.mp3",
   "CD1-Track47.mp3"
  ],
  "trackRange": [
   43,
   47
  ]
 },
 {
  "id": "epu-u08",
  "unit": 8,
  "section": "A",
  "cd": "A",
  "title": "Here and there",
  "focus": "/ɪə/ and /eə/",
  "sounds": [
   "ɪə",
   "eə"
  ],
  "page": 24,
  "sentences": [
   "3 Is there a bank near here?",
   "4 The meaning isn’t really clear. A: Look at that aeroplane!"
  ],
  "words": [],
  "exercises": [
   {
    "n": "2.7",
    "prompt": "Read this note and find four [1a] words and four /ea/ words.",
    "answer": ""
   },
   {
    "n": "2.3",
    "prompt": "Listen. Can you hear an [r/ sound after the [19] or [ea] in the underlined words? Circle the correct",
    "answer": "fi sounds: green meet people pizza please repeat tea three IM sounds: big busy dinner give in listen office repeat six"
   },
   {
    "n": "4.4",
    "prompt": "Listen and repeat these poems.",
    "answer": ""
   },
   {
    "n": "2.5",
    "prompt": "Listen and circle the word you hear. Check with the Key. If any of these are difficult for you, go to :",
    "answer": "1leave 2 near 3 letter"
   }
  ],
  "audioTracks": [
   "CD1-Track48.mp3",
   "CD1-Track49.mp3",
   "CD1-Track50.mp3",
   "CD1-Track51.mp3",
   "CD1-Track52.mp3",
   "CD1-Track53.mp3",
   "CD1-Track54.mp3"
  ],
  "trackRange": [
   48,
   54
  ]
 },
 {
  "id": "epu-u09",
  "unit": 9,
  "section": "A",
  "cd": "A",
  "title": "Have a great time!",
  "focus": "/eɪ/, /aɪ/ and /ɔɪ/",
  "sounds": [
   "eɪ",
   "aɪ",
   "ɔɪ"
  ],
  "page": 26,
  "sentences": [
   "1 They came a day later. 3 Is this the way to the station?"
  ],
  "words": [],
  "exercises": [
   {
    "n": "9.1",
    "prompt": "Complete the titles of these pictures. y A [ 4 ce <0 b 3 o",
    "answer": "1 Waiting for the train 3 Raining in Spain 5 Baking a cake"
   },
   {
    "n": "9.2",
    "prompt": "These verbs are in the past tense. Write the infinitive. They all have /ai/.",
    "answer": "twit 2ty 3find 4buy 5fly"
   },
   {
    "n": "9.3",
    "prompt": "Complete these sentences. All the missing words have /e1/ or [ai].",
    "answer": "1 The plane left in the evening and arrived the next morning. It was a night flight."
   },
   {
    "n": "9.4",
    "prompt": "Look at the pictures and find six things with /e1/, three things with [a1] and three things with [a1].",
    "answer": "fl 1 radio 2 table 3 cake 4 train 5 plane 6 suitcase fav 7 light 8 wine 9 ice Il 10 boy 11 coins 12 toys"
   },
   {
    "n": "9.5",
    "prompt": "Listen and circle the word you hear. Check with the Key. If any of these are difficult for you, go to",
    "answer": "1gae 2 wear 3 my"
   }
  ],
  "audioTracks": [
   "CD1-Track55.mp3",
   "CD1-Track56.mp3",
   "CD1-Track57.mp3",
   "CD1-Track58.mp3",
   "CD1-Track59.mp3",
   "CD1-Track60.mp3",
   "CD1-Track61.mp3",
   "CD1-Track62.mp3"
  ],
  "trackRange": [
   55,
   62
  ]
 },
 {
  "id": "epu-u10",
  "unit": 10,
  "section": "A",
  "cd": "A",
  "title": "Old town",
  "focus": "/əʊ/ and /aʊ/",
  "sounds": [
   "əʊ",
   "aʊ"
  ],
  "page": 28,
  "sentences": [
   "3 She phoned me in October.",
   "4 They showed us their home."
  ],
  "words": [],
  "exercises": [
   {
    "n": "10.7",
    "prompt": "Circle the word with a different vowel sound.",
    "answer": ""
   },
   {
    "n": "10.2",
    "prompt": "Complete the text with some of the words from Exercise 10.1. All the missing words have [ou] or [av].",
    "answer": "It's an old town on the coast. The houses are built with brown stone. You can get there by train, coach or boat. In winter there’s a lot of snow and sometimes the road over the mountains is closed."
   },
   {
    "n": "10.3",
    "prompt": "Listen and repeat these poems.",
    "answer": ""
   },
   {
    "n": "10.4",
    "prompt": "Listen and circle the word you hear. Check with the Key. If any of these are difficult for you, go to",
    "answer": "1 coast 2 boot 3 woke"
   }
  ],
  "audioTracks": [
   "CD1-Track63.mp3",
   "CD1-Track64.mp3",
   "CD1-Track65.mp3",
   "CD1-Track66.mp3",
   "CD1-Track67.mp3",
   "CD1-Track68.mp3"
  ],
  "trackRange": [
   63,
   68
  ]
 },
 {
  "id": "epu-u11",
  "unit": 11,
  "section": "A",
  "cd": "A",
  "title": "Pack your bags",
  "focus": "/p/ and /b/",
  "sounds": [
   "p",
   "b"
  ],
  "page": 30,
  "sentences": [
   "A Note: The word cupboard is pronounced ['kabad/ - don't pronounce the p.",
   "A Note: [biz is the name of the letter B in the alphabet.",
   "2 When was the baby born?",
   "3 It’s better to bake your own bread than to buy it.",
   "4 What's that big building between the bank and the library?",
   "1 Pamela's got a new job. 3 Can you remember Pete’s phone number?",
   "2 Paul's got big problems with his neighbours. 4 Pack your bags and bring your passport."
  ],
  "words": [],
  "exercises": [
   {
    "n": "11.7",
    "prompt": "Write the words. Choose from the words in the box.",
    "answer": ""
   },
   {
    "n": "11.2",
    "prompt": "Complete the words with p or b.",
    "answer": "1 Can you help me paint the bedroom wardrobe?"
   },
   {
    "n": "1.3",
    "prompt": "Listen and fill the gaps. 1) 7 | >",
    "answer": "1time 2 wash 3 push 4 many"
   },
   {
    "n": "11.4",
    "prompt": "Listen and circle the word you hear. Check with the Key. If you find any of these difficult, go to",
    "answer": "1 bears 2 pear 3 copies"
   }
  ],
  "audioTracks": [
   "CD1-Track69.mp3",
   "CD1-Track70.mp3",
   "CD1-Track71.mp3",
   "CD1-Track72.mp3",
   "CD1-Track73.mp3",
   "CD1-Track74.mp3"
  ],
  "trackRange": [
   69,
   74
  ]
 },
 {
  "id": "epu-u12",
  "unit": 12,
  "section": "A",
  "cd": "A",
  "title": "Twenty days",
  "focus": "/t/ and /d/",
  "sounds": [
   "t",
   "d"
  ],
  "page": 32,
  "sentences": [],
  "words": [],
  "exercises": [
   {
    "n": "12.1",
    "prompt": "Listen and complete the sentences.",
    "answer": "1 2001 was the first time I went to Britain."
   },
   {
    "n": "12.2",
    "prompt": "Listen and write the numbers of the words.",
    "answer": "1 wide 2 wrote 3set 4said 5 white 6send 7road 8 sent"
   },
   {
    "n": "12.3",
    "prompt": "Listen and complete the sentences.",
    "answer": "1 They send us emails every day."
   },
   {
    "n": "12.4",
    "prompt": "Listen and repeat these poems.",
    "answer": ""
   },
   {
    "n": "12.5",
    "prompt": "Listen and circle the word you hear. Check with the Key. If you find any of these difficult, go to",
    "answer": "1 wach 2 wide 3 dry 4 writing § taught"
   }
  ],
  "audioTracks": [
   "CD1-Track75.mp3",
   "CD1-Track76.mp3",
   "CD1-Track77.mp3",
   "CD1-Track78.mp3",
   "CD1-Track79.mp3",
   "CD1-Track80.mp3",
   "CD1-Track81.mp3"
  ],
  "trackRange": [
   75,
   81
  ]
 },
 {
  "id": "epu-u13",
  "unit": 13,
  "section": "A",
  "cd": "B",
  "title": "Cats and dogs",
  "focus": "/k/ and /g/",
  "sounds": [
   "k",
   "g"
  ],
  "page": 34,
  "sentences": [
   "A Note: The letter k is silent in a few words, e.g. know, knee, knife.",
   "1 Look in the kitchen cupboard. 2 Keep your keys in your pocket.",
   "{ Bf; 1 Can you guess the beginning of the dialogue? 2 Are you going jogging again?"
  ],
  "words": [],
  "exercises": [
   {
    "n": "13.7",
    "prompt": "Write the words. Choose from the words in the box.",
    "answer": ""
   },
   {
    "n": "13.2",
    "prompt": "Complete the words. They all have /k/ or /g/ sounds.",
    "answer": "1 Canl carry your bags?"
   },
   {
    "n": "13.3",
    "prompt": "Listen and fill the gaps. ’ y",
    "answer": "1 Shall we walk?"
   },
   {
    "n": "13.4",
    "prompt": "Listen and circle the word you hear. Check with the Key. If you find any of these difficult, go to",
    "answer": "1back 2 gold"
   }
  ],
  "audioTracks": [
   "CD2-Track01.mp3",
   "CD2-Track02.mp3",
   "CD2-Track03.mp3",
   "CD2-Track04.mp3",
   "CD2-Track05.mp3",
   "CD2-Track06.mp3",
   "CD2-Track07.mp3"
  ],
  "trackRange": [
   1,
   7
  ]
 },
 {
  "id": "epu-u14",
  "unit": 14,
  "section": "A",
  "cd": "B",
  "title": "November the first",
  "focus": "/f/ and /v/",
  "sounds": [
   "f",
   "v"
  ],
  "page": 36,
  "sentences": [
   "5 When I asked for her autograph she just laughed.",
   "1 We're leaving at five past seven.",
   "3 Stephen lives in a village."
  ],
  "words": [],
  "exercises": [
   {
    "n": "14.1",
    "prompt": "Write these words.",
    "answer": "1 five 2visit 3 first 4 free 5 leave 6 photo"
   },
   {
    "n": "14.2",
    "prompt": "Complete the titles of the pictures using these words.",
    "answer": "1 A fine view 2 Driving too fast 3 Knives and forks"
   },
   {
    "n": "14.3",
    "prompt": "Listen and repeat these poems.",
    "answer": ""
   },
   {
    "n": "14.4",
    "prompt": "Listen and circle the word you hear. Check with the Key. If you find any of these difficult, go to",
    "answer": "1 few 2 leave 3 coffee"
   }
  ],
  "audioTracks": [
   "CD2-Track08.mp3",
   "CD2-Track09.mp3",
   "CD2-Track10.mp3",
   "CD2-Track11.mp3",
   "CD2-Track12.mp3",
   "CD2-Track13.mp3"
  ],
  "trackRange": [
   8,
   13
  ]
 },
 {
  "id": "epu-u15",
  "unit": 15,
  "section": "A",
  "cd": "B",
  "title": "Both together",
  "focus": "/θ/ and /ð/",
  "sounds": [
   "θ",
   "ð"
  ],
  "page": 38,
  "sentences": [
   "1 I thought April the twelfth was a Tuesday, but it’s a Thursday.",
   "2 A: I've got three birthdays this month. B: Three birthdays? What do you mean?",
   "3 It’s thirteen degrees in the north, and thirty in the south.",
   "4 A: One third is thirty-three per cent, isn’t it? B: Thirty-three and a third per cent, to be exact. A: No, the others, over there. A: One with, and one without."
  ],
  "words": [
   "birthday"
  ],
  "exercises": [
   {
    "n": "15.1",
    "prompt": "Write these words.",
    "answer": "1 month 2 then 3 thin 4 they 5 with 6 birthday"
   },
   {
    "n": "15.3",
    "prompt": "Listen and complete the sentences.",
    "answer": "1 The weather will be fine for the next three days. Then, on Thursday, there'll be some rain in the north. The south will be dry and sunny, but only about thirteen degrees. B: Me too! Let's both go together! was about three years old. B: And the baby — is that you? A: Yes, that's me, with my thumb in my mouth!"
   },
   {
    "n": "15.4",
    "prompt": "Listen and circle the word you hear. Check with the Key. If you find any of these difficult,",
    "answer": "1 thing 2 tree"
   }
  ],
  "audioTracks": [
   "CD2-Track14.mp3",
   "CD2-Track15.mp3",
   "CD2-Track16.mp3",
   "CD2-Track17.mp3",
   "CD2-Track18.mp3",
   "CD2-Track19.mp3"
  ],
  "trackRange": [
   14,
   19
  ]
 },
 {
  "id": "epu-u16",
  "unit": 16,
  "section": "A",
  "cd": "B",
  "title": "It's the wrong size, isn't it?",
  "focus": "/s/ and /z/",
  "sounds": [
   "s",
   "z"
  ],
  "page": 40,
  "sentences": [
   "2 Have you seen my glasses?",
   "3 So, I'll see you in the same place next Saturday.",
   "§ My science lessons were the most interesting.",
   "1 What time does the zoo close?",
   "2 A: My favourite music is jazz."
  ],
  "words": [],
  "exercises": [
   {
    "n": "16.1",
    "prompt": "Write these words.",
    "answer": "1say 2sat 3 leaves 4 east 5 times 6 glasses"
   },
   {
    "n": "16.2",
    "prompt": "1 Which two days of the week have /s/? | ———",
    "answer": "1 Saturday, Sunday"
   },
   {
    "n": "16.3",
    "prompt": "Listen and write the /s/ and /z/ sounds in each word.",
    "answer": "1 these 12d 7 dress Isl"
   },
   {
    "n": "16.4",
    "prompt": "Fill the gaps with the words from Exercise 16.3.",
    "answer": "1 A: Do you like this dress? B: The style suits you, but it’s the wrong size, isn’t it?"
   },
   {
    "n": "16.5",
    "prompt": "Listen and repeat this poem.",
    "answer": ""
   },
   {
    "n": "16.6",
    "prompt": "Listen and circle the word you hear. Check with the Key. If you find any of these difficult, go to",
    "answer": "1plays 2200 3 so 4 thing"
   }
  ],
  "audioTracks": [
   "CD2-Track20.mp3",
   "CD2-Track21.mp3",
   "CD2-Track22.mp3",
   "CD2-Track23.mp3",
   "CD2-Track24.mp3",
   "CD2-Track25.mp3",
   "CD2-Track26.mp3",
   "CD2-Track27.mp3"
  ],
  "trackRange": [
   20,
   27
  ]
 },
 {
  "id": "epu-u17",
  "unit": 17,
  "section": "A",
  "cd": "B",
  "title": "Fresh fish, usually",
  "focus": "/ʃ/ and /ʒ/",
  "sounds": [
   "ʃ",
   "ʒ"
  ],
  "page": 42,
  "sentences": [
   "A: Are you sure? This is a very special pronunciation machine. A: Do you like sport?"
  ],
  "words": [],
  "exercises": [
   {
    "n": "17.1",
    "prompt": "Write these words.",
    "answer": "1 fish 2 station 3 finish 4 shout 5 short 6 dish"
   },
   {
    "n": "17.3",
    "prompt": "Listen and complete the sentences.",
    "answer": "1 Yes, we're an international business. We're based in Russia, but we fly to anywhere in Asia and the Pacific Ocean."
   },
   {
    "n": "17.4",
    "prompt": "Listen and circle the word you hear. Check YF RE",
    "answer": "1 shoe 2 shoes"
   }
  ],
  "audioTracks": [
   "CD2-Track28.mp3",
   "CD2-Track29.mp3",
   "CD2-Track30.mp3",
   "CD2-Track31.mp3",
   "CD2-Track32.mp3",
   "CD2-Track33.mp3"
  ],
  "trackRange": [
   28,
   33
  ]
 },
 {
  "id": "epu-u18",
  "unit": 18,
  "section": "A",
  "cd": "B",
  "title": "Chips and juice",
  "focus": "/tʃ/ and /dʒ/",
  "sounds": [
   "tʃ",
   "dʒ"
  ],
  "page": 44,
  "sentences": [
   "1 Which questions did you choose in the exam?",
   "2 The picture in the kitchen is by a Czech artist.",
   "1 Who's that wearing a large orange jacket?",
   "2 There's some juice in the fridge.",
   "3 Languages are a bridge between people."
  ],
  "words": [],
  "exercises": [
   {
    "n": "18.1",
    "prompt": "Write these words.",
    "answer": "1 wach 2job 3 chips 4 large 5 juice 6 jazz 7 chair 8 age"
   },
   {
    "n": "18.2",
    "prompt": "Listen and circle the odd one out.",
    "answer": "1get 2 Christmas 3 give 4 picture"
   },
   {
    "n": "18.3",
    "prompt": "Listen and repeat these sentences.",
    "answer": ""
   },
   {
    "n": "18.4",
    "prompt": "Listen and put these words into two groups.",
    "answer": "words with /t/: teacher chair chicken cheap Dutch chips cheese words with /d3/: lounge bridge large juice language orange dangerous"
   },
   {
    "n": "18.5",
    "prompt": "Fill the gaps with words from Exercise 18.4.",
    "answer": "1 orange juice 2 Dutch cheese 3 A cheap chair 4 a language teacher"
   },
   {
    "n": "18.6",
    "prompt": "Listen and circle the word you hear. Check with the Key. If you find any of % Ee",
    "answer": "1 watch 2 choose 3 what's 4 coats"
   }
  ],
  "audioTracks": [
   "CD2-Track34.mp3",
   "CD2-Track35.mp3",
   "CD2-Track36.mp3",
   "CD2-Track37.mp3",
   "CD2-Track38.mp3",
   "CD2-Track39.mp3",
   "CD2-Track40.mp3",
   "CD2-Track41.mp3"
  ],
  "trackRange": [
   34,
   41
  ]
 },
 {
  "id": "epu-u19",
  "unit": 19,
  "section": "A",
  "cd": "B",
  "title": "My hungry uncle",
  "focus": "/m/, /n/ and /ŋ/",
  "sounds": [
   "m",
   "n",
   "ŋ"
  ],
  "page": 46,
  "sentences": [],
  "words": [],
  "exercises": [
   {
    "n": "19.7",
    "prompt": "Write these words.",
    "answer": ""
   },
   {
    "n": "19.2",
    "prompt": "Write the words. Two are with /n/ and three with [p/. ) < 0",
    "answer": "words with /n/: knee nose words with /n/: tongue ring ankle"
   },
   {
    "n": "19.3",
    "prompt": "Complete the titles of the pictures using these words.",
    "answer": "1 Awarmevening 2 A wrong answer 3 My hungry uncle"
   },
   {
    "n": "19.4",
    "prompt": "Look at the picture and complete the sentences. i 8 | ry",
    "answer": "1 The woman’ listening to the radio and reading."
   }
  ],
  "audioTracks": [
   "CD2-Track42.mp3",
   "CD2-Track43.mp3",
   "CD2-Track44.mp3",
   "CD2-Track45.mp3",
   "CD2-Track46.mp3",
   "CD2-Track47.mp3",
   "CD2-Track48.mp3",
   "CD2-Track49.mp3"
  ],
  "trackRange": [
   42,
   49
  ]
 },
 {
  "id": "epu-u20",
  "unit": 20,
  "section": "A",
  "cd": "B",
  "title": "How many hours?",
  "focus": "/h/",
  "sounds": [
   "h"
  ],
  "page": 48,
  "sentences": [
   "2 Whose hat is this?",
   "4 We had a whole month’s holiday.",
   "§ Can you help me for half an hour?",
   "2 Have you seen him?",
   "5 He went to visit lis family."
  ],
  "words": [],
  "exercises": [
   {
    "n": "20.1",
    "prompt": "Write these words.",
    "answer": "that 2how 3 home 4 half 5 high/hi 6 who"
   },
   {
    "n": "20.2",
    "prompt": "Listen and complete the dialogue.",
    "answer": "A: Excuse me, can you tell me how to get to the castle? B: Yes. Go past the hotel and the hospital, then there’s a road behind those houses. You go up a hill, and the castle’s at the top. A: Thanks for your help!"
   },
   {
    "n": "20.4",
    "prompt": "Listen and circle the word you hear. Check with the Key. If you find any of these difficult, go to",
    "answer": "lear 2 high"
   }
  ],
  "audioTracks": [
   "CD2-Track50.mp3",
   "CD2-Track51.mp3",
   "CD2-Track52.mp3",
   "CD2-Track53.mp3",
   "CD2-Track54.mp3"
  ],
  "trackRange": [
   50,
   54
  ]
 },
 {
  "id": "epu-u21",
  "unit": 21,
  "section": "A",
  "cd": "B",
  "title": "That's life!",
  "focus": "/v/",
  "sounds": [
   "v"
  ],
  "page": 50,
  "sentences": [
   "1 When shall we leave?",
   "5 Look at those lovely litde yellow flowers.",
   "6 Learning a language can be difficult for some people."
  ],
  "words": [],
  "exercises": [
   {
    "n": "21.1",
    "prompt": "Write these words.",
    "answer": "1late 2 light 3 large 4 cold Stable 6 apple 7 learning 8 below"
   },
   {
    "n": "21.2",
    "prompt": "Look at the pictures and complete the sentences using these words.",
    "answer": "1 Did you say the letter box or the litter bin?"
   },
   {
    "n": "21.3",
    "prompt": "Listen and complete the story.",
    "answer": "My bus was late. I caught a cold. That's life!"
   },
   {
    "n": "21.4",
    "prompt": "Listen and circle the word you hear. Check with the Key. If you find any of these difficult, go to",
    "answer": "1 light 2 correct"
   }
  ],
  "audioTracks": [
   "CD2-Track55.mp3",
   "CD2-Track56.mp3",
   "CD2-Track57.mp3",
   "CD2-Track58.mp3",
   "CD2-Track59.mp3"
  ],
  "trackRange": [
   55,
   59
  ]
 },
 {
  "id": "epu-u22",
  "unit": 22,
  "section": "A",
  "cd": "B",
  "title": "What terrible weather!",
  "focus": "/r/",
  "sounds": [
   "r"
  ],
  "page": 52,
  "sentences": [
   "1 What are you reading?",
   "4 Too much writing makes my wrist ache."
  ],
  "words": [],
  "exercises": [
   {
    "n": "22.1",
    "prompt": "Put these words in the correct places, in their normal spelling.",
    "answer": "1 Hey, look! I found these old rock records in a rubbish bin! we arrive."
   },
   {
    "n": "22.2",
    "prompt": "Look at the words with r in the spelling. Listen and put a tick (v) by them if the r is pronounced, and",
    "answer": "Underlining = /'/ pronounced"
   },
   {
    "n": "22.3",
    "prompt": "Listen and circle the word you hear. Check with the Key. If you find any of these difficult, go to",
    "answer": "1right 2 long 3 correct"
   }
  ],
  "audioTracks": [
   "CD2-Track60.mp3",
   "CD2-Track61.mp3",
   "CD2-Track62.mp3",
   "CD2-Track63.mp3"
  ],
  "trackRange": [
   60,
   63
  ]
 },
 {
  "id": "epu-u23",
  "unit": 23,
  "section": "A",
  "cd": "B",
  "title": "What's the news?",
  "focus": "/w/ and /j/",
  "sounds": [
   "w",
   "j"
  ],
  "page": 54,
  "sentences": [
   "4 quarter to twelve on Wednesday 9 Where will you be waiting?"
  ],
  "words": [],
  "exercises": [
   {
    "n": "23.1",
    "prompt": "Write these words.",
    "answer": "1 news 2 few 3 yet 4 weekend 5 tunes"
   },
   {
    "n": "23.2",
    "prompt": "Complete the dialogues using these words.",
    "answer": "1 A: When's your interview? B: It’s on Wednesday, at quarter past one. A: Good luck! B: Yes. A: Where? B: 1 don’t know yet."
   },
   {
    "n": "23.3",
    "prompt": "Match the questions and answers in the interview. |",
    "answer": "Whar A wallet. With? Money, keys, cards — the usual things. Who? Two young men."
   }
  ],
  "audioTracks": [
   "CD2-Track64.mp3",
   "CD2-Track65.mp3",
   "CD2-Track66.mp3",
   "CD2-Track67.mp3",
   "CD2-Track68.mp3"
  ],
  "trackRange": [
   64,
   68
  ]
 },
 {
  "id": "epu-u24",
  "unit": 24,
  "section": "A",
  "cd": "B",
  "title": "Sunglasses or umbrella?",
  "focus": "Consonant groups in the middle of words",
  "sounds": [],
  "page": 56,
  "sentences": [],
  "words": [
   "alphabet",
   "asking",
   "bookshop",
   "building",
   "dancing",
   "lovely",
   "children",
   "complete",
   "country",
   "downstairs",
   "expensive"
  ],
  "exercises": [
   {
    "n": "24.1",
    "prompt": "Complete the words.",
    "answer": "1 Tuesday 2 fifty 3 expensive 4 centimetre 5 pencil"
   },
   {
    "n": "24.2",
    "prompt": "Complete the words.",
    "answer": "1 mountains 2 reception 3 accident 4 postcard 5 sunglasses, umbrella"
   },
   {
    "n": "24.3",
    "prompt": "Underline the consonant groups in the middle of words in the dialogues.",
    "answer": "1 A: How’s your English? B: I think I need to practise more — I have problems with making sentences, and tenses, and pronunciation, and listening, and answering questions, and conversation, and I make too many mistakes ... A: Don’t worry, it’s not so bad! You’re almost an expert! B: I don’t know. In your suitcase, maybe? A: Where’s my suitcase? B: Upstairs, in the wardrobe. A: Right. And where’s the envelope that was on the kitchen table? B: In the wastepaper basket — was it important?"
   }
  ],
  "audioTracks": [
   "CD2-Track69.mp3",
   "CD2-Track70.mp3",
   "CD2-Track71.mp3",
   "CD2-Track72.mp3",
   "CD2-Track73.mp3"
  ],
  "trackRange": [
   69,
   73
  ]
 },
 {
  "id": "epu-u25",
  "unit": 25,
  "section": "A",
  "cd": "B",
  "title": "Train in the rain",
  "focus": "Consonant groups at the beginning of words",
  "sounds": [],
  "page": 58,
  "sentences": [
   "these words. Be careful — don’t put a vowel sound between the consonants."
  ],
  "words": [],
  "exercises": [
   {
    "n": "25.1",
    "prompt": "Listen and circle the word you hear.",
    "answer": "1 Is that your dress? 7 Is that your address?"
   },
   {
    "n": "25.2",
    "prompt": "Make as many words as you can with sounds from boxes 1+2, 1+2+3 or 2+3.",
    "answer": "A different order is also possible."
   },
   {
    "n": "25.3",
    "prompt": "Complete the words. They all have two consonant sounds and two consonant letters.",
    "answer": "1plane 2 blue 3 drink 4 twelfth 5 free 6 o'clock 7 speak 8 floor"
   }
  ],
  "audioTracks": [
   "CD2-Track74.mp3",
   "CD2-Track75.mp3",
   "CD2-Track76.mp3",
   "CD2-Track77.mp3",
   "CD2-Track78.mp3"
  ],
  "trackRange": [
   74,
   78
  ]
 },
 {
  "id": "epu-u26",
  "unit": 26,
  "section": "A",
  "cd": "B",
  "title": "Pink and orange",
  "focus": "Consonant groups at the end of words",
  "sounds": [],
  "page": 60,
  "sentences": [],
  "words": [
   "arrived",
   "ask",
   "build",
   "dance",
   "find",
   "finished",
   "asks",
   "builds",
   "crisps",
   "danced",
   "helps"
  ],
  "exercises": [
   {
    "n": "26.7",
    "prompt": "Listen and circle the word you hear.",
    "answer": ""
   },
   {
    "n": "26.2",
    "prompt": "Listen and complete the sentences with words from Exercise 26.1.",
    "answer": ""
   },
   {
    "n": "26.3",
    "prompt": "Underline the consonant groups at the ends of words in the dialogues.",
    "answer": "1 A: Have you seen that film? B: No, I havent."
   },
   {
    "n": "26.4",
    "prompt": "Complete each phrase with one of the words in boots physics west silence",
    "answer": "1 physics 2 isnt 3 thousands 4 boots 5 banks 6 silence 7 west"
   }
  ],
  "audioTracks": [
   "CD2-Track79.mp3",
   "CD2-Track80.mp3",
   "CD2-Track81.mp3",
   "CD2-Track82.mp3",
   "CD2-Track83.mp3",
   "CD2-Track84.mp3",
   "CD2-Track85.mp3",
   "CD2-Track86.mp3"
  ],
  "trackRange": [
   79,
   86
  ]
 },
 {
  "id": "epu-u27",
  "unit": 27,
  "section": "A",
  "cd": "B",
  "title": "Last week",
  "focus": "Consonant groups across words",
  "sounds": [],
  "page": 62,
  "sentences": [
   "Good goal!"
  ],
  "words": [],
  "exercises": [
   {
    "n": "27.1",
    "prompt": "Listen and complete the sentences.",
    "answer": "1 See you next week."
   },
   {
    "n": "27.2",
    "prompt": "Underline the consonant groups across words in these sentences. It's really",
    "answer": "1 It’s really warm today."
   },
   {
    "n": "27.3",
    "prompt": "Complete the phrases with the words from the box. You will need to use some of them more than",
    "answer": "A different order is also possible. this month next month last month a big town an old town a small town a young cat a white cat a big cat a black cat an old cat a small cat cheap clothes white clothes big clothes black clothes old clothes small clothes"
   }
  ],
  "audioTracks": [
   "CD2-Track87.mp3",
   "CD2-Track88.mp3",
   "CD2-Track89.mp3",
   "CD2-Track90.mp3",
   "CD2-Track91.mp3",
   "CD2-Track92.mp3"
  ],
  "trackRange": [
   87,
   92
  ]
 },
 {
  "id": "epu-u28",
  "unit": 28,
  "section": "B",
  "cd": "C",
  "title": "One house, two houses",
  "focus": "Syllables",
  "sounds": [],
  "page": 64,
  "sentences": [
   "syllables. The words in list 2 have two syllables, and the words in list 3 have one syllable.",
   "Ooh, thank you very much!"
  ],
  "words": [],
  "exercises": [
   {
    "n": "28.1",
    "prompt": "How many syllables are there in these words? Write the number of syllables next to the word.",
    "answer": "leyes1 6 glass 1"
   },
   {
    "n": "28.2",
    "prompt": "1 Which day of the week has three syllables?",
    "answer": "1 Saturday 2 Two 3 Eleven, seventeen 4 W (‘double uw’) 5 March, May, June"
   },
   {
    "n": "28.3",
    "prompt": "Read this story and mark all the words that have two or three syllables.",
    "answer": "I remember(3) once on my first visit(2) to England(2), soon after(2) I started(2) learning(2) English(2), my landlady(3) went shopping(2) and she came back with a big bag full of things, but she forgot(2) to buy some soup — she needed(2) a tin of tomato(3) soup. So I said, ‘T'll go to the shop and buy it for you,” because(2) I wanted(2) to be helpful(2) and it was a chance to practise(2) my English(2) a bit. So I went to the little(2) shop round the corner(2) and asked the shopkeeper(3) for tomato(3) soup. But he scemed surprised(2), he didn’t(2) understand(3), and I repeated(3) again(2) and again(2) ‘soup, tomato(3) soup’ until(2) he gave me some red soap, and I realised(2) I'd confused(2) ‘soup’ and ‘soap’ and I was asking(2) for ‘tomato(3) soap’. I felt terrible(3), I wanted(2) to run out of the shop, but my landlady(3) wanted(2) her soup, so I said, gave me the soup. I paid and went back to the house and said to the landlady(3), pronouncing(3) very(2) carefully(3), ‘Here's your soup, and I bought you this soap as a present(2),” and she said, ‘Ooh, thank you very much, that’s very(2) nice of you!”"
   }
  ],
  "audioTracks": [
   "CD3-Track01.mp3",
   "CD3-Track02.mp3",
   "CD3-Track03.mp3",
   "CD3-Track04.mp3",
   "CD3-Track05.mp3",
   "CD3-Track06.mp3"
  ],
  "trackRange": [
   1,
   6
  ]
 },
 {
  "id": "epu-u29",
  "unit": 29,
  "section": "B",
  "cd": "C",
  "title": "Wait a minute — where's the waiter?",
  "focus": "Strong and weak vowels",
  "sounds": [],
  "page": 66,
  "sentences": [
   "The weak sound in London and banana is /2/.",
   "ing) | have to go to London tomorrow.",
   "Would you like a banana?",
   "| have to go to London tomorrow.",
   "Where’s the waiter?",
   "Is this the way to the school?",
   "Can you wait a minute?"
  ],
  "words": [],
  "exercises": [
   {
    "n": "29.7",
    "prompt": "In the words below, * represents the weak vowel [a]. Write the words with their full spelling.",
    "answer": ""
   },
   {
    "n": "29.2",
    "prompt": "Look at the sentences below and find words and phrases in list 1 and list 2 with the same",
    "answer": "Where's the waiter? — Can you wait a minute? Nor at all. - You'll see a tall building on your left. Look in the cellar. - I'm trying to sell a house. It takes a long time. — Walk along the beach. Smoking isn’t allowed. — I heard a loud noise. I'd like to live in a newer house. — My father knew a lot about music."
   },
   {
    "n": "29.3",
    "prompt": "Write these words.",
    "answer": "1 America 2 sentence 3 different 4 mountain"
   }
  ],
  "audioTracks": [
   "CD3-Track07.mp3",
   "CD3-Track08.mp3",
   "CD3-Track09.mp3",
   "CD3-Track10.mp3",
   "CD3-Track11.mp3",
   "CD3-Track12.mp3"
  ],
  "trackRange": [
   7,
   12
  ]
 },
 {
  "id": "epu-u30",
  "unit": 30,
  "section": "B",
  "cd": "C",
  "title": "Single or return?",
  "focus": "Stress in two-syllable words",
  "sounds": [],
  "page": 68,
  "sentences": [],
  "words": [],
  "exercises": [
   {
    "n": "30.1",
    "prompt": "Listen and circle the word with different stress.",
    "answer": "1 afraid 2 better 3 police 4 correct 5 enjoy"
   },
   {
    "n": "30.2",
    "prompt": "Make words from these parts and write them in the correct column.",
    "answer": "words with first-syllable stress: longer turning sleeping words with second-syllable stress: asleep along return"
   },
   {
    "n": "40.3",
    "prompt": "All these phrases have five syllables. O is a stressed syllable and o is an unstressed syllable. Put the",
    "answer": "1 Icould (w) speak English when I was (w) twelve. Ido (s)."
   },
   {
    "n": "10.4",
    "prompt": "Put the stress mark ' in the correct place and write the word.",
    "answer": "1 coast 2 boot 3 woke"
   }
  ],
  "audioTracks": [
   "CD3-Track13.mp3",
   "CD3-Track14.mp3",
   "CD3-Track15.mp3",
   "CD3-Track16.mp3",
   "CD3-Track17.mp3",
   "CD3-Track18.mp3"
  ],
  "trackRange": [
   13,
   18
  ]
 },
 {
  "id": "epu-u31",
  "unit": 31,
  "section": "B",
  "cd": "C",
  "title": "Begin at the beginning",
  "focus": "Stress in longer words",
  "sounds": [],
  "page": 70,
  "sentences": [
   ". O is the stressed syllable and oo the unstressed syllables."
  ],
  "words": [],
  "exercises": [
   {
    "n": "31.1",
    "prompt": "Write these words.",
    "answer": "1 interview 2 museum 3 magazine 4 definitely"
   },
   {
    "n": "31.2",
    "prompt": "Listen and write the words in the correct column.",
    "answer": "Ooo 000 adjective eleven alphabet important cinema reception furniture remember grandmother tomorrow"
   },
   {
    "n": "31.3",
    "prompt": "Complete the sentences. Choose words with the correct stress from the box. You do not need all the",
    "answer": "1 We had a delicious meal on Saturday."
   },
   {
    "n": "31.4",
    "prompt": "Six months of the year have three or four syllables. Write them on the correct line.",
    "answer": "Oooo January February"
   }
  ],
  "audioTracks": [
   "CD3-Track19.mp3",
   "CD3-Track20.mp3",
   "CD3-Track21.mp3",
   "CD3-Track22.mp3",
   "CD3-Track23.mp3"
  ],
  "trackRange": [
   19,
   23
  ]
 },
 {
  "id": "epu-u32",
  "unit": 32,
  "section": "B",
  "cd": "C",
  "title": "Where's my checklist?",
  "focus": "Stress in compound words",
  "sounds": [],
  "page": 72,
  "sentences": [],
  "words": [],
  "exercises": [
   {
    "n": "32.1",
    "prompt": "Listen and circle the compound with different stress. In the example, both words are stressed in back",
    "answer": "1 half-price 2 second class 3 mobile phone 4 city centre"
   },
   {
    "n": "32.2",
    "prompt": "Make five compounds from these parts.",
    "answer": "earrings winebar handbag birthday present boyfriend A: Oh no, I can’t find my earrings! B: Have you looked in your handbag? A: Of course! B: Maybe you left them in that wine bar last night? A: Oh no, maybe I did! B: Are they important? A: Yes — they were a birthday present from my boyfriend! Checklist Havel ... Havel ... Havel..."
   },
   {
    "n": "32.3",
    "prompt": "Listen to the poem. The compounds are underlined. Circle the stressed part of each compound.",
    "answer": ""
   }
  ],
  "audioTracks": [
   "CD3-Track24.mp3",
   "CD3-Track25.mp3",
   "CD3-Track26.mp3",
   "CD3-Track27.mp3",
   "CD3-Track28.mp3"
  ],
  "trackRange": [
   24,
   28
  ]
 },
 {
  "id": "epu-u33",
  "unit": 33,
  "section": "C",
  "cd": "C",
  "title": "Phrases and pauses",
  "focus": "Reading aloud",
  "sounds": [],
  "page": 74,
  "sentences": [
   "to English, perhaps you think it’s difficult to understand because it’s too fast.",
   "FOR First, read this story, and make sure you understand it.",
   "lights, crashed into parked cars and drove along the pavement. And how old was his car? Only thirty."
  ],
  "words": [],
  "exercises": [
   {
    "n": "33.1",
    "prompt": "Listen to this story and mark the pauses like this: / .",
    "answer": "A few years ago / I read in a newspaper / that the staff at a library / in a small town in the west of England / had noticed / that the number of visitors to the library / was going down and down, understand this, / so they decided to do some research / to find out the reason. / They interviewed people / and asked them to fill in questionnaires / and so on. / And guess what they discovered. / The reason was / simply / that everybody had read all the books already! A few years ago / I read in a newspaper / that the staff at a library / in a small town in the west of England / had noticed / that the number of visitors to the library / was going down and down, understand this, / so they decided to do some research / to find out the reason. / They interviewed people / and asked them to fill in questionnaires / and so on. / And guess what they discovered. / The reason was / simply / that everybody had read all the books already!"
   },
   {
    "n": "33.2",
    "prompt": "Listen to this story and mark the pauses.",
    "answer": "This seems unbelievable / but it’s a true story / in fact. A farmer / was working in the fields / with his tractor. / The tractor crashed / and he fell out / and landed on the ground / unconscious. / As he fell, / his mobile phone / fell out of his pocket. / Soon after, / a bird that was flying around the fields / saw the phone / and started pecking it / with its beak. / Amazingly / it dialled the number This seems unbelievable / but it’s a true story / in fact. A farmer / was working in the fields / with his tractor. / The tractor crashed / and he fell out / and landed on the ground / unconscious. / As he fell, / his mobile phone / fell out of his pocket. / Soon after, / a bird that was flying around the fields / saw the phone / and started pecking it / with its beak. / Amazingly / it dialled the number"
   }
  ],
  "audioTracks": [
   "CD3-Track29.mp3",
   "CD3-Track30.mp3",
   "CD3-Track31.mp3"
  ],
  "trackRange": [
   29,
   31
  ]
 },
 {
  "id": "epu-u34",
  "unit": 34,
  "section": "C",
  "cd": "C",
  "title": "Speak it, write it, read it",
  "focus": "Linking words together 1",
  "sounds": [],
  "page": 76,
  "sentences": [
   "Switch it off!",
   "ing) Can we go back? My husband's forgotten _(h)is passport."
  ],
  "words": [],
  "exercises": [
   {
    "n": "34.1",
    "prompt": "Mark where you think there will be links between consonants and vowels.",
    "answer": "1 Choose the correct _answer and tick _it."
   },
   {
    "n": "34.2",
    "prompt": "Complete the sentences with the correct forms of the verbs.",
    "answer": "1 A: What do you think of yoga? B: I don’t know, I've never tried _it."
   },
   {
    "n": "34.3",
    "prompt": "Circle the /r/ sounds that you think will be pronounced. (See Unit 22.)",
    "answer": "1 Where are you going?"
   }
  ],
  "audioTracks": [
   "CD3-Track32.mp3",
   "CD3-Track33.mp3",
   "CD3-Track34.mp3",
   "CD3-Track35.mp3",
   "CD3-Track36.mp3",
   "CD3-Track37.mp3"
  ],
  "trackRange": [
   32,
   37
  ]
 },
 {
  "id": "epu-u35",
  "unit": 35,
  "section": "C",
  "cd": "C",
  "title": "Me and you, you and me",
  "focus": "Linking words together 2",
  "sounds": [],
  "page": 78,
  "sentences": [
   "Take the _leighth street on your left.",
   "And the _'eleventh on your right."
  ],
  "words": [],
  "exercises": [
   {
    "n": "35.1",
    "prompt": "Listen and complete the dialogues. Then mark the /j/ and /w/ links.",
    "answer": "1 A: Do you_“often go swimming? B: Not really, I 'only go “once or twice a month. S§ A: Try to_“answer soon. B: OK, I'll send you my ianswer by _lemail."
   },
   {
    "n": "35.2",
    "prompt": "Mark where you think there will be /j/ and /w/ links between words.",
    "answer": "11sit blue_Yor grey? ."
   },
   {
    "n": "35.3",
    "prompt": "Complete the answers to the questions and mark all the /j/ and /w/ links in the dialogues.",
    "answer": "1 A: Are you the new_“assistant? B: Yes, I_iam."
   }
  ],
  "audioTracks": [
   "CD3-Track38.mp3",
   "CD3-Track39.mp3",
   "CD3-Track40.mp3",
   "CD3-Track41.mp3",
   "CD3-Track42.mp3",
   "CD3-Track43.mp3"
  ],
  "trackRange": [
   38,
   43
  ]
 },
 {
  "id": "epu-u36",
  "unit": 36,
  "section": "C",
  "cd": "C",
  "title": "Take me to the show, Jo",
  "focus": "Rhythm",
  "sounds": [],
  "page": 80,
  "sentences": [
   "— Phrases have a rhythm of stressed and unstressed syllables, like words."
  ],
  "words": [
   "interview",
   "telephone",
   "photographic",
   "information",
   "forty-seven"
  ],
  "exercises": [
   {
    "n": "36.7",
    "prompt": "Read the phrases. Then listen and write 1 if the phrase has the pattern 0000, and 2 if it has the",
    "answer": ""
   },
   {
    "n": "36.2",
    "prompt": "Listen to this chant with this rhythm: 00000. Write in the missing words.",
    "answer": "Pass me the jam, Pam Wait in the queue, Sue See you again, Jen Leave it to me, Lee Over the hill, Bill Soon as you can, Van Almost forgot, Scott Lend me your pen, Ben Get a new job, Bob How do you feel, Neil?"
   },
   {
    "n": "36.3",
    "prompt": "Listen to this chant with this rhythm: 000000. Write in the missing words.",
    "answer": "Take me to the show, Jo Thank you for the food, Jude See you in the park, Mark Really like the hat, Pat See you on the train, Jane Always on the phone, Joan Have a glass of juice, Bruce."
   },
   {
    "n": "36.4",
    "prompt": "Listen and repeat these poems. Be careful to say them with the right rhythm.",
    "answer": ""
   }
  ],
  "audioTracks": [
   "CD3-Track44.mp3",
   "CD3-Track45.mp3",
   "CD3-Track46.mp3",
   "CD3-Track47.mp3",
   "CD3-Track48.mp3",
   "CD3-Track49.mp3"
  ],
  "trackRange": [
   44,
   49
  ]
 },
 {
  "id": "epu-u37",
  "unit": 37,
  "section": "C",
  "cd": "C",
  "title": "Hey, wait for me!",
  "focus": "Strong and weak forms 1: Pronouns",
  "sounds": [],
  "page": 82,
  "sentences": [
   "(he is strong) She doesn't smoke or drink. A: I'm afraid we can’t stay any longer. (we is weak) They told us to go this way."
  ],
  "words": [],
  "exercises": [
   {
    "n": "37.1",
    "prompt": "Listen and mark the underlined words w (weak) or s (strong).",
    "answer": ""
   },
   {
    "n": "37.2",
    "prompt": "Listen and complete the sentences.",
    "answer": "1 What do you think about it?"
   },
   {
    "n": "37.3",
    "prompt": "Listen and repeat this poem. Be careful to speak with the correct rhythm. Stress the words in bold,",
    "answer": ""
   }
  ],
  "audioTracks": [
   "CD3-Track50.mp3",
   "CD3-Track51.mp3",
   "CD3-Track52.mp3",
   "CD3-Track53.mp3"
  ],
  "trackRange": [
   50,
   53
  ]
 },
 {
  "id": "epu-u38",
  "unit": 38,
  "section": "C",
  "cd": "C",
  "title": "And what's his name?",
  "focus": "Strong and weak forms 2: Possessives, conjunctions, prepositions",
  "sounds": [],
  "page": 84,
  "sentences": [],
  "words": [],
  "exercises": [
   {
    "n": "38.1",
    "prompt": "Listen and mark the underlined words w (weak) or s (strong).",
    "answer": "1 They went out and (w) left their (w) children at (w) home."
   },
   {
    "n": "38.2",
    "prompt": "Read and listen to these poems. Then listen again and repeat. Be careful to speak with the correct",
    "answer": ""
   }
  ],
  "audioTracks": [
   "CD3-Track54.mp3",
   "CD3-Track55.mp3",
   "CD3-Track56.mp3"
  ],
  "trackRange": [
   54,
   56
  ]
 },
 {
  "id": "epu-u39",
  "unit": 39,
  "section": "C",
  "cd": "C",
  "title": "There's a spider",
  "focus": "Strong and weak forms 3: Articles, comparatives, 'there'",
  "sounds": [],
  "page": 86,
  "sentences": [
   "The new computer's better than the old one.",
   "The old computer wasn’t as good as the new one.",
   "There are ten millimetres in a centimetre. A: Where are my glasses? B: Over there!",
   "Over there!"
  ],
  "words": [],
  "exercises": [
   {
    "n": "39.7",
    "prompt": "Listen and circle the mistakes in ~~ ZL PERPLE.L tere Ala Ii Pi",
    "answer": ""
   },
   {
    "n": "39.2",
    "prompt": "Listen and circle all the [of sounds.",
    "answer": "Therels@cat on the mat. Theérels @ fish in @ dish. There's @ dog in the fog, and @ mouse in the house. Thérels @ film on TV. You can sit on my knee. There/are two cups of tea. One fobyou, one fopme."
   },
   {
    "n": "39.3",
    "prompt": "Complete the sentences using the words in the box. You will need to use some of them more than",
    "answer": "1 Tessa’ taller than Terry, but she isn’t as tall as Ted. B: The Channel Tunnel, between England and France? A: No, there’s a longer one than that. B: Is there, really? A: Yes, there is, in Japan. B: I think there are about one and a half ... or maybe there are one and a half pounds in a dollar?"
   },
   {
    "n": "39.4",
    "prompt": "Listen and mark the underlined words w (weak) or s (strong). ME",
    "answer": "A: What are(w) you(w) doing there(s)? B: There(w)’s a(w) spider in the room. A: Is there(w)? Where? B: There(s), look! A: No, there(w) isn’t! B: Yes, there(w) is! A: Well, actually, there(w) are(w) two — one there(s) and(w) one there(s)!"
   }
  ],
  "audioTracks": [
   "CD3-Track57.mp3",
   "CD3-Track58.mp3",
   "CD3-Track59.mp3",
   "CD3-Track60.mp3",
   "CD3-Track61.mp3",
   "CD3-Track62.mp3"
  ],
  "trackRange": [
   57,
   62
  ]
 },
 {
  "id": "epu-u40",
  "unit": 40,
  "section": "C",
  "cd": "C",
  "title": "Who was that?",
  "focus": "Strong and weak forms 4: Auxiliary verbs",
  "sounds": [],
  "page": 88,
  "sentences": [
   "2 It’s raining again. 8 Has the programme started?",
   "3 Are you coming? 9 What do you want for Christmas?",
   "4 You're coming, aren't you? 10 Where does your sister live?",
   "6 The shops were all closed. 12 Could you spell your name for me, please?",
   "9 A: Does the supermarket open on Sundays? B: I think it does.",
   "Is your father a teacher? Have we met before?"
  ],
  "words": [],
  "exercises": [
   {
    "n": "40.1",
    "prompt": "Listen, and notice the weak forms underlined. r= a 22 =3 “¥",
    "answer": ""
   },
   {
    "n": "40.2",
    "prompt": "Listen and mark the underlined words w (weak) or s (strong).",
    "answer": "A: Pm (w) better than you! B: No, you aren’t! A: 1am (s). Pve (w) got more toys than you! B: No, you haven't! A: Yes, I have (s)! And I can (w) speak twenty languages! B: You can’t! Nobody can (w) speak twenty languages! A: can (s). And I could (w) walk when I was (w) three weeks old! B: You couldn’! Thats impossible! A: could (s)! You don’t know — you weren't there! B: I was (s)! Pm older than you! A: No, you aren’t! B: Yes, I am (s)! I'm (w) eight. How old are (w) you? A: I'm (w) eight hundred. B: What do (w) you mean? Nobody can (w) be eight hundred years old! A: Don’t argue! B: I'm (w) not arguing! A: Yes, you are (s)!"
   },
   {
    "n": "40.3",
    "prompt": "Mark the underlined words w if you think they will be weak and s if you think they will be strong.",
    "answer": "1 Icould (w) speak English when I was (w) twelve. Ido (s)."
   }
  ],
  "audioTracks": [
   "CD3-Track63.mp3",
   "CD3-Track64.mp3",
   "CD3-Track65.mp3",
   "CD3-Track66.mp3",
   "CD3-Track67.mp3"
  ],
  "trackRange": [
   63,
   67
  ]
 },
 {
  "id": "epu-u41",
  "unit": 41,
  "section": "C",
  "cd": "C",
  "title": "They're here!",
  "focus": "Contractions",
  "sounds": [],
  "page": 90,
  "sentences": [],
  "words": [],
  "exercises": [],
  "audioTracks": [
   "CD3-Track68.mp3",
   "CD3-Track69.mp3",
   "CD3-Track70.mp3",
   "CD3-Track71.mp3",
   "CD3-Track72.mp3",
   "CD3-Track73.mp3"
  ],
  "trackRange": [
   68,
   73
  ]
 },
 {
  "id": "epu-u42",
  "unit": 42,
  "section": "C",
  "cd": "C",
  "title": "It's George's birthday",
  "focus": "Pronouncing -s endings",
  "sounds": [],
  "page": 92,
  "sentences": [
   "(goes | 1 Hit the ball and watch where it goes.",
   "igh 2 Viren dows te cour fr?",
   "(finishes | 3 | Do you know when the course finishes?",
   "If the last sound is a vowel, or any other consonant, the number of syllables stays the same.",
   "sh The foods good. The service js good.",
   "The games started. The match has started."
  ],
  "words": [],
  "exercises": [
   {
    "n": "42.1",
    "prompt": "Complete these sentences with the correct forms of the verbs and nouns.",
    "answer": "1 Let's see who finishes these exercises first."
   },
   {
    "n": "42.2",
    "prompt": "Look at the family tree and complete the sentences.",
    "answer": "1 Joyce and Mike are Dennis's parents. / Joyce and Mike are Dennis's mother and father. son and daughter."
   },
   {
    "n": "42.3",
    "prompt": "Look at the picture and answer the questions below.",
    "answer": "1 Charles's 7 The camera’s Charles's."
   }
  ],
  "audioTracks": [
   "CD3-Track74.mp3",
   "CD3-Track75.mp3",
   "CD3-Track76.mp3",
   "CD3-Track77.mp3",
   "CD3-Track78.mp3"
  ],
  "trackRange": [
   74,
   78
  ]
 },
 {
  "id": "epu-u43",
  "unit": 43,
  "section": "C",
  "cd": "C",
  "title": "I looked everywhere",
  "focus": "Pronouncing past tenses",
  "sounds": [],
  "page": 94,
  "sentences": [
   "Wait here, please.",
   "We waited half an hour.",
   "I hated school.",
   "We lived) near the park."
  ],
  "words": [],
  "exercises": [
   {
    "n": "43.1",
    "prompt": "Listen and mark the verbs with a tick (v) if you can hear the -ed ending clearly, and a cross (X) if",
    "answer": "1 I watched an interesting film. v 5 1 phoned the police. X"
   },
   {
    "n": "43.2",
    "prompt": "Listen and circle the word you hear.",
    "answer": "1 They played very well. 5 1listened to the radio."
   },
   {
    "n": "43.3",
    "prompt": "Listen and complete these sentences with the verb form you hear - present or past.",
    "answer": "1 We usually finished before the others. 5 1 loved the music in the film."
   },
   {
    "n": "43.4",
    "prompt": "Listen to thi ; —",
    "answer": ""
   }
  ],
  "audioTracks": [
   "CD3-Track79.mp3",
   "CD3-Track80.mp3",
   "CD3-Track81.mp3",
   "CD3-Track82.mp3",
   "CD3-Track83.mp3",
   "CD3-Track84.mp3",
   "CD3-Track85.mp3"
  ],
  "trackRange": [
   79,
   85
  ]
 },
 {
  "id": "epu-u44",
  "unit": 44,
  "section": "D",
  "cd": "D",
  "title": "Not half past two, half past three",
  "focus": "Intonation for old and new information",
  "sounds": [],
  "page": 96,
  "sentences": [
   "the old information with the same words but different intonation. Listen. A: What time are we meeting? Did you say half past two?",
   "old information in different words. Listen. B: Yes, it's expepve, but everything in this shop's expefive! A: 1 thought that film was really Regd. B: Well, I thought the mus was good."
  ],
  "words": [],
  "exercises": [
   {
    "n": "4.7",
    "prompt": "Listen and mark the intonation of the words in bold.",
    "answer": ""
   },
   {
    "n": "14.2",
    "prompt": "Listen and mark the intonation of the words in bold.",
    "answer": "1 A fine view 2 Driving too fast 3 Knives and forks"
   }
  ],
  "audioTracks": [
   "CD4-Track01.mp3",
   "CD4-Track02.mp3",
   "CD4-Track03.mp3",
   "CD4-Track04.mp3",
   "CD4-Track05.mp3",
   "CD4-Track06.mp3"
  ],
  "trackRange": [
   1,
   6
  ]
 },
 {
  "id": "epu-u45",
  "unit": 45,
  "section": "D",
  "cd": "D",
  "title": "And suddenly ...",
  "focus": "Intonation in storytelling",
  "sounds": [],
  "page": 98,
  "sentences": [
   "1 [ was walking along the steocl one day, and I saw a wallet on the paverent.",
   "2 [ was waiting for the busWesterday, and I heard an explgsion.",
   "4 | was watching the new€ one night, and I saw miyeglf in the shogging centre.",
   "1 I was walking along the stredl one day, and I saw a wallgt on the pavemgnt.",
   "2 | was waiting for the byufyesterday, and I heard an expiqgion.",
   "3 I was lying in bedlast night, and I heard a knock at the dogg.",
   "4 1 was watching the ne one night, and I saw nysglf in the shoppigg centre.",
   "and repeat. Then speak together with the recording.",
   "2 1 was waiting for the bud¥yesterday, as usd, and suddfaly I heard an explggion.",
   "3 I was lying in bedWast night, round about midnight, and I heard a knock at the dogg.",
   "4 | was watching the newt one night, and suddly I saw miysglf in the shisgping centre."
  ],
  "words": [],
  "exercises": [
   {
    "n": "45.1",
    "prompt": "Listen and notice the intonation.",
    "answer": ""
   },
   {
    "n": "45.2",
    "prompt": "Listen and repeat.",
    "answer": ""
   }
  ],
  "audioTracks": [
   "CD4-Track07.mp3",
   "CD4-Track08.mp3",
   "CD4-Track09.mp3",
   "CD4-Track10.mp3"
  ],
  "trackRange": [
   7,
   10
  ]
 },
 {
  "id": "epu-u46",
  "unit": 46,
  "section": "D",
  "cd": "D",
  "title": "Really? That's amazing!",
  "focus": "Being a good listener",
  "sounds": [],
  "page": 100,
  "sentences": [
   "I was walking along the si one day, on Toesdy, I think, and I saw a wallgt on the pre.",
   "Or Sor®? What did you deg That's gregt!",
   "Reflly? WAX did you say? What happeged? That's ainaging!",
   "Wait? Yr That's tersiple!",
   "ing. Listen and notice the intonation in B's sentences. A: | saw a wallgt on the pavemgnt.",
   "and a phqgo, and I looked at the pho and sudddfly I thought: 1 Rng hid! B: Really? A: It was an old friend from schgol, you se&and the last time I sawthim was yeagg ago.",
   "again and say B’s part, together with the recording."
  ],
  "words": [],
  "exercises": [
   {
    "n": "46.1",
    "prompt": "Fill the aaps with the phrases in the box.",
    "answer": "1 A:1was lying in bedlast night, round about midnight, and I heard a knock at the dogr. B: OW What did you do. A: Well, I went downstails ... B: Dill you? A: Yeg, and I thought Whats tha!? B: Sor%? A: I'said I saw myself, on TY! B: That's amazing! B: Oh, ng! That's terrible! B: Why? What happeted? A: Well, first the bug was late, then ... B: Yes? A: And I heard a sort of loud noise in the water ..."
   },
   {
    "n": "46.2",
    "prompt": "Fill the gaps with phrases from B on page 100 opposite. ry \\",
    "answer": "A:1was lying in bed'last night, round about midnight, and I heard a knock at the door. B: OW? Did’you? A: Yes, and I thought, ‘That's unustal.’ B: What did you dg? A: Well, I went downstaiFs, and looked through the windSw, and it was darK; of cousSe, but I could see a bus in the street, with its ligiffs off and no passengers, and a man standing at my door, with a sort of official-looking cap on his head. B: Sorry? A:A cap, you kndWw, like bus drivers wear. B: Oh, I seg, What happened? A: Well, I opened the dodr, and he said, ‘Mr JohaSon?’, and I said, *Yé§>* And he said, ‘Here's your wallet. I finished work at midsfight and I found it on my bug.’ What do you think about thag? B: That's amazing!"
   }
  ],
  "audioTracks": [
   "CD4-Track11.mp3",
   "CD4-Track12.mp3",
   "CD4-Track13.mp3",
   "CD4-Track14.mp3"
  ],
  "trackRange": [
   11,
   14
  ]
 },
 {
  "id": "epu-u47",
  "unit": 47,
  "section": "D",
  "cd": "D",
  "title": "I know when it is, but not where",
  "focus": "Important words in conversation 1",
  "sounds": [],
  "page": 102,
  "sentences": [
   "A: How good’s your English? B: Well, I can spe English quite well, but I can’t Wege it very well. A: Do you know any foreign languages? B: Well, I can speak Engi, but that’s the only foreign language I know. A: Is your house number thirty-two? B: No, it's the next one, number thirty-foyg. A: Is your house number thirty-two?",
   "Is your house number 32?"
  ],
  "words": [],
  "exercises": [
   {
    "n": "47.1",
    "prompt": "Listen to each dialogue twice. The first time you listen, underline the two main stressed words in B's",
    "answer": "1 A: How was the match? B: The first half was quit€ good, but the second half was really good. B: The first half was quite good, but the second half was terrible. B: I won't be here tomorrow, but my colleague will be. B: I won't be here tomorow, but I'll be back on Thursday. B: I've seer it, but I can’t remember much about it. B: I havén't seen it, but I'd like to. B: I know what this word meals, but I don’t know how to pronqunce it. B: I know what this word means, but I don’t know any of the others! B: 1 liked the film, but I didn’t really understand it. B: I liked the fila, but the seats were sO uncomfortable! B: I'd like to go to Britain for a month, but not for a year. B: I'd like to go to Britaln, but I'd rather 80 to America."
   },
   {
    "n": "47.2",
    "prompt": "Listen and underline the stressed word or words in B's part of each dialogue. Then listen again and",
    "answer": "1 A: What's the answer — three hundred and eighty-five? B: No — three hundred and ninety-five. B: No — after yoy, B: 1 didn't go Sith him — I meg him there. B: Well, nos really inTondon, just outside. B: No, I said go under the bridge. B: Well, nearly fifty, I think. B: I can’t spegk Italian. B: I've nevgr been to England. B: Well, my school paid for the courd®, but the traygl cost quite a lot. B: You'll need ar leagg fifty."
   }
  ],
  "audioTracks": [
   "CD4-Track15.mp3",
   "CD4-Track16.mp3",
   "CD4-Track17.mp3",
   "CD4-Track18.mp3"
  ],
  "trackRange": [
   15,
   18
  ]
 },
 {
  "id": "epu-u48",
  "unit": 48,
  "section": "D",
  "cd": "D",
  "title": "Finished? I've just started!",
  "focus": "Important words in conversation 2",
  "sounds": [],
  "page": 104,
  "sentences": [
   "I've just Sted it!",
   "Finished: startgd!!",
   "Finjdhed> Ive just started it!",
   "to two people arguing. Notice the intonation they use, especially on the words in bold. A: We said tWQ! You're always late! B: Last time you were late! Remember?"
  ],
  "words": [],
  "exercises": [
   {
    "n": "48.1",
    "prompt": "Listen and underline the specially emphasised words in B's replies. Then listen again and mark the",
    "answer": "1 A: Do you like westerns? B: mE I can’t stand westerns! B: Really? I don't beligye it! B: The firsf — and probably the last! B: M& I've never beep here before! B: Don't ask mé{ I'm hopeless with numbers! B: Two fife? That's ridiculous! B: Busi? They were almost empty! B: Lik€ i? I think it's awful!"
   },
   {
    "n": "48.2",
    "prompt": "Listen to the telephone conversation between John Watt and Will Knott.",
    "answer": ""
   }
  ],
  "audioTracks": [
   "CD4-Track19.mp3",
   "CD4-Track20.mp3",
   "CD4-Track21.mp3",
   "CD4-Track22.mp3"
  ],
  "trackRange": [
   19,
   22
  ]
 },
 {
  "id": "epu-u49",
  "unit": 49,
  "section": "D",
  "cd": "D",
  "title": "No, thanks, I'm just looking",
  "focus": "Intonation in phrases and sentences 1",
  "sounds": [],
  "page": 106,
  "sentences": [
   "A: Are you ready? B: Pm nearly ready. Is it warin? B: Is it raining? A: Slightly. Do you want your umbrella? B: Thanks. A: Are you ready?"
  ],
  "words": [],
  "exercises": [
   {
    "n": "49.3",
    "prompt": "Listen and mark the intonation on the stressed words a», * or. 7.",
    "answer": "A: Excuse me?” B: Yes? A: Can you tell me the way to the statin, pleale? B: Yes, you just go along this road, cross the bridge over the rivér and there's a big park on your left, you knoW? Well, you go through the park and the statiof’s just on the other sidg. Asls it far? B: Np, not very't far. A: OK, so I go along this road, cross the bridge and through the park — right? B: That's right. A: Thanks very mugh. B: You're welcome. Byd. A: Bye!"
   },
   {
    "n": "49.4",
    "prompt": "Listen and mark the intonation on the stressed words a, 7” or 7",
    "answer": "A: All righe? B: Yes, A: Not nervdus? B: Abit” A: Don’t wordy. It'll be fing. B: I hop so. A: Right. Let's stagt. Are you ready? B: 1 think so. A: OK. The first question is”... What's your name? B: My nani€? ... Its ... Jack Johnson. A: That's right! Well dong! Difficult? B: Weil, not to0'bad. A: Right. The seco question is ... What's 37,548 x 7,7262 B: What!"
   }
  ],
  "audioTracks": [
   "CD4-Track23.mp3",
   "CD4-Track24.mp3",
   "CD4-Track25.mp3",
   "CD4-Track26.mp3"
  ],
  "trackRange": [
   23,
   26
  ]
 },
 {
  "id": "epu-u50",
  "unit": 50,
  "section": "D",
  "cd": "D",
  "title": "Fine, thanks",
  "focus": "Intonation in phrases and sentences 2",
  "sounds": [],
  "page": 108,
  "sentences": [
   "Tr itwas! usually sit? ofcourse! maybe really? [thinkso did you?",
   "and answer, using the same phrases. Different answers are possible.",
   "108 English Pronunciation in Use (EX ) Could you help me, please?"
  ],
  "words": [],
  "exercises": [
   {
    "n": "50.20",
    "prompt": "Listen to the intonation and put the words and phrases in the box into the correct column.",
    "answer": ""
   },
   {
    "n": "50.4",
    "prompt": "Listen and repeat.",
    "answer": ""
   }
  ],
  "audioTracks": [
   "CD4-Track27.mp3",
   "CD4-Track28.mp3",
   "CD4-Track29.mp3",
   "CD4-Track30.mp3"
  ],
  "trackRange": [
   27,
   30
  ]
 }
]; }

function EPI_SECTION_E() { return [
 {
  "id": "epu-e1",
  "ref": "E1",
  "page": 110,
  "cd": "D",
  "title": "Chart of phonemic symbols",
  "desc": "Bảng âm vị của tiếng Anh kèm từ ví dụ. Nghe các từ ví dụ trên CD4 (D31a–D31d).",
  "audioTracks": [
   "CD4-Track31.mp3"
  ],
  "groups": [
   {
    "label": "Short vowels",
    "symbol": "/ɪ/ /e/ /æ/ /ʌ/ /ɒ/ /ʊ/ /ə/ /i/",
    "items": [
     "/ɪ/ swim, building",
     "/e/ red, bread, friend, any, said",
     "/æ/ can, map",
     "/ʌ/ son, sun",
     "/ɒ/ clock, hot",
     "/ʊ/ full, book",
     "/ə/ about, excellent, letter, doctor, sugar",
     "/i/ happy"
    ]
   },
   {
    "label": "Long vowels",
    "symbol": "/iː/ /ɑː/ /ɔː/ /uː/ /ɜː/",
    "items": [
     "/iː/ tree, seat, field, secret, kilo",
     "/ɑː/ can’t, bar, half",
     "/ɔː/ wall, talk, saw, daughter, bought, warm",
     "/uː/ too, group, blue",
     "/ɜː/ bird, work, turn, learn, verb"
    ]
   },
   {
    "label": "Diphthongs",
    "symbol": "/ɪə/ /eə/ /eɪ/ /aɪ/ /ɔɪ/ /əʊ/ /aʊ/",
    "items": [
     "/ɪə/ real, hear, beer, here",
     "/eə/ care, hair, wear, where",
     "/eɪ/ came, rain, say, great, weight",
     "/aɪ/ time, dry, high, buy",
     "/ɔɪ/ point, toy",
     "/əʊ/ cold, home, slow, boat",
     "/aʊ/ now, sound"
    ]
   },
   {
    "label": "Consonants",
    "symbol": "/p/ /b/ /t/ /d/ /k/ /g/ /f/ /v/ /θ/ /ð/ /s/ /z/ /ʃ/ /ʒ/ /tʃ/ /dʒ/ /m/ /n/ /ŋ/ /l/ /r/ /h/ /j/ /w/",
    "items": [
     "/b/ baby, job",
     "/d/ do, reading, add",
     "/f/ foot, café, off, phone",
     "/g/ go, bigger, bag",
     "/h/ hand, who",
     "/j/ yes",
     "/k/ cold, talking, black",
     "/l/ leave, yellow, fill",
     "/m/ more, summer, comb",
     "/n/ now, dinner, gone, know",
     "/p/ pen, stopping, help",
     "/r/ red, sorry, write",
     "/s/ sister, glass, place, scissors",
     "/t/ ten, better, eight, washed",
     "/v/ view, every, five",
     "/w/ well, away, white",
     "/z/ zero, roses, scissors, jazz",
     "/ʃ/ shop, washing, cash, machine, sure, national",
     "/ʒ/ television, usually",
     "/tʃ/ choose, which, future",
     "/dʒ/ jeans, larger, fridge",
     "/ŋ/ thing, bank, singer",
     "/θ/ thank, north",
     "/ð/ then, mother, with"
    ]
   }
  ]
 },
 {
  "id": "epu-e2",
  "ref": "E2",
  "page": 111,
  "cd": null,
  "title": "Guide for speakers of specific languages",
  "desc": "Nếu bạn là người bản ngữ của một trong các ngôn ngữ sau, hãy ưu tiên luyện các Sound pairs tương ứng (xem E3).",
  "audioTracks": [],
  "groups": [
   {
    "label": "Arabic",
    "items": [
     "3, 11, 13, 16, 23, 25, 27, 28, 29, 33, 34, 37"
    ]
   },
   {
    "label": "Chinese",
    "items": [
     "1, 4, 7, 9, 10, 11, 13, 15, 23, 26, 27, 28, 29, 30, 31, 33, 36, 37"
    ]
   },
   {
    "label": "Dravidian languages e.g. Tamil",
    "items": [
     "1, 4, 7, 11, 12, 13, 17, 23, 24, 26, 27, 28, 31, 34"
    ]
   },
   {
    "label": "Dutch",
    "items": [
     "1, 3, 4, 5, 8, 10, 12, 14, 15, 26, 28, 29, 30, 31, 32, 33"
    ]
   },
   {
    "label": "Farsi",
    "items": [
     "1, 4, 11, 13, 15, 17, 20, 27, 34"
    ]
   },
   {
    "label": "French",
    "items": [
     "1, 4, 7, 9, 10, 12, 15, 16, 23, 26, 27, 28, 29, 30, 31, 33, 37"
    ]
   },
   {
    "label": "German",
    "items": [
     "10, 12, 15, 21, 23, 26, 28, 29, 30, 31"
    ]
   },
   {
    "label": "Greek",
    "items": [
     "1, 2, 4, 7, 9, 11, 12, 13, 15, 17, 31, 32, 33, 34, 37"
    ]
   },
   {
    "label": "Italian",
    "items": [
     "1, 9, 11, 12, 13, 15, 16, 23, 26, 27, 28, 29, 31"
    ]
   },
   {
    "label": "Japanese",
    "items": [
     "9, 12, 20, 25, 30, 32, 34, 35, 36"
    ]
   },
   {
    "label": "Korean",
    "items": [
     "1, 4, 11, 12, 13, 14, 15, 17, 23, 24, 26, 27, 28, 29, 30, 31, 32, 36"
    ]
   },
   {
    "label": "Malay / Indonesian",
    "items": [
     "1, 4, 13, 15, 23, 24, 26, 27, 28, 29, 31, 32, 33"
    ]
   },
   {
    "label": "Polish",
    "items": [
     "1, 5, 6, 12, 13, 14, 20, 23, 24, 25, 27, 28, 29, 30, 31, 32, 33, 36"
    ]
   },
   {
    "label": "Portuguese",
    "items": [
     "1, 4, 5, 6, 7, 8, 11, 12, 13, 17, 20, 23, 26, 28, 29, 30, 31, 33"
    ]
   },
   {
    "label": "Russian",
    "items": [
     "1, 4, 11, 13, 14, 15, 19, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33"
    ]
   },
   {
    "label": "Spanish",
    "items": [
     "1, 4, 5, 6, 7, 8, 11, 12, 13, 14, 17, 20, 23, 26, 28, 29, 30, 31, 33, 36"
    ]
   },
   {
    "label": "Swedish",
    "items": [
     "1, 3, 4, 5, 8, 12, 13, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31"
    ]
   },
   {
    "label": "Turkish",
    "items": [
     "1, 5, 6, 12, 13, 14, 15, 16, 17, 20, 23, 26, 27, 28, 29, 30, 31, 32, 33, 37"
    ]
   }
  ]
 },
 {
  "id": "epu-e3",
  "ref": "E3",
  "page": 113,
  "cd": "E",
  "title": "Sound pairs",
  "desc": "37 cặp âm dễ nhầm. Nghe trên CD5: Sound pair N nằm ở track N+1 (E2–E38).",
  "audioTracks": [
   "CD5-Track01.mp3"
  ],
  "pairs": [
   {
    "n": 1,
    "a": "/ɪz/",
    "b": "/ɪ/",
    "audio": "CD5-Track02.mp3"
   },
   {
    "n": 2,
    "a": "/iː/",
    "b": "/ɪə/",
    "audio": "CD5-Track03.mp3"
   },
   {
    "n": 3,
    "a": "/ɪ/",
    "b": "/e/",
    "audio": "CD5-Track04.mp3"
   },
   {
    "n": 4,
    "a": "/uː/",
    "b": "/ʊ/",
    "audio": "CD5-Track05.mp3"
   },
   {
    "n": 5,
    "a": "/ʊ/",
    "b": "/ʌ/",
    "audio": "CD5-Track06.mp3"
   },
   {
    "n": 6,
    "a": "/uː/",
    "b": "/əʊ/",
    "audio": "CD5-Track07.mp3"
   },
   {
    "n": 7,
    "a": "/æ/",
    "b": "/ɑː/",
    "audio": "CD5-Track08.mp3"
   },
   {
    "n": 8,
    "a": "/ɑː/",
    "b": "/ɔː/",
    "audio": "CD5-Track09.mp3"
   },
   {
    "n": 9,
    "a": "/æ/",
    "b": "/ʌ/",
    "audio": "CD5-Track10.mp3"
   },
   {
    "n": 10,
    "a": "/ʌ/",
    "b": "/ɒ/",
    "audio": "CD5-Track11.mp3"
   },
   {
    "n": 11,
    "a": "/ɒ/",
    "b": "/əʊ/",
    "audio": "CD5-Track12.mp3"
   },
   {
    "n": 12,
    "a": "/əʊ/",
    "b": "/ɔː/",
    "audio": "CD5-Track13.mp3"
   },
   {
    "n": 13,
    "a": "/ɒ/",
    "b": "/ɔː/",
    "audio": "CD5-Track14.mp3"
   },
   {
    "n": 14,
    "a": "/ɔː/",
    "b": "/ɜː/",
    "audio": "CD5-Track15.mp3"
   },
   {
    "n": 15,
    "a": "/e/",
    "b": "/æ/",
    "audio": "CD5-Track16.mp3"
   },
   {
    "n": 16,
    "a": "/e/",
    "b": "/eɪ/",
    "audio": "CD5-Track17.mp3"
   },
   {
    "n": 17,
    "a": "/e/",
    "b": "/ɜː/",
    "audio": "CD5-Track18.mp3"
   },
   {
    "n": 18,
    "a": "/e/",
    "b": "/ʌ/",
    "audio": "CD5-Track19.mp3"
   },
   {
    "n": 19,
    "a": "/ɜː/",
    "b": "/æ/",
    "audio": "CD5-Track20.mp3"
   },
   {
    "n": 20,
    "a": "/ɜː/",
    "b": "/ɪə/",
    "audio": "CD5-Track21.mp3"
   },
   {
    "n": 21,
    "a": "/eə/",
    "b": "/eɪ/",
    "audio": "CD5-Track22.mp3"
   },
   {
    "n": 22,
    "a": "/aɪ/",
    "b": "/eɪ/",
    "audio": "CD5-Track23.mp3"
   },
   {
    "n": 23,
    "a": "/p/",
    "b": "/b/",
    "audio": "CD5-Track24.mp3"
   },
   {
    "n": 24,
    "a": "/p/",
    "b": "/f/",
    "audio": "CD5-Track25.mp3"
   },
   {
    "n": 25,
    "a": "/t/",
    "b": "/tʃ/",
    "audio": "CD5-Track26.mp3"
   },
   {
    "n": 26,
    "a": "/t/",
    "b": "/d/",
    "audio": "CD5-Track27.mp3"
   },
   {
    "n": 27,
    "a": "/t/",
    "b": "/θ/",
    "audio": "CD5-Track28.mp3"
   },
   {
    "n": 28,
    "a": "/k/",
    "b": "/g/",
    "audio": "CD5-Track29.mp3"
   },
   {
    "n": 29,
    "a": "/f/",
    "b": "/v/",
    "audio": "CD5-Track30.mp3"
   },
   {
    "n": 30,
    "a": "/s/",
    "b": "/θ/",
    "audio": "CD5-Track31.mp3"
   },
   {
    "n": 31,
    "a": "/s/",
    "b": "/z/",
    "audio": "CD5-Track32.mp3"
   },
   {
    "n": 32,
    "a": "/s/",
    "b": "/ʃ/",
    "audio": "CD5-Track33.mp3"
   },
   {
    "n": 33,
    "a": "/ʃ/",
    "b": "/tʃ/",
    "audio": "CD5-Track34.mp3"
   },
   {
    "n": 34,
    "a": "/n/, /ŋ/",
    "b": "/ŋk/",
    "audio": "CD5-Track35.mp3"
   },
   {
    "n": 35,
    "a": "/m/, /n/",
    "b": "/ŋ/",
    "audio": "CD5-Track36.mp3"
   },
   {
    "n": 36,
    "a": "/l/",
    "b": "/r/",
    "audio": "CD5-Track37.mp3"
   },
   {
    "n": 37,
    "a": "/h/",
    "b": "/–/",
    "audio": "CD5-Track38.mp3"
   }
  ]
 },
 {
  "id": "epu-e4",
  "ref": "E4",
  "page": 127,
  "cd": "D",
  "title": "From spelling to sound",
  "desc": "Cách đọc chính tả → âm. Nghe trên CD4 (D32–D33).",
  "audioTracks": [
   "CD4-Track32.mp3",
   "CD4-Track33.mp3"
  ],
  "groups": [
   {
    "label": "Commonest spellings",
    "items": [
     "a → /æ/ (cat, map) — c → /k/, g → /ɡ/, l → /l/, m → /m/, n → /n/, p → /p/, r → /r/, s → /s/, t → /t/, v → /v/, w → /w/",
     "b → /b/ (big) — d → /d/ (do), f → /f/ (for), h → /h/ (hot), i → /ɪ/ (sit), j → /dʒ/ (job), k → /k/ (king), q → /kw/ (quick)",
     "o → /ɒ/ (hot) — u → /ʌ/ (cup), x → /ks/ (box), y → /j/ (yes), z → /z/ (zoo), th → /θ/ (thin), ch → /tʃ/ (chair), sh → /ʃ/ (ship)"
    ]
   }
  ]
 },
 {
  "id": "epu-e5",
  "ref": "E5",
  "page": 130,
  "cd": "D",
  "title": "The alphabet",
  "desc": "Cách phát âm bảng chữ cái: /eɪ/ (A, B, C…), /iː/ (E, F, L…), /ɑː/ (H, M, N…)… Nghe trên CD4 (D34–D39).",
  "audioTracks": [
   "CD4-Track34.mp3",
   "CD4-Track35.mp3",
   "CD4-Track36.mp3",
   "CD4-Track37.mp3",
   "CD4-Track38.mp3",
   "CD4-Track39.mp3"
  ],
  "groups": [
   {
    "label": "Letter names",
    "items": [
     "/eɪ/ — A, B, C, D, E, G, P, T, V",
     "/iː/ — E, F, I, L, M, N, S, X",
     "/ɑː/ — H, O, R",
     "/juː/ — U, W, Q",
     "/ɑːr/ — are, R",
     "/zɛd/ — Z,zed; /dʒiː/ — G, gee"
    ]
   }
  ]
 },
 {
  "id": "epu-e6",
  "ref": "E6",
  "page": 132,
  "cd": "D",
  "title": "Pronouncing numbers",
  "desc": "Cách đọc số: trăm/nghìn, số trên 100, năm, số điện thoại, nhiệt độ, phân số, thập phân, phần trăm. Nghe trên CD4 (D40–D52).",
  "audioTracks": [
   "CD4-Track40.mp3",
   "CD4-Track41.mp3",
   "CD4-Track42.mp3",
   "CD4-Track43.mp3",
   "CD4-Track44.mp3",
   "CD4-Track45.mp3",
   "CD4-Track46.mp3",
   "CD4-Track47.mp3",
   "CD4-Track48.mp3",
   "CD4-Track49.mp3",
   "CD4-Track50.mp3",
   "CD4-Track51.mp3",
   "CD4-Track52.mp3"
  ],
  "groups": [
   {
    "label": "Hundreds / thousands / millions",
    "items": [
     "100 — a hundred",
     "1,000 — a thousand",
     "1,000,000 — a million"
    ]
   },
   {
    "label": "Numbers over 100",
    "items": [
     "101 — a hundred and one",
     "350 — three hundred and fifty",
     "529 — five hundred and twenty-nine",
     "2,491 — two thousand, four hundred and ninety-one",
     "7,512 — seven thousand, five hundred and twelve",
     "27,403 — twenty-seven thousand, four hundred and three"
    ]
   },
   {
    "label": "Years",
    "items": [
     "1764 — seventeen sixty-four",
     "1890 — eighteen ninety",
     "1900 — nineteen hundred",
     "1907 — nineteen oh seven",
     "2000 — two thousand",
     "2007 — two thousand and seven"
    ]
   },
   {
    "label": "Telephone numbers",
    "items": [
     "01425 — oh one four two five",
     "365 7098 — three six five, seven oh nine eight",
     "0609 655 400 — oh six oh nine, six double five, four double oh"
    ]
   },
   {
    "label": "Temperatures",
    "items": [
     "14° — fourteen degrees",
     "0° — zero",
     "–12° — minus twelve (degrees) / twelve (degrees) below zero"
    ]
   },
   {
    "label": "Ordinal numbers",
    "items": [
     "1st — first",
     "2nd — second",
     "3rd — third",
     "4th — fourth",
     "5th — fifth",
     "13th — thirteenth",
     "15th — fifteenth",
     "20th — twentieth",
     "21st — twenty-first",
     "22nd — twenty-second",
     "23rd — twenty-third",
     "24th — twenty-fourth",
     "31st — thirty-first",
     "52nd — fifty-second"
    ]
   },
   {
    "label": "Dates",
    "items": [
     "22 May — May the twenty-second / the twenty-second of May / May twenty-second (AmE)",
     "13 January — January the thirteenth / the thirteenth of January",
     "30 January — January the thirtieth / the thirtieth of January"
    ]
   },
   {
    "label": "Fractions",
    "items": [
     "½ — a half",
     "¼ — a quarter",
     "¾ — three quarters",
     "⅓ — a third",
     "⅔ — two thirds",
     "⅛ — an eighth",
     "⅝ — five eighths",
     "a fourth / three fourths (AmE)"
    ]
   },
   {
    "label": "Decimals",
    "items": [
     "1.6 — one point six",
     "23.95 — twenty-three point nine five",
     "0.762 — nought point seven six two / zero point seven six two (AmE)"
    ]
   },
   {
    "label": "Percentages",
    "items": [
     "1% — one per cent",
     "50% — fifty per cent",
     "67.3% — sixty-seven point three per cent"
    ]
   }
  ]
 },
 {
  "id": "epu-e7",
  "ref": "E7",
  "page": 135,
  "cd": "D",
  "title": "Pronouncing geographical names",
  "desc": "Cách đọc tên địa danh (danh từ + tính từ, ví dụ Italian /Iˈtæliən/). Nghe trên CD4 (D53–D54).",
  "audioTracks": [
   "CD4-Track53.mp3",
   "CD4-Track54.mp3"
  ],
  "groups": [
   {
    "label": "Common patterns",
    "items": [
     "Italian — /Iˈtæliən/, Italian city — /Iˈtæliən ˈsɪti/",
     "French — /ˈfrentʃ/, French city — /ˈfrentʃ ˈsɪti/",
     "English — /ˈɪŋɡlɪʃ/, English man — /ˈɪŋɡlɪʃ mæn/",
     "Adjective thường phát âm giống danh từ: Italian /Iˈtæliən/ → Italian town"
    ]
   }
  ]
 },
 {
  "id": "epu-e8",
  "ref": "E8",
  "page": 137,
  "cd": "D",
  "title": "Homophones",
  "desc": "Các từ đồng âm khác nghĩa. Nghe trên CD4 (D55).",
  "audioTracks": [
   "CD4-Track55.mp3"
  ],
  "groups": [
   {
    "label": "Common homophones",
    "items": [
     "air /eə/ – heir /eə/",
     "ate /eɪt/ – eight /eɪt/",
     "be /biː/ – bee /biː/",
     "buy /baɪ/ – by /baɪ/",
     "cell /sel/ – sell /sel/",
     "cent /sent/ – sent /sent/",
     "dear /dɪə/ – deer /dɪə/",
     "fair /feə/ – fare /feə/",
     "flower /ˈflaʊə/ – flour /ˈflaʊə/",
     "for /fɔː/ – four /fɔː/",
     "hair /heə/ – hare /heə/",
     "hear /hɪə/ – here /hɪə/",
     "hour /ˈaʊə/ – our /ˈaʊə/",
     "know /nəʊ/ – no /nəʊ/",
     "meat /miːt/ – meet /miːt/",
     "one /wʌn/ – won /wʌn/",
     "pair /peə/ – pear /peə/",
     "plain /pleɪn/ – plane /pleɪn/",
     "right /raɪt/ – write /raɪt/",
     "sea /siː/ – see /siː/",
     "son /sʌn/ – sun /sʌn/",
     "to /tuː/ – too /tuː/",
     "two /tuː/ – too /tuː/",
     "wear /weə/ – where /weə/",
     "weather /ˈweðə/ – whether /ˈweðə/",
     "which /wɪtʃ/ – witch /wɪtʃ/"
    ]
   }
  ]
 }
]; }
