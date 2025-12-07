Quran Static Pages Generator

This repository includes a generator script to fetch the full Arabic text for all 114 Surahs and generate static HTML pages (one per surah) plus an index.

Files added:
- `scripts/generate_quran.py` — Python script that fetches surah (and juz when available) data from `https://api.quran.sutanlab.id` and writes HTML files into `./quran/`.

How to run (PowerShell on Windows):

1. Ensure Python 3 is installed and on your PATH.
2. From the project root (where `index.html` is), run:

   python .\scripts\generate_quran.py

   Optional: to generate from a local JSON dataset instead of fetching from the web, pass the dataset path:

   python .\scripts\generate_quran.py .\data\quran.json

   Optional: generate a single merged `quran/index.html` containing all surahs (anchors to each surah):

   python .\scripts\generate_quran.py --single

   Or combine flags and dataset:

   python .\scripts\generate_quran.py --single .\data\quran.json

3. The script will create a `quran` directory with `surah-001.html` .. `surah-114.html` and an `index.html` listing.

Notes & caveats:
- The script fetches data from `https://api.quran.sutanlab.id`. If you prefer another API, edit `API_SURAH` and `API_JUZ` variables at the top of the script.
-- Network access is required to fetch the data. If your environment blocks outbound requests, provide a local canonical JSON dataset and pass its path as the script argument (see example above). The generator will read that file and create the static pages offline.
- The generated pages reference `../styles.css` and `../script.js` so they integrate with the current site styling and behavior. Adjust paths if you move files.
- The script keeps the HTML simple and preserves right-to-left (`dir="rtl"`) layout. It does not change fonts; it links to Google fonts for optional display — remove that line if you must not change fonts.

- After successful generation the script will attempt to patch the root `index.html` and `quran.html` navigation links so they point to the generated `quran/index.html` (a `.bak` backup of any modified file is created).

If you want, I can:
- Update the generator to embed exact Surah names and metadata from the API.
- Add Juz/Hizb indexing with accurate verse ranges (requires the API to return juz/hizb mapping).
- Run a quick generation for you if you provide a network-enabled environment or the Quran dataset file.
