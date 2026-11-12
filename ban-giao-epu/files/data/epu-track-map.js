/**
 * EPI_TRACK_MAP — mapping audio ↔ unit của "English Pronunciation in Use Elementary".
 *
 * NGUỒN: đọc TRỰC TIẾP marker in sách (icon tai nghe + nhãn "<CD><số><phần>"),
 * bằng cách crop dải cột marker ở scale 8 và dựng montage để đọc tay.
 * Mỗi unit = 1 dải track liên tiếp trên CD của nó.
 *
 * CD A (CD1, 81 track) — Units 1–12
 * CD B (CD2, 92 track) — Units 13–27
 * CD C (CD3, 85 track) — Units 28–43
 * CD D (CD4, 55 track) — Units 44–50 + Section E
 * CD E (CD5, 38 track) — Section E3 Sound pairs (37 cặp)
 */

var EPI_CD_OF_UNIT = {};
[
  [1, 12, 'A'], [13, 27, 'B'], [28, 43, 'C'], [44, 50, 'D'],
].forEach(function (r) {
  for (var u = r[0]; u <= r[1]; u++) EPI_CD_OF_UNIT[u] = r[2];
});

/* start, end (đã đối chiếu marker trong sách + kiểm tra tổng khớp số track của từng CD) */
var EPI_UNIT_TRACKS = {
  1: [1, 8],    2: [9, 15],   3: [16, 22],  4: [23, 29],  5: [30, 36],  6: [37, 42],
  7: [43, 47],  8: [48, 54],  9: [55, 62], 10: [63, 68], 11: [69, 74], 12: [75, 81],
  13: [1, 7],  14: [8, 13],  15: [14, 19], 16: [20, 27], 17: [28, 33], 18: [34, 41],
  19: [42, 49], 20: [50, 54], 21: [55, 59], 22: [60, 63], 23: [64, 68], 24: [69, 73],
  25: [74, 78], 26: [79, 86], 27: [87, 92],
  28: [1, 6],  29: [7, 12],  30: [13, 18], 31: [19, 23], 32: [24, 28], 33: [29, 31],
  34: [32, 37], 35: [38, 43], 36: [44, 49], 37: [50, 53], 38: [54, 56], 39: [57, 62],
  40: [63, 67], 41: [68, 73], 42: [74, 78], 43: [79, 85],
  44: [1, 6],  45: [7, 10],  46: [11, 14], 47: [15, 18], 48: [19, 22], 49: [23, 26],
  50: [27, 30],
};

/* Section E dùng phần còn lại của CD D + toàn bộ CD E */
var EPI_SECTION_E_TRACKS = {
  E1: { cd: 'D', tracks: [31] },
  E2: { cd: null, tracks: [] },
  E3: { cd: 'E', tracks: null },        /* sound pair N -> track N+1 (2..38); track 1 = intro */
  E4: { cd: 'D', tracks: [32, 33] },
  E5: { cd: 'D', tracks: [34, 35, 36, 37, 38, 39] },
  E6: { cd: 'D', tracks: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52] },
  E7: { cd: 'D', tracks: [53, 54] },
  E8: { cd: 'D', tracks: [55] },
};

var EPI_CD_TRACK_COUNT = { A: 81, B: 92, C: 85, D: 55, E: 38 };
/* CD x → số thứ tự file trong thư mục epu-audio (CD1..CD5) */
var EPI_CD_FILE_NO = { A: 1, B: 2, C: 3, D: 4, E: 5 };
