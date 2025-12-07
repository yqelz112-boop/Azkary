/*
    juz30.js
    A lightweight Juz Amma viewer.

    This file contains metadata for Juz Amma (surahs 78-114). To keep page size reasonable
    and ensure the site works on GitHub Pages, verses are fetched lazily from a public API
    and cached in-memory. If you prefer a single-file embedded JSON of all verses, I can
    generate `JUZ30_DATA = { ... }` and replace the fetch logic — but that will make this
    file very large. The current implementation works offline if you place a local
    `quran/juz30_data.json` (the code will try local fetch first) or if the API is reachable.
*/

const JUZ30_META = [
    { number: 78, name_ar: 'النبأ', name_en: 'An-Naba' },
    { number: 79, name_ar: 'النازعات', name_en: 'An-Nazi`at' },
    { number: 80, name_ar: 'عبس', name_en: 'Abasa' },
    { number: 81, name_ar: 'التكوير', name_en: 'At-Takwir' },
    { number: 82, name_ar: 'الانفطار', name_en: 'Al-Infitar' },
    { number: 83, name_ar: 'المطففين', name_en: 'Al-Mutaffifin' },
    { number: 84, name_ar: 'الانشقاق', name_en: 'Al-Inshiqaq' },
    { number: 85, name_ar: 'البروج', name_en: 'Al-Buruj' },
    { number: 86, name_ar: 'الطارق', name_en: 'At-Tariq' },
    { number: 87, name_ar: 'الأعلى', name_en: 'Al-Ala' },
    { number: 88, name_ar: 'الغاشية', name_en: 'Al-Ghashiyah' },
    { number: 89, name_ar: 'الفجر', name_en: 'Al-Fajr' },
    { number: 90, name_ar: 'البلد', name_en: 'Al-Balad' },
    { number: 91, name_ar: 'الشمس', name_en: 'Ash-Shams' },
    { number: 92, name_ar: 'الليل', name_en: 'Al-Layl' },
    { number: 93, name_ar: 'الضحى', name_en: 'Ad-Duha' },
    { number: 94, name_ar: 'الشرح', name_en: 'Ash-Sharh' },
    { number: 95, name_ar: 'التين', name_en: 'At-Tin' },
    { number: 96, name_ar: 'العلق', name_en: 'Al-Alaq' },
    { number: 97, name_ar: 'القدر', name_en: 'Al-Qadr' },
    { number: 98, name_ar: 'البينة', name_en: 'Al-Bayyina' },
    { number: 99, name_ar: 'الزلزلة', name_en: 'Az-Zalzalah' },
    { number: 100, name_ar: 'العاديات', name_en: 'Al-Adiyat' },
    { number: 101, name_ar: 'القارعة', name_en: 'Al-Qari`a' },
    { number: 102, name_ar: 'التكاثر', name_en: 'At-Takathur' },
    { number: 103, name_ar: 'العصر', name_en: 'Al-Asr' },
    { number: 104, name_ar: 'الهمزة', name_en: 'Al-Humazah' },
    { number: 105, name_ar: 'الفيل', name_en: 'Al-Fil' },
    { number: 106, name_ar: 'قريش', name_en: 'Quraysh' },
    { number: 107, name_ar: 'الماعون', name_en: 'Al-Maun' },
    { number: 108, name_ar: 'الكوثر', name_en: 'Al-Kawthar' },
    { number: 109, name_ar: 'الكافرون', name_en: 'Al-Kafirun' },
    { number: 110, name_ar: 'النصر', name_en: 'An-Nasr' },
    { number: 111, name_ar: 'المسد', name_en: 'Al-Masad' },
    { number: 112, name_ar: 'الإخلاص', name_en: 'Al-Ikhlas' },
    { number: 113, name_ar: 'الفلق', name_en: 'Al-Falaq' },
    { number: 114, name_ar: 'الناس', name_en: 'An-Nas' }
];

// In-memory cache for verses keyed by surah number
const JUZ30_CACHE = {};

const suraListEl = document.getElementById('suraList');
const verseContentEl = document.getElementById('verseContent');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Build list UI
function buildList() {
    JUZ30_META.forEach(meta => {
        const it = document.createElement('div');
        it.className = 'item';
        it.dataset.num = meta.number;
        it.innerHTML = `<div style="display:flex;flex-direction:column"><strong style="font-family:var(--font-arabic);">${meta.name_ar}</strong><small style="color:var(--foreground-light)">${meta.name_en}</small></div><div style="margin-left:auto;font-weight:700;">سورة ${meta.number}</div>`;
        it.addEventListener('click', () => selectSura(meta.number));
        suraListEl.appendChild(it);
    });
}

// Select sura: load verses (local -> local JSON -> API)
async function selectSura(number) {
    // mark active
    document.querySelectorAll('.juz-list .item').forEach(i => i.classList.toggle('active', i.dataset.num == number));
    // if cached, render
    if (JUZ30_CACHE[number]) { renderSura(number, JUZ30_CACHE[number]); return; }

    // try local static files first (several fallbacks) to support offline hosting
    const localCandidates = ['./juz30_data.json', './juz30.json', './full.json', '../quran/juz30_data.json', '../quran/full.json'];
    for (const candidate of localCandidates) {
        try {
            const r = await fetch(candidate, { cache: 'no-store' });
            if (!r.ok) continue;
            const json = await r.json();
            // support either { number: {...} } keyed object or { data: [...] } or array
            let mapped = null;
            if (json && json[number]) mapped = json[number];
            else if (json && json.data && (Array.isArray(json.data) || typeof json.data === 'object')) {
                mapped = Array.isArray(json.data) ? json.data[number - 1] : (json.data[String(number)] || json.data[number]);
            } else if (Array.isArray(json)) mapped = json[number - 1];
            if (mapped) {
                // normalize verses
                const verses = (mapped.verses || mapped.ayahs || mapped.ayahs_ar || []).map(v => ({ number: v.number ? (v.number.inSurah || v.number) : (v.number || 0), text: (v.text && (v.text.arab || v.text)) || v.text || (typeof v === 'string' ? v : '') }));
                JUZ30_CACHE[number] = { number, name_ar: (mapped.name && (mapped.name.short || mapped.name)) || mapped.name_ar || `سورة ${number}`, verses };
                renderSura(number, JUZ30_CACHE[number]);
                return;
            }
        } catch (e) {
            // try next candidate
        }
    }

    // Fallback to public API (sutanlab) — small delay & polite
    const API = `https://api.quran.sutanlab.id/surah/${number}`;
    try {
        verseContentEl.innerHTML = '<p class="muted">جاري تحميل السورة…</p>';
        const res = await fetch(API);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        // normalize verses: array of objects with { number, text }
        const verses = (json && json.data && json.data.verses) ? json.data.verses.map(v => ({ number: v.number.inSurah || v.number, text: (v.text && (v.text.arab || v.text)) || v.text })) : (Array.isArray(json) ? json : []);
        // store minimal normalized data
        JUZ30_CACHE[number] = { number, name_ar: (json.data && json.data.name && json.data.name.short) || `سورة ${number}`, verses };
        renderSura(number, JUZ30_CACHE[number]);
    } catch (err) {
        verseContentEl.innerHTML = `<p class="muted">تعذر تحميل السورة (${err.message}).</p>`;
        console.error('Failed to load sura', number, err);
    }
}

function renderSura(number, sura) {
    verseContentEl.innerHTML = '';
    const header = document.createElement('h2');
    header.textContent = `${sura.name_ar} — سورة ${number}`;
    verseContentEl.appendChild(header);

    const list = document.createElement('div');
    list.id = 'verses';
    (sura.verses || []).forEach(v => {
        const p = document.createElement('div');
        p.className = 'verse';
        p.innerHTML = `<span class="vnum">${v.number}</span><span class="vtext" style="font-family:var(--font-arabic);">${v.text}</span>`;
        list.appendChild(p);
    });
    verseContentEl.appendChild(list);
    // scroll panel to top
    const panel = document.getElementById('versePanel'); if (panel) panel.scrollTop = 0;
}

// Search across loaded suras (will fetch missing ones as needed)
async function searchInJuz(query) {
    query = query.trim();
    if (!query) return;
    verseContentEl.innerHTML = `<p class="muted">جارٍ البحث عن "${query}" …</p>`;
    const results = [];
    for (const meta of JUZ30_META) {
        if (!JUZ30_CACHE[meta.number]) await selectSura(meta.number);
        const s = JUZ30_CACHE[meta.number];
        if (!s || !s.verses) continue;
        s.verses.forEach(v => {
            if (v.text && v.text.includes(query)) results.push({ sura: meta, verse: v });
        });
    }
    // render results
    verseContentEl.innerHTML = '';
    const header = document.createElement('h2'); header.textContent = `نتائج البحث عن: ${query}`; verseContentEl.appendChild(header);
    if (results.length === 0) { verseContentEl.innerHTML += `<p class="muted">لا توجد نتائج.</p>`; return; }
    results.forEach(r => {
        const row = document.createElement('div'); row.className = 'verse';
        row.innerHTML = `<strong style="display:block">${r.sura.name_ar} — سورة ${r.sura.number}</strong><div style="margin-top:6px">${r.verse.text} <span class="vnum">${r.verse.number}</span></div>`;
        verseContentEl.appendChild(row);
    });
}

// Wire search
searchBtn.addEventListener('click', ()=> searchInJuz(searchInput.value));
searchInput.addEventListener('keyup', (e)=>{ if (e.key === 'Enter') searchInJuz(searchInput.value); });

// init
document.addEventListener('DOMContentLoaded', ()=> buildList());

// Utility: allow downloading embedded JSON for offline hosting
function downloadJuz30Data() {
    const payload = {};
    for (const meta of JUZ30_META) {
        if (JUZ30_CACHE[meta.number]) payload[meta.number] = JUZ30_CACHE[meta.number];
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'juz30_data.json'; a.click();
}

// Expose helper to console for power users
window.JUZ30 = { META: JUZ30_META, CACHE: JUZ30_CACHE, selectSura, downloadJuz30Data };