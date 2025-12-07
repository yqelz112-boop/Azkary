// ملف JSON المحلي
const JUZ30_JSON_URL = './juz30_data.json'; // تأكد من أن المسار صحيح للملف المحلي

// قائمة السور في جزء عم
const JUZ30_META = [
    { number: 114, name_ar: 'الناس', name_en: 'An-Nas' },
    { number: 112, name_ar: 'الإخلاص', name_en: 'Al-Ikhlas' },
    { number: 113, name_ar: 'الفلق', name_en: 'Al-Falaq' }
];

// في الذاكرة المؤقتة للآيات
const JUZ30_CACHE = {};

const suraListEl = document.getElementById('suraList');
const verseContentEl = document.getElementById('verseContent');

// بناء قائمة السور
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

// جلب الآيات من JSON المحلي
async function selectSura(number) {
    // تحديد السورة النشطة
    document.querySelectorAll('.juz-list .item').forEach(i => i.classList.toggle('active', i.dataset.num == number));
    
    // إذا كانت الآيات مخزنة في الذاكرة المؤقتة، نعرضها
    if (JUZ30_CACHE[number]) {
        renderSura(number, JUZ30_CACHE[number]);
        return;
    }

    // جلب الآيات من الملف المحلي
    try {
        const res = await fetch(JUZ30_JSON_URL);
        if (!res.ok) throw new Error('Failed to load JSON file');
        const json = await res.json();
        
        // تأكد من أن البيانات موجودة للسورة المطلوبة
        const suraData = json[number];
        if (suraData) {
            JUZ30_CACHE[number] = { number, name_ar: suraData.name_ar, verses: suraData.verses };
            renderSura(number, JUZ30_CACHE[number]);
        } else {
            console.error("No data for sura", number);
        }
    } catch (err) {
        console.error('Error loading JSON:', err);
    }
}

// عرض الآيات بعد تحميلها بشكل أفقي
function renderSura(number, sura) {
    verseContentEl.innerHTML = '';
    const header = document.createElement('h2');
    header.textContent = `${sura.name_ar} — سورة ${number}`;
    verseContentEl.appendChild(header);

    // إنشاء الحاوية لعرض الآيات بشكل أفقي
    const list = document.createElement('div');
    list.id = 'verses';
    list.style.display = 'flex'; // استخدم الفليكس لعرض الآيات بشكل أفقي
    list.style.flexWrap = 'wrap'; // السماح بلف العناصر إلى السطر التالي إذا لزم الأمر
    list.style.gap = '10px'; // الفجوات بين الآيات

    sura.verses.forEach(v => {
        const p = document.createElement('div');
        p.className = 'verse';
        p.style.width = 'auto'; // تأكد من أن الآيات لا تأخذ مساحة كبيرة
        p.style.margin = '5px';
        p.innerHTML = `<span class="vnum">${v.number}</span><span class="vtext" style="font-family:var(--font-arabic);">${v.text}</span>`;
        list.appendChild(p);
    });

    verseContentEl.appendChild(list);
}

// ربط البحث مع الأحداث
document.getElementById('searchBtn').addEventListener('click', ()=> searchInJuz(document.getElementById('searchInput').value));
document.getElementById('searchInput').addEventListener('keyup', (e)=>{ if (e.key === 'Enter') searchInJuz(document.getElementById('searchInput').value); });

// إنشاء القائمة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', ()=> buildList());
