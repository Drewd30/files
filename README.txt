STAR STUDENT BLITZ - v2 (Review mode, cleanup, QA)

FILES (keep together)
- index.html  : the page (extra-star-student.html is an identical copy, kept so old shortcuts still work)
- styles.css  : all styling (unchanged look)
- data.js     : all vocabulary/kanji lists. One [term, answer] pair per line.
                "27-28" etc = English meaning, "h27-28" etc = hiragana reading (Kanji512: on'yomi / kun'yomi)
- app.js      : all behaviour (quiz, scoring, review, saved progress)
- manifest.webmanifest, favicon.ico, icons/ : home-screen icons (unchanged)
- DATA_REPORT.md : how Review joins meanings and readings, unmatched records, suspected data errors

REVIEW MODE
- Tap/click "Review", or press R. Desktop with a mouse: hover a lesson. iPhone/iPad/small windows: tap a lesson (bottom sheet).
- Each row shows 日本語 / ひらがな / 英語の意味. Close with the x button, Esc, or by tapping outside.
- Review OFF: lesson buttons select lessons as usual.

EDITING DATA
- To add a word, add it to the English list and to the matching "h" list with the identical term.
  Review pairs them by term inside the same lesson. A missing reading shows a grey dash.

YOUR SAVED SCORES
- Still stored under the same browser key (mastery_blitz_v1) in the same format, so existing records carry over
  on the same website address. A different address/host starts with empty records (browser rule).

RUNNING
- Offline: open index.html from the folder in a desktop browser.
- iPhone/iPad Home Screen: publish the whole folder to an HTTPS static host, open it in Safari, Share > Add to Home Screen.
  Remove an old shortcut first if the old icon is cached.
- No external libraries or internet needed.
