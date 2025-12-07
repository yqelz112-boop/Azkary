#!/usr/bin/env python3
# generate_quran.py
# Fetches the full Arabic text for all 114 surahs from a public API
# and generates static HTML pages under ./quran/surah-001.html ... surah-114.html

import sys
import os
import time
import json
import requests
from pathlib import Path

API_SURAH = 'https://api.quran.sutanlab.id/surah/{}'
API_JUZ = 'https://api.quran.sutanlab.id/juz/{}'
OUT_DIR = Path(__file__).resolve().parent.parent / 'quran'
ROOT_DIR = Path(__file__).resolve().parent.parent

HEAD_HTML = '''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <header class="header">
    <nav class="nav">
      <div class="logo"><span class="logo-icon">☪</span><span class="logo-text">أذكاري</span></div>
            <ul class="nav-links">
                <li><a href="../index.html">الرئيسية</a></li>
                <li><a href="../azkar.html">الأذكار</a></li>
        <li><a href="../quran.html">القرآن</a></li>
      </ul>
      <button class="mobile-menu-btn" onclick="toggleMobileMenu()">☰</button>
    </nav>
  </header>
  <main class="container" style="padding-top:120px;">
    <section class="quran-section">
      <div class="section-header"><h2 class="section-title">{title}</h2></div>
      <article class="quran-verse-card" style="padding:18px;">
'''

FOOT_HTML = '''
      </article>
    </section>
  </main>
  <script src="../script.js"></script>
</body>
</html>
'''


def fetch_surah(n):
    url = API_SURAH.format(n)
    r = requests.get(url, timeout=15)
    r.raise_for_status()
    return r.json()


def fetch_juz(j):
    url = API_JUZ.format(j)
    r = requests.get(url, timeout=15)
    r.raise_for_status()
    return r.json()


def save_surah_html(n, data):
    name = data.get('name', {}).get('short', f'سورة {n}')
    filename = OUT_DIR / f'surah-{n:03d}.html'
    verses = data.get('verses') or []
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(HEAD_HTML.format(title=f'{name} — سورة {n}'))
        for v in verses:
            arab = v.get('text', {}).get('arab', v.get('text') if isinstance(v.get('text'), str) else '')
            if not arab:
                # fallback if structure differs
                arab = v.get('text', '')
            f.write(f'        <p class="verse-text">{arab}</p>\n')
        f.write(FOOT_HTML)
    print('Wrote', filename)
def load_local_dataset(path):
        with open(path, 'r', encoding='utf-8') as fh:
                data = json.load(fh)
        # Normalize: support either {'data': {...}} or list/dict
        if isinstance(data, dict) and 'data' in data and isinstance(data['data'], (list, dict)):
                return data['data']
        return data


def get_surah_from_local(local, n):
    # local may be list indexed 0..113 or dict keyed by number or short name
    if isinstance(local, list):
        idx = n - 1
        if 0 <= idx < len(local):
            return local[idx]
    if isinstance(local, dict):
        # check numeric keys as strings
        if str(n) in local:
            return local[str(n)]
        # check entries with 'number' field
        for v in local.values():
            if isinstance(v, dict) and v.get('number') == n:
                return v
    return None

def patch_nav_links():
        # Replace occurrences of anchors to '#quran' and 'quran.html' to point to generated index
        replacements = [
                ('href="#quran"', 'href="quran/index.html"'),
                ('href="quran.html"', 'href="quran/index.html"'),
                ("href='#quran'", "href='quran/index.html'"),
                ("href='quran.html'", "href='quran/index.html'"),
        ]
        files = [ROOT_DIR / 'index.html', ROOT_DIR / 'quran.html']
        for f in files:
                if not f.exists():
                        continue
                try:
                        text = f.read_text(encoding='utf-8')
                        original = text
                        for old, new in replacements:
                                text = text.replace(old, new)
                        if text != original:
                                # backup original
                                bak = f.with_suffix(f.suffix + '.bak')
                                bak.write_text(original, encoding='utf-8')
                                f.write_text(text, encoding='utf-8')
                                print('Patched nav links in', f)
                        else:
                                print('No nav links to patch in', f)
                except Exception as e:
                        print('Failed to patch', f, e)


def save_juz_html(j, data):
    filename = OUT_DIR / f'juz-{j:02d}.html'
    name = f'الجزء {j}'
    verses = data.get('verses') or []
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(HEAD_HTML.format(title=name))
        for v in verses:
            # verses may include surah and ayah info
            arab = v.get('text', {}).get('arab', v.get('text', '') )
            f.write(f'        <p class="verse-text">{arab}</p>\n')
        f.write(FOOT_HTML)
    print('Wrote', filename)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    local_data = None
    single_file = False
    # optional local dataset path as first argument
    # Usage patterns:
    #   generate_quran.py                -> fetch and write per-surah files
    #   generate_quran.py --single       -> produce one merged quran/index.html with anchors
    #   generate_quran.py data.json      -> use local dataset
    #   generate_quran.py --single data.json
    args = [a for a in sys.argv[1:]]
    if '-h' in args or '--help' in args:
        print('Usage: generate_quran.py [--single] [local_dataset.json]')
        sys.exit(0)
    if '--single' in args or '-s' in args:
        single_file = True
        # remove the flag so the remaining arg (if any) can be dataset path
        args = [a for a in args if a not in ('--single', '-s')]
    if len(args) > 0:
        arg = args[0]
        try:
            local_data = load_local_dataset(arg)
            print('Loaded local dataset from', arg)
        except Exception as e:
            print('Failed to load local dataset:', e)
            sys.exit(1)

    print('Output directory:', OUT_DIR)
    # Collect surah data in memory if single_file requested, else write per-surah files
    collected = []
    for i in range(1, 115):
        try:
            print('Processing surah', i)
            if local_data is not None:
                s = get_surah_from_local(local_data, i)
                if s:
                    surah_obj = s if isinstance(s, dict) else {'verses': s}
                else:
                    print('Local dataset missing surah', i)
                    surah_obj = {'name': {'short': f'سورة {i}'}, 'verses': []}
            else:
                data = fetch_surah(i)
                if isinstance(data, dict) and 'data' in data:
                    surah_obj = data['data']
                else:
                    surah_obj = data

            if single_file:
                collected.append((i, surah_obj))
            else:
                save_surah_html(i, surah_obj)

            time.sleep(0.2)
        except Exception as e:
            print('Failed for surah', i, e)

    # Try Juz pages (optional)
    for j in range(1, 31):
        try:
            print('Fetching juz', j)
            if local_data is not None:
                # local data may not include juz; skip if not present
                print('Skipping lokal juz generation (not implemented)')
                break
            data = fetch_juz(j)
            if isinstance(data, dict) and 'data' in data:
                save_juz_html(j, data['data'])
            else:
                save_juz_html(j, data)
            time.sleep(0.2)
        except Exception as e:
            print('Failed for juz', j, e)

    # generate index listing (either anchors to sections in single file, or links to per-surah files)
    idx = OUT_DIR / 'index.html'
    with open(idx, 'w', encoding='utf-8') as f:
        f.write('<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>فهرس القرآن</title><link href="../styles.css" rel="stylesheet"></head><body>\n')
        f.write('<main class="container" style="padding-top:120px;"><h1 class="section-title">فهرس سور القرآن الكريم</h1><div class="surah-grid">\n')
        if single_file:
            # create anchors list pointing to sections below
            for i, s in collected:
                f.write(f'<a class="surah-card" href="#surah-{i:03d}"><span class="surah-number">{i}</span><div class="surah-info"><h4>سورة {i}</h4></div></a>\n')
        else:
            for i in range(1,115):
                f.write(f'<a class="surah-card" href="surah-{i:03d}.html"><span class="surah-number">{i}</span><div class="surah-info"><h4>سورة {i}</h4></div></a>\n')
        f.write('</div>\n')

        # If single_file, append all surah contents below the index as sections
        if single_file:
            f.write('<hr/>\n')
            for i, s in collected:
                name = s.get('name', {}).get('short') if isinstance(s, dict) else f'سورة {i}'
                f.write(f'<section id="surah-{i:03d}" class="quran-verse-card" style="padding:18px;margin-bottom:28px;">\n')
                f.write(f'<div class="verse-header"><strong>{name} — سورة {i}</strong></div>\n')
                verses = s.get('verses') if isinstance(s, dict) else []
                for v in verses:
                    if isinstance(v, dict):
                        arab = v.get('text', {}).get('arab') if isinstance(v.get('text'), dict) else v.get('text')
                    else:
                        arab = str(v)
                    arab = arab or ''
                    f.write(f'<p class="verse-text">{arab}</p>\n')
                # back to top link
                f.write(f'<p><a href="#top">العودة إلى الأعلى</a></p>\n')
                f.write('</section>\n')

        f.write('</main><script src="../script.js"></script></body></html>')
    print('Wrote index', idx)

    # Patch nav links in the root pages to point to the generated quran index
    patch_nav_links()
if __name__ == '__main__':
    main()
