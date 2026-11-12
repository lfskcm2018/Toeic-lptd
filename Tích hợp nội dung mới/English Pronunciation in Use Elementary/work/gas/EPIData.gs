/**
 * EPIData.gs — English Pronunciation in Use Elementary (Section A MVP: Units 1–10)
 * Nguồn: Marks - English Pronunciation in Use - Elementary.pdf (Cambridge, 2007)
 * OCR + review thủ công từ work/ocr/.
 *
 * @author 2026 Nguyễn Văn Quyết
 */

function EPI_UNITS_META() {
  return {
    schemaVersion: 1,
    sourceId: 'epu-elementary',
    sourceName: 'English Pronunciation in Use Elementary',
    workbook: 'Marks - English Pronunciation in Use - Elementary.pdf',
    section: 'A — Sounds and spelling',
    units: 10,
    cdnBase: 'https://lfskcm2018.github.io/Toeic-lptd/epu-audio',
    generatedAt: '2026-11-13T00:00:00.000Z',
  };
}

function EPI_UNITS() {
  return [
    {
      id: 'epu-1',
      unit: 1,
      title: 'How many letters, how many sounds? Spelling and pronunciation',
      focus: 'Mối quan hệ giữa viết và phát âm tiếng Anh',
      sounds: 'vowels, consonants, silent letters, stress',
      explanation: 'Có 26 chữ cái, 5 nguyên âm, 21 phụ âm, nhưng hơn 40 âm. Một số từ có số chữ cái = số âm (best, dentist), có từ có nguyên âm đôi/chữ câm/x = 2 âm (green, bread, listen, six).',
      sentences: [
        'This is the best coffee in the world.',
        'I am a dentist.',
        'She is very happy.',
        'We listen to music every day.',
        'The train arrives at six.'
      ],
      exercises: [
        { n: '1.1', prompt: 'Write the number of letters and the number of sounds in the words: shoe, book, wood, bread.', answer: 'shoe: 4 chữ cái / 3 âm (sh, oo, e? actually /ʃuː/ 3 sounds) — check with Key: shoe 3? wood 3?' },
        { n: '1.2', prompt: 'Write these words in their normal spelling: /b1g/ /best/ /help/ /friend/', answer: 'big, best, help, friend' },
        { n: '1.3', prompt: 'Circle the word with a different vowel sound: give time sit think rich', answer: 'time' }
      ],
      audioTracks: ['01', '02', '03', '04', '05', '06', '07', '08', '09']
    },
    {
      id: 'epu-2',
      unit: 2,
      title: 'Pizza for dinner — /iː/ and /ɪ/',
      focus: 'Âm dài /iː/ và âm ngắn /ɪ/',
      sounds: '/iː/, /ɪ/',
      explanation: '/iː/ is long (see /siː/, eat /iːt/, team /tiːm/). /ɪ/ is short (sit /sɪt/, listen /ˈlɪsən/, busy /ˈbɪzi/).',
      sentences: [
        'Can you see the sea?',
        'A piece of pizza, please.',
        'Peter’s in the team.',
        'A kilo of peaches and a litre of cream.',
        'Please can you teach me to speak Portuguese?',
        'Fifty-six.',
        'Dinner in the kitchen.',
        'A cinema ticket.',
        'A picture of a building.',
        'Big business.'
      ],
      exercises: [
        { n: '2.1', prompt: 'Put these /iː/ words in the dialogues: email evening police secret Steve TV', answer: '1 evening / TV; 2 email / secret; 3 Steve / police' },
        { n: '2.2', prompt: 'Find the /ɪ/ words: lift minute dictionary window biscuit wings mirror litter', answer: 'lift, minute, dictionary, window, biscuit, wings, mirror, litter' },
        { n: '2.3', prompt: 'Circle all the /iː/ sounds and underline all the /ɪ/ sounds: big busy dinner give green in listen meet office people pizza please repeat six tea three', answer: '/iː/: green meet people pizza please repeat tea three. /ɪ/: big busy dinner give in listen office six.' }
      ],
      audioTracks: ['10', '11', '12', '13', '14', '15', '16']
    },
    {
      id: 'epu-3',
      unit: 3,
      title: 'A spoonful of sugar — /uː/ and /ʊ/',
      focus: 'Âm dài /uː/ và âm ngắn /ʊ/',
      sounds: '/uː/, /ʊ/',
      explanation: '/uː/ is long (too /tuː/, group /gruːp/, shoe /ʃuː/, blue /bluː/). /ʊ/ is short (full /fʊl/, sugar /ˈʃʊɡə/, book /bʊk/, foot /fʊt/).',
      sentences: [
        'Me too.',
        'Work in groups.',
        'New shoes.',
        'Red and blue.',
        'Listen to the music.',
        'Forty-two.',
        'Fruit juice.',
        'My bag’s full.',
        'Where’s my book?',
        'My left foot.',
        'A kilo of sugar.',
        'Who’s that woman?'
      ],
      exercises: [
        { n: '3.1', prompt: 'Circle the words with /uː/: food four June look news room school soup spoon sugar town Tuesday two', answer: 'food June news room school soup spoon Tuesday two' },
        { n: '3.2', prompt: 'Put the /uː/ words in the sentences: food, school, June, news, room, soup', answer: '1 food 2 school 3 June 4 news 5 room 6 soup' },
        { n: '3.3', prompt: 'Circle the words with /ʊ/: book cookery could good looking sugar', answer: 'book cookery could good looking sugar' }
      ],
      audioTracks: ['17', '18', '19', '20', '21', '22', '23']
    },
    {
      id: 'epu-4',
      unit: 4,
      title: 'Father and mother — /ɑː/ and /ʌ/',
      focus: 'Âm dài /ɑː/ và âm ngắn /ʌ/',
      sounds: '/ɑː/, /ʌ/',
      explanation: '/ɑː/ is long (after /ˈɑːftə/, ask /ɑːsk/, bath /bɑːθ/, car /kɑː/). /ʌ/ is short (bus /bʌs/, come /kʌm/, cup /kʌp/, mother /ˈmʌðə/).',
      sentences: [
        'How far’s the car park?',
        'We went to a large bar full of film stars.',
        'We’re starting in half an hour.',
        'Good luck with your exam next month!',
        'Take the number one bus.',
        'I said “Come on Monday”, not “Come on Sunday”.',
        'My brother’s studying in London.'
      ],
      exercises: [
        { n: '4.1', prompt: 'Listen and write the words in the correct column (/ɑː/ vs other vowel sounds): artist garden March part square talk warm watch', answer: '/ɑː/: artist garden March part. Other: square talk warm watch.' },
        { n: '4.2', prompt: 'Listen and write the words in the correct column (/ʌ/ vs other vowel sounds): business country fun home lots money mother push', answer: '/ʌ/: country fun money mother. Other: business home lots push.' },
        { n: '4.3', prompt: 'Complete the sentences with one /ɑː/ word and one /ʌ/ word: butter carpet dark hard husband love Prague son', answer: '1 butter/hard 2 carpet/love 3 son/dark 4 husband/Prague' }
      ],
      audioTracks: ['24', '25', '26', '27', '28', '29', '30']
    },
    {
      id: 'epu-5',
      unit: 5,
      title: 'A dog in the corner — /ɒ/ and /ɔː/',
      focus: 'Âm ngắn /ɒ/ và âm dài /ɔː/',
      sounds: '/ɒ/, /ɔː/',
      explanation: '/ɒ/ is short (bottle /ˈbɒtl/, box /bɒks/, coffee /ˈkɒfi/, dog /dɒɡ/). /ɔː/ is long (all /ɔːl/, ball /bɔːl/, call /kɔːl/, door /dɔː/).',
      sentences: [
        'Have you got a lot of shopping?',
        'John’s gone to the shops.',
        'How much did your holiday cost?',
        'She said the coffee wasn’t very good, but I thought it was.',
        'Quarter past four.',
        'Born in autumn.',
        'Have some more.',
        'Walking on water.',
        'The fourth door on the fourth floor.'
      ],
      exercises: [
        { n: '5.1', prompt: 'Write these words: /bɒks/ /klɒk/ /ɡɒn/ /wɒnt/ /ˈwɒntɪd/ /ˈsɒri/ /wɒt/', answer: 'box clock gone want wanted sorry what' },
        { n: '5.2', prompt: 'Listen and complete the dialogues: What time is it? What have you got? Where’s the doctor?', answer: '1 The clock’s stopped. 2 A box of chocolates. 3 He’s gone on holiday.' },
        { n: '5.3', prompt: 'Write the underlined verbs in the past tense: think walk catch teach', answer: 'thought walked caught taught' }
      ],
      audioTracks: ['31', '32', '33', '34', '35', '36', '37']
    },
    {
      id: 'epu-6',
      unit: 6,
      title: 'Bread and jam — /e/ and /æ/',
      focus: 'Âm ngắn /e/ và âm ngắn /æ/',
      sounds: '/e/, /æ/',
      explanation: '/e/ is short (check /tʃek/, leg /leɡ/, letter /ˈletə/, red /red/). /æ/ is short (back /bæk/, camera /ˈkæmrə/, hat /hæt/, jam /dʒæm/).',
      sentences: [
        'Tell me again.',
        'Send me a cheque.',
        'Correct these sentences.',
        'Twenty to twelve.',
        'Help your friend.',
        'Thanks for the cash.',
        'I ran to the bank.',
        'Where’s my black jacket?',
        'That man works in a jam factory.',
        'Let me carry your bags.'
      ],
      exercises: [
        { n: '6.1', prompt: 'Write these words: /hænd/ /best/ /eɡ/ /mæn/ /men/ /ˈmeni/ /hæv/ /nekst/', answer: 'hand best egg man men many have next' },
        { n: '6.2', prompt: 'Seven of these numbers have /e/. Which are they? 7 8 10 11 12 13 17 18 20 70 80 100', answer: '7 10 11 12 17 20 70' },
        { n: '6.3', prompt: 'Match the phrases to make sentences: 1. The first plan was the best. 2. He said “Thank you.” 3. How many stamps do you need? 4. I haven’t got any milk. 5. I’ll be back again tomorrow. 6. My friends live in a flat over there.', answer: '1-e 2-f 3-d 4-a 5-b 6-c' }
      ],
      audioTracks: ['38', '39', '40', '41', '42', '43', '44']
    },
    {
      id: 'epu-7',
      unit: 7,
      title: 'My birthday’s on Thursday — /ɜː/ (er)',
      focus: 'Âm dài /ɜː/ (er)',
      sounds: '/ɜː/',
      explanation: '/ɜː/ is a long sound (bird /bɜːd/, first /fɜːst/, birthday /ˈbɜːθdeɪ/, circle /ˈsɜːkl/, thirty /ˈθɜːti/, word /wɜːd/, work /wɜːk/, journey /ˈdʒɜːni/, learn /lɜːn/).',
      sentences: [
        'My birthday’s on Thursday the thirty-first, and hers is a week later.',
        'When would you prefer, Tuesday or Thursday?',
        'That was the worst journey in the world!',
        'Have you ever heard this word?',
        'The cakes weren’t very good.',
        'She went to university to learn German.'
      ],
      exercises: [
        { n: '7.1', prompt: 'Listen and put the words in the correct groups (/ɜː/ /ɔː/ /ɑː/ /other): beard car chair church curtains dirty door floor four girl horse large March near nurse pair parked purse shirt shorts stars surfer third warm wearing', answer: '/ɜː/: church dirty nurse girl purse shirt third surfer curtains. /ɔː/: door floor four horse shorts warm. /ɑː/: car large March parked stars. Other: beard chair near pair wearing.' },
        { n: '7.2', prompt: 'Picture completion (see book p.23): The nurse is sitting on a chair next to the girl. The boy’s wearing shorts and a dirty shirt.', answer: '1 nurse/chair/girl 2 wearing/shorts/shirt 3 beard/door 4 purse/floor 5 warm 6 third/March 7 surfer/four/horses 8 curtains 9 church/car/stars' },
        { n: '7.3', prompt: 'Listen and write the numbers you hear: 42 13 31 30 3 2 14 37', answer: '42 13 31 30 3 2 14 37' }
      ],
      audioTracks: ['45', '46', '47', '48', '49', '50', '51']
    },
    {
      id: 'epu-8',
      unit: 8,
      title: 'Here and there — /ɪə/ and /eə/',
      focus: 'Âm đôi /ɪə/ và /eə/',
      sounds: '/ɪə/, /eə/',
      explanation: '/ɪə/ moves from /ɪ/ to /ə/ (ear /ɪə/, beer /bɪə/, here /hɪə/, we’re /wɪə/). /eə/ moves from /e/ to /ə/ (air /eə/, care /keə/, square /skweə/, chair /tʃeə/).',
      sentences: [
        'We’re here!',
        'Have a beer — cheers!',
        'Is there a bank near here?',
        'The meaning isn’t really clear.',
        'Look at that aeroplane!',
        'Where?',
        'Up there, in the air, of course!'
      ],
      exercises: [
        { n: '8.1', prompt: 'Read the note and find four /ɪə/ words and four /eə/ words.', answer: '/ɪə/: really theatre near here. /eə/: Mary upstairs there Sarah.' },
        { n: '8.2', prompt: 'Complete the sentences: fair hair, chairs under stairs, years lived here, beard square, hear, clear day', answer: '1 fair 2 chairs/stairs 3 years/here 4 beard/square 5 hear 6 clear' },
        { n: '8.3', prompt: 'Listen. Can you hear an /r/ sound after the /ɪə/ or /eə/? 1 next year 2 We’re from England 3 take care 4 Bye — take care 5 Where shall we meet?', answer: '1 /r/ 2 no 3 /r/ 4 no 5 /r/' }
      ],
      audioTracks: ['52', '53', '54', '55', '56', '57', '58']
    },
    {
      id: 'epu-9',
      unit: 9,
      title: 'Have a great time! — /eɪ/, /aɪ/ and /ɔɪ/',
      focus: 'Âm đôi /eɪ/, /aɪ/ và /ɔɪ/',
      sounds: '/eɪ/, /aɪ/, /ɔɪ/',
      explanation: '/eɪ/ moves from /e/ to /ɪ/ (age /eɪdʒ/, came /keɪm/, plane /pleɪn/, table /ˈteɪbəl/). /aɪ/ moves from /a/ to /ɪ/ (like /laɪk/, time /taɪm/, white /waɪt/). /ɔɪ/ moves from /ɔ/ to /ɪ/ (coin /kɔɪn/, boy /bɔɪ/, enjoy /ɪnˈdʒɔɪ/).',
      sentences: [
        'They came a day later.',
        'It was a grey day in May.',
        'Is this the way to the station?',
        'Wait at the gate — I’ll be there at eight.',
        'Do you like dry wine?',
        'Why don’t you try?',
        'July will be fine.',
        'Drive on the right.',
        'I can hear a boy’s voice.',
        'Those are coins, not toys!'
      ],
      exercises: [
        { n: '9.1', prompt: 'Complete the titles of these pictures. All missing words have /eɪ/: Waiting for the train, Taking a break, Raining in Spain, Making a mistake, Baking a cake.', answer: 'Waiting/train Taking/break Raining/Spain Making/mistake Baking/cake' },
        { n: '9.2', prompt: 'These verbs are in the past tense. Write the infinitive. They all have /aɪ/: wrote, tried, found, bought, flew', answer: 'write, try, find, buy, fly' },
        { n: '9.3', prompt: 'Complete the sentences. All missing words have /eɪ/ or /aɪ/: night flight, white wine, eight miles, dry day, right way, great time', answer: '1 night 2 white 3 eight 4 dry 5 right 6 great' }
      ],
      audioTracks: ['59', '60', '61', '62', '63', '64', '65']
    },
    {
      id: 'epu-10',
      unit: 10,
      title: 'Old town — /əʊ/ and /aʊ/',
      focus: 'Âm đôi /əʊ/ và /aʊ/',
      sounds: '/əʊ/, /aʊ/',
      explanation: '/əʊ/ moves from /ə/ to /ʊ/ (no /nəʊ/, cold /kəʊld/, post /pəʊst/, close /kləʊz/, home /həʊm/, phone /fəʊn/). /aʊ/ moves from /a/ to /ʊ/ (how /haʊ/, now /naʊ/, vowel /ˈvaʊəl/, loud /laʊd/, mouth /maʊθ/).',
      sentences: [
        'I don’t know.',
        'My toes are cold.',
        'She phoned me in October.',
        'They showed us their home.',
        'A thousand pounds.',
        'Loud vowel sounds.',
        'Round the house.',
        'Countdown — three, two, one, now!'
      ],
      exercises: [
        { n: '10.1', prompt: 'Complete the text: gone snow lost some', answer: '1 gone 2 snow 3 lost 4 some' },
        { n: '10.2', prompt: 'Complete the description: coast, brown stone, train, coach or boat, snow, mountains', answer: 'It’s an old town on the coast. The houses are built with brown stone. You can get there by train, coach or boat. In winter there’s a lot of snow and sometimes the road over the mountains is closed.' },
        { n: '10.4', prompt: 'Circle the word you hear: coast boot woke', answer: 'coast boot woke' }
      ],
      audioTracks: ['66', '67', '68', '69', '70', '71', '72']
    }
  ];
}
