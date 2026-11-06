STAR STUDENT BLITZ — updated version

Changes:
- Uses your cat-star image as the website and iPhone/iPad Home Screen icon.
- Replaces “Mastery Blitz” with “Star Student Blitz”.
- Adds a 📖 Review: OFF / ON button. Turn it on, then tap lesson chips to see vocabulary. Use the × button to close. Press R still toggles Review on a keyboard. In normal mode the lesson chips still select/deselect lessons.
- Keeps your original study content, scoring, game modes, and localStorage key (so old records on the same site origin are retained).

How to open:
- Keep index.html, extra-star-student.html, manifest.webmanifest, favicon.ico, and the icons folder together.
- Open index.html in your computer browser, or extra-star-student.html as before.

Add to Home Screen (iPhone/iPad):
- To reliably show the custom icon and launch as a Home Screen web app, publish this whole folder to an HTTPS static website (e.g. GitHub Pages or Netlify). Use the website URL in Safari, tap Share > Add to Home Screen > Add.
- Merely opening a .zip or local .html file in the iOS Files app is not the same as installing a website; the icon metadata may not be applied.
- For an updated already-saved shortcut, remove the old shortcut and add it again from the updated site if the icon has been cached.

No external JavaScript libraries or online quiz APIs are required.
