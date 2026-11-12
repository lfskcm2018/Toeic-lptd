/**
 * EPI_SECTION_E — nội dung Section E của "English Pronunciation in Use Elementary".
 *
 * Nguồn:
 *  E1 (Chart of phonemic symbols)  — đọc tay từ ảnh trang in 110 (PDF 111)
 *  E2 (Guide for speakers)          — OCR trang in 111 (PDF 112)
 *  E3 (Sound pairs 1–37)           — đọc tay từ ảnh bảng index trang in 113 (PDF 114)
 *  E4–E8                            — OCR trang PDF 128–138
 */

var EPI_SECTION_E = [
  {
    id: 'epu-e1', ref: 'E1', page: 110, cd: 'D',
    title: 'Chart of phonemic symbols',
    desc: 'Bảng âm vị của tiếng Anh kèm từ ví dụ. Nghe các từ ví dụ trên CD4 (D31a–D31d).',
    audioTracks: ['CD4-Track31.mp3'],
    groups: [
      { label: 'Short vowels', symbol: '/ɪ/ /e/ /æ/ /ʌ/ /ɒ/ /ʊ/ /ə/ /i/', items: [
        '/ɪ/ swim, building',
        '/e/ red, bread, friend, any, said',
        '/æ/ can, map',
        '/ʌ/ son, sun',
        '/ɒ/ clock, hot',
        '/ʊ/ full, book',
        '/ə/ about, excellent, letter, doctor, sugar',
        '/i/ happy',
      ] },
      { label: 'Long vowels', symbol: '/iː/ /ɑː/ /ɔː/ /uː/ /ɜː/', items: [
        '/iː/ tree, seat, field, secret, kilo',
        '/ɑː/ can’t, bar, half',
        '/ɔː/ wall, talk, saw, daughter, bought, warm',
        '/uː/ too, group, blue',
        '/ɜː/ bird, work, turn, learn, verb',
      ] },
      { label: 'Diphthongs', symbol: '/ɪə/ /eə/ /eɪ/ /aɪ/ /ɔɪ/ /əʊ/ /aʊ/', items: [
        '/ɪə/ real, hear, beer, here',
        '/eə/ care, hair, wear, where',
        '/eɪ/ came, rain, say, great, weight',
        '/aɪ/ time, dry, high, buy',
        '/ɔɪ/ point, toy',
        '/əʊ/ cold, home, slow, boat',
        '/aʊ/ now, sound',
      ] },
      { label: 'Consonants', symbol: '/p/ /b/ /t/ /d/ /k/ /g/ /f/ /v/ /θ/ /ð/ /s/ /z/ /ʃ/ /ʒ/ /tʃ/ /dʒ/ /m/ /n/ /ŋ/ /l/ /r/ /h/ /j/ /w/', items: [
        '/b/ baby, job',
        '/d/ do, reading, add',
        '/f/ foot, café, off, phone',
        '/g/ go, bigger, bag',
        '/h/ hand, who',
        '/j/ yes',
        '/k/ cold, talking, black',
        '/l/ leave, yellow, fill',
        '/m/ more, summer, comb',
        '/n/ now, dinner, gone, know',
        '/p/ pen, stopping, help',
        '/r/ red, sorry, write',
        '/s/ sister, glass, place, scissors',
        '/t/ ten, better, eight, washed',
        '/v/ view, every, five',
        '/w/ well, away, white',
        '/z/ zero, roses, scissors, jazz',
        '/ʃ/ shop, washing, cash, machine, sure, national',
        '/ʒ/ television, usually',
        '/tʃ/ choose, which, future',
        '/dʒ/ jeans, larger, fridge',
        '/ŋ/ thing, bank, singer',
        '/θ/ thank, north',
        '/ð/ then, mother, with',
      ] },
    ],
  },

  {
    id: 'epu-e2', ref: 'E2', page: 111, cd: null,
    title: 'Guide for speakers of specific languages',
    desc: 'Nếu bạn là người bản ngữ của một trong các ngôn ngữ sau, hãy ưu tiên luyện các Sound pairs tương ứng (xem E3).',
    audioTracks: [],
    groups: [
      { label: 'Arabic', items: ['3, 11, 13, 16, 23, 25, 27, 28, 29, 33, 34, 37'] },
      { label: 'Chinese', items: ['1, 4, 7, 9, 10, 11, 13, 15, 23, 26, 27, 28, 29, 30, 31, 33, 36, 37'] },
      { label: 'Dravidian languages e.g. Tamil', items: ['1, 4, 7, 11, 12, 13, 17, 23, 24, 26, 27, 28, 31, 34'] },
      { label: 'Dutch', items: ['1, 3, 4, 5, 8, 10, 12, 14, 15, 26, 28, 29, 30, 31, 32, 33'] },
      { label: 'Farsi', items: ['1, 4, 11, 13, 15, 17, 20, 27, 34'] },
      { label: 'French', items: ['1, 4, 7, 9, 10, 12, 15, 16, 23, 26, 27, 28, 29, 30, 31, 33, 37'] },
      { label: 'German', items: ['10, 12, 15, 21, 23, 26, 28, 29, 30, 31'] },
      { label: 'Greek', items: ['1, 2, 4, 7, 9, 11, 12, 13, 15, 17, 31, 32, 33, 34, 37'] },
      { label: 'Italian', items: ['1, 9, 11, 12, 13, 15, 16, 23, 26, 27, 28, 29, 31'] },
      { label: 'Japanese', items: ['9, 12, 20, 25, 30, 32, 34, 35, 36'] },
      { label: 'Korean', items: ['1, 4, 11, 12, 13, 14, 15, 17, 23, 24, 26, 27, 28, 29, 30, 31, 32, 36'] },
      { label: 'Malay / Indonesian', items: ['1, 4, 13, 15, 23, 24, 26, 27, 28, 29, 31, 32, 33'] },
      { label: 'Polish', items: ['1, 5, 6, 12, 13, 14, 20, 23, 24, 25, 27, 28, 29, 30, 31, 32, 33, 36'] },
      { label: 'Portuguese', items: ['1, 4, 5, 6, 7, 8, 11, 12, 13, 17, 20, 23, 26, 28, 29, 30, 31, 33'] },
      { label: 'Russian', items: ['1, 4, 11, 13, 14, 15, 19, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33'] },
      { label: 'Spanish', items: ['1, 4, 5, 6, 7, 8, 11, 12, 13, 14, 17, 20, 23, 26, 28, 29, 30, 31, 33, 36'] },
      { label: 'Swedish', items: ['1, 3, 4, 5, 8, 12, 13, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31'] },
      { label: 'Turkish', items: ['1, 5, 6, 12, 13, 14, 15, 16, 17, 20, 23, 26, 27, 28, 29, 30, 31, 32, 33, 37'] },
    ],
  },

  {
    id: 'epu-e3', ref: 'E3', page: 113, cd: 'E',
    title: 'Sound pairs',
    desc: '37 cặp âm dễ nhầm. Nghe trên CD5: Sound pair N nằm ở track N+1 (E2–E38).',
    audioTracks: [],
    pairs: [
      [1, '/ɪz/', '/ɪ/'], [2, '/iː/', '/ɪə/'], [3, '/ɪ/', '/e/'], [4, '/uː/', '/ʊ/'],
      [5, '/ʊ/', '/ʌ/'], [6, '/uː/', '/əʊ/'], [7, '/æ/', '/ɑː/'], [8, '/ɑː/', '/ɔː/'],
      [9, '/æ/', '/ʌ/'], [10, '/ʌ/', '/ɒ/'], [11, '/ɒ/', '/əʊ/'], [12, '/əʊ/', '/ɔː/'],
      [13, '/ɒ/', '/ɔː/'], [14, '/ɔː/', '/ɜː/'], [15, '/e/', '/æ/'], [16, '/e/', '/eɪ/'],
      [17, '/e/', '/ɜː/'], [18, '/e/', '/ʌ/'], [19, '/ɜː/', '/æ/'], [20, '/ɜː/', '/ɪə/'],
      [21, '/eə/', '/eɪ/'], [22, '/aɪ/', '/eɪ/'], [23, '/p/', '/b/'], [24, '/p/', '/f/'],
      [25, '/t/', '/tʃ/'], [26, '/t/', '/d/'], [27, '/t/', '/θ/'], [28, '/k/', '/g/'],
      [29, '/f/', '/v/'], [30, '/s/', '/θ/'], [31, '/s/', '/z/'], [32, '/s/', '/ʃ/'],
      [33, '/ʃ/', '/tʃ/'], [34, '/n/, /ŋ/', '/ŋk/'], [35, '/m/, /n/', '/ŋ/'],
      [36, '/l/', '/r/'], [37, '/h/', '/–/'],
    ],
  },

  {
    id: 'epu-e4', ref: 'E4', page: 127, cd: 'D',
    title: 'From spelling to sound',
    desc: 'Cách đọc chính tả → âm. Nghe trên CD4 (D32–D33).',
    audioTracks: ['CD4-Track32.mp3', 'CD4-Track33.mp3'],
    groups: [
      { label: 'Commonest spellings', items: [
        'a → /æ/ (cat, map) — c → /k/, g → /ɡ/, l → /l/, m → /m/, n → /n/, p → /p/, r → /r/, s → /s/, t → /t/, v → /v/, w → /w/',
        'b → /b/ (big) — d → /d/ (do), f → /f/ (for), h → /h/ (hot), i → /ɪ/ (sit), j → /dʒ/ (job), k → /k/ (king), q → /kw/ (quick)',
        'o → /ɒ/ (hot) — u → /ʌ/ (cup), x → /ks/ (box), y → /j/ (yes), z → /z/ (zoo), th → /θ/ (thin), ch → /tʃ/ (chair), sh → /ʃ/ (ship)',
      ] },
    ],
  },

  {
    id: 'epu-e5', ref: 'E5', page: 130, cd: 'D',
    title: 'The alphabet',
    desc: 'Cách phát âm bảng chữ cái: /eɪ/ (A, B, C…), /iː/ (E, F, L…), /ɑː/ (H, M, N…)… Nghe trên CD4 (D34–D39).',
    audioTracks: ['CD4-Track34.mp3', 'CD4-Track35.mp3', 'CD4-Track36.mp3',
      'CD4-Track37.mp3', 'CD4-Track38.mp3', 'CD4-Track39.mp3'],
    groups: [
      { label: 'Letter names', items: [
        '/eɪ/ — A, B, C, D, E, G, P, T, V',
        '/iː/ — E, F, I, L, M, N, S, X',
        '/ɑː/ — H, O, R',
        '/juː/ — U, W, Q',
        '/ɑːr/ — are, R',
        '/zɛd/ — Z,zed; /dʒiː/ — G, gee',
      ] },
    ],
  },

  {
    id: 'epu-e6', ref: 'E6', page: 132, cd: 'D',
    title: 'Pronouncing numbers',
    desc: 'Cách đọc số: trăm/nghìn, số trên 100, năm, số điện thoại, nhiệt độ, phân số, thập phân, phần trăm. Nghe trên CD4 (D40–D52).',
    audioTracks: ['CD4-Track40.mp3', 'CD4-Track41.mp3', 'CD4-Track42.mp3', 'CD4-Track43.mp3',
      'CD4-Track44.mp3', 'CD4-Track45.mp3', 'CD4-Track46.mp3', 'CD4-Track47.mp3',
      'CD4-Track48.mp3', 'CD4-Track49.mp3', 'CD4-Track50.mp3', 'CD4-Track51.mp3', 'CD4-Track52.mp3'],
    groups: [
      { label: 'Hundreds / thousands / millions', items: [
        '100 — a hundred', '1,000 — a thousand', '1,000,000 — a million',
      ] },
      { label: 'Numbers over 100', items: [
        '101 — a hundred and one', '350 — three hundred and fifty',
        '529 — five hundred and twenty-nine',
        '2,491 — two thousand, four hundred and ninety-one',
        '7,512 — seven thousand, five hundred and twelve',
        '27,403 — twenty-seven thousand, four hundred and three',
      ] },
      { label: 'Years', items: [
        '1764 — seventeen sixty-four', '1890 — eighteen ninety',
        '1900 — nineteen hundred', '1907 — nineteen oh seven',
        '2000 — two thousand', '2007 — two thousand and seven',
      ] },
      { label: 'Telephone numbers', items: [
        '01425 — oh one four two five',
        '365 7098 — three six five, seven oh nine eight',
        '0609 655 400 — oh six oh nine, six double five, four double oh',
      ] },
      { label: 'Temperatures', items: [
        '14° — fourteen degrees', '0° — zero',
        '–12° — minus twelve (degrees) / twelve (degrees) below zero',
      ] },
      { label: 'Ordinal numbers', items: [
        '1st — first', '2nd — second', '3rd — third', '4th — fourth', '5th — fifth',
        '13th — thirteenth', '15th — fifteenth', '20th — twentieth', '21st — twenty-first',
        '22nd — twenty-second', '23rd — twenty-third', '24th — twenty-fourth',
        '31st — thirty-first', '52nd — fifty-second',
      ] },
      { label: 'Dates', items: [
        '22 May — May the twenty-second / the twenty-second of May / May twenty-second (AmE)',
        '13 January — January the thirteenth / the thirteenth of January',
        '30 January — January the thirtieth / the thirtieth of January',
      ] },
      { label: 'Fractions', items: [
        '½ — a half', '¼ — a quarter', '¾ — three quarters',
        '⅓ — a third', '⅔ — two thirds', '⅛ — an eighth', '⅝ — five eighths',
        'a fourth / three fourths (AmE)',
      ] },
      { label: 'Decimals', items: [
        '1.6 — one point six', '23.95 — twenty-three point nine five',
        '0.762 — nought point seven six two / zero point seven six two (AmE)',
      ] },
      { label: 'Percentages', items: [
        '1% — one per cent', '50% — fifty per cent',
        '67.3% — sixty-seven point three per cent',
      ] },
    ],
  },

  {
    id: 'epu-e7', ref: 'E7', page: 135, cd: 'D',
    title: 'Pronouncing geographical names',
    desc: 'Cách đọc tên địa danh (danh từ + tính từ, ví dụ Italian /Iˈtæliən/). Nghe trên CD4 (D53–D54).',
    audioTracks: ['CD4-Track53.mp3', 'CD4-Track54.mp3'],
    groups: [
      { label: 'Common patterns', items: [
        'Italian — /Iˈtæliən/, Italian city — /Iˈtæliən ˈsɪti/',
        'French — /ˈfrentʃ/, French city — /ˈfrentʃ ˈsɪti/',
        'English — /ˈɪŋɡlɪʃ/, English man — /ˈɪŋɡlɪʃ mæn/',
        'Adjective thường phát âm giống danh từ: Italian /Iˈtæliən/ → Italian town',
      ] },
    ],
  },

  {
    id: 'epu-e8', ref: 'E8', page: 137, cd: 'D',
    title: 'Homophones',
    desc: 'Các từ đồng âm khác nghĩa. Nghe trên CD4 (D55).',
    audioTracks: ['CD4-Track55.mp3'],
    groups: [
      { label: 'Common homophones', items: [
        'air /eə/ – heir /eə/', 'ate /eɪt/ – eight /eɪt/', 'be /biː/ – bee /biː/',
        'buy /baɪ/ – by /baɪ/', 'cell /sel/ – sell /sel/', 'cent /sent/ – sent /sent/',
        'dear /dɪə/ – deer /dɪə/', 'fair /feə/ – fare /feə/', 'flower /ˈflaʊə/ – flour /ˈflaʊə/',
        'for /fɔː/ – four /fɔː/', 'hair /heə/ – hare /heə/', 'hear /hɪə/ – here /hɪə/',
        'hour /ˈaʊə/ – our /ˈaʊə/', 'know /nəʊ/ – no /nəʊ/', 'meat /miːt/ – meet /miːt/',
        'one /wʌn/ – won /wʌn/', 'pair /peə/ – pear /peə/', 'plain /pleɪn/ – plane /pleɪn/',
        'right /raɪt/ – write /raɪt/', 'sea /siː/ – see /siː/', 'son /sʌn/ – sun /sʌn/',
        'to /tuː/ – too /tuː/', 'two /tuː/ – too /tuː/', 'wear /weə/ – where /weə/',
        'weather /ˈweðə/ – whether /ˈweðə/', 'which /wɪtʃ/ – witch /wɪtʃ/',
      ] },
    ],
  },
];
