# Star Student Blitz: Review data report

Generated while building the three-column Review popup (日本語 / ひらがな / 英語の意味).

## How the join works
- English meanings live in lesson keys such as `27-28` and `1-2`; readings live in `h27-28` and `h1-2`.
- Review joins them **by Japanese term inside the same lesson** (never across lessons, never by array position).
- If a term appears more than once in a lesson, the 1st English entry is paired with the 1st reading entry, the 2nd with the 2nd, and so on.
- Kanji512 readings are shown exactly as stored (`on'yomi ／ kun'yomi`).
- The quiz still reads the original lists; `data.js` content is byte-for-byte the same data as your uploaded file.

## Results
| | count |
|---|---|
| Lessons joined (N4Vocabs 11 + Kanji512 10) | 21 |
| English entries | 1090 |
| Reading entries | 1088 |
| English entries matched to a reading | 1088 |
| Reading entries left without an English meaning | 0 |
| Unmatched entries | 2 |

Matching by array position alone would have mispaired 40 rows (the reading lists omit the two kana-only terms below, which shifts everything after them).

## Unmatched records (no reading stored in `h` lists)
| Lesson | Term | English | What Review shows |
|---|---|---|---|
| 29-30 | うら | back / rear | うら (the term is kana-only, so it is its own reading) |
| 33-34 | モノマネ | imitate | ものまね (same katakana word written in hiragana) |

No other reading or meaning was invented. If a non-kana term ever has no reading, Review shows `—` in grey instead of guessing.

## Repeated terms (paired by occurrence, equal counts in both lists)
- 29-30: 地下鉄 ×2
- 29-30: 地震 ×2
- 29-30: 電池 ×2
- 31-32: 北海道 ×2
- 33-34: 閉める ×2
- 37-38: 日光 ×2
- 37-38: 招待する ×2
- 45-46: 太陽 ×2
- 47-48: 開始する ×2

## Same kanji, different reading by lesson (kept as stored, this is intentional)
Kanji512 gives on/kun readings, N4Vocabs gives the word reading. Example: 空 is `くう ／ そら、あく` in Kanji512 and `そら` in N4Vocabs. 50 kanji work this way.

## Suspected English-meaning errors (NOT changed, please review)
These come from the original data and look wrong to me; I left them untouched so quiz answers did not change.
| Lesson | Term | Stored meaning | Likely meaning |
|---|---|---|---|
| 47-48 | 孫 | young | grandchild |
| 47-48 | 両替え | change | money exchange |
| 47-48 | 燃える | burnable | to burn |
| 47-48 | 終電 | last train / last holiday | last train |
| 47-48 | 始発 | starting point | first train |
This is a spot check, not a full audit of all 1090 entries.

## On'yomi/kun'yomi (Kanji512 hiragana lists)
These 320 readings were written from general knowledge (the reference book PDFs could not be read), so please proofread them against your book.
