function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('active');
}

function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.remove('active');
}

// ========================================
// Hadith Data & Carousel
// ========================================
const hadiths = [
    {
        id: 1,
        text: "إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى",
        narrator: "عمر بن الخطاب رضي الله عنه",
        source: "صحيح البخاري"
    },
    {
        id: 2,
        text: "من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت",
        narrator: "أبو هريرة رضي الله عنه",
        source: "صحيح البخاري"
    },
    {
        id: 3,
        text: "لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه",
        narrator: "أنس بن مالك رضي الله عنه",
        source: "صحيح البخاري"
    },
    {
        id: 4,
        text: "المسلم من سلم المسلمون من لسانه ويده",
        narrator: "عبدالله بن عمرو رضي الله عنه",
        source: "صحيح البخاري"
    }
];

let currentHadithIndex = 0;
let likedHadiths = [];

function initHadithCarousel() {
    updateHadithDisplay();
    createHadithDots();
}

function updateHadithDisplay() {
    const hadith = hadiths[currentHadithIndex];
    const tEl = document.getElementById('hadithText'); if (tEl) tEl.textContent = hadith.text;
    const nEl = document.getElementById('hadithNarrator'); if (nEl) nEl.textContent = hadith.narrator;
    const sEl = document.getElementById('hadithSource'); if (sEl) sEl.textContent = hadith.source;
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) likeBtn.textContent = likedHadiths.includes(hadith.id) ? '❤️' : '🤍';
    updateHadithDots();
}

function createHadithDots() {
    const dotsContainer = document.getElementById('hadithDots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    hadiths.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = `hadith-dot ${index === currentHadithIndex ? 'active' : ''}`;
        dot.onclick = () => goToHadith(index);
        dotsContainer.appendChild(dot);
    });
}

function updateHadithDots() {
    const dots = document.querySelectorAll('.hadith-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentHadithIndex);
    });
}

function prevHadith() {
    currentHadithIndex = (currentHadithIndex - 1 + hadiths.length) % hadiths.length;
    updateHadithDisplay();
}

function nextHadith() {
    currentHadithIndex = (currentHadithIndex + 1) % hadiths.length;
    updateHadithDisplay();
}

function goToHadith(index) {
    currentHadithIndex = index;
    updateHadithDisplay();
}

function toggleLikeHadith() {
    const hadithId = hadiths[currentHadithIndex].id;
    if (likedHadiths.includes(hadithId)) {
        likedHadiths = likedHadiths.filter(id => id !== hadithId);
    } else {
        likedHadiths.push(hadithId);
    }
    updateHadithDisplay();
}

function shareHadith() {
    const hadith = hadiths[currentHadithIndex];
    const text = `${hadith.text}\n\n- ${hadith.narrator}\n📖 ${hadith.source}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'حديث نبوي',
            text: text
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('تم نسخ الحديث!');
        });
    }
}

// ========================================
// Tasbeeh Counter
// ========================================
let tasbeehCount = 0;
let tasbeehTarget = 33;
let tasbeehArabic = 'سبحان الله';
let tasbeehTranslation = 'Glory be to Allah';
let soundEnabled = true;

function selectTasbeeh(element, arabic, translation, target) {
    // Update active state
    document.querySelectorAll('.tasbeeh-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    
    // Update values
    tasbeehArabic = arabic;
    tasbeehTranslation = translation;
    tasbeehTarget = target;
    tasbeehCount = 0;
    
    // Update display
    document.getElementById('tasbeehArabic').textContent = arabic;
    document.getElementById('tasbeehTranslation').textContent = translation;
    document.getElementById('counterTarget').textContent = `/ ${target}`;
    updateCounterDisplay();
}

function incrementCounter() {
    if (tasbeehCount < tasbeehTarget) {
        tasbeehCount++;
        updateCounterDisplay();
        
        if (soundEnabled) {
            playClickSound();
        }
        
        if (tasbeehCount === tasbeehTarget) {
            celebrateCompletion();
        }
    }
}

function updateCounterDisplay() {
    document.getElementById('counterNumber').textContent = tasbeehCount;
    
    // Update progress ring
    const progressRing = document.getElementById('progressRing');
    const circumference = 2 * Math.PI * 90; // radius = 90
    const progress = tasbeehCount / tasbeehTarget;
    const offset = circumference * (1 - progress);
    progressRing.style.strokeDashoffset = offset;
}

function resetCounter() {
    tasbeehCount = 0;
    updateCounterDisplay();
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('soundIcon').textContent = soundEnabled ? '🔊' : '🔇';
}

function playClickSound() {
    // Create a simple click sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Audio not supported
    }
}

function celebrateCompletion() {
    const counterCircle = document.querySelector('.counter-circle');
    counterCircle.style.animation = 'pulse 0.5s ease-in-out 3';
    
    setTimeout(() => {
        counterCircle.style.animation = '';
        showToast('ما شاء الله! أكملت التسبيح 🎉');
        showNotification('المسبحة', 'ما شاء الله! أكملت عدد التسبيح المطلوب');
    }, 1500);
}

// -------------------------------
// Toast & Notification helpers
// -------------------------------
function showToast(message, timeout = 4500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'app-toast';
    toast.textContent = message;
    toast.style = 'background:rgba(0,0,0,0.85);color:#fff;padding:12px 16px;border-radius:8px;margin-top:8px;box-shadow:0 6px 18px rgba(0,0,0,0.25);font-weight:600;';
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity .35s ease, transform .35s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => container.removeChild(toast), 400);
    }, timeout);
}

function showNotification(title, body) {
    if (window.Notification && Notification.permission === 'granted') {
        new Notification(title, { body });
    } else if (window.Notification && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') new Notification(title, { body });
        });
    } else {
        // fallback to toast
        showToast(`${title} — ${body}`);
    }
}

// -------------------------------
// Prayer times widget
// Uses Aladhan API for simplicity (requires network at runtime)
// -------------------------------
const PRAYER_API_METHOD = 3; // Muslim World League by default
let scheduledPrayerTimeouts = [];
// Qibla globals
let currentQiblaBearing = null; // degrees from North to Kaaba
let deviceOrientationHandler = null;

function initPrayerWidget() {
    const btn = document.getElementById('prayerSettingsBtn');
    if (btn) btn.addEventListener('click', promptForLocation);

    // wire inline edit button on main page
    const editBtn = document.getElementById('editPrayerLocationBtn');
    if (editBtn) editBtn.addEventListener('click', promptForLocation);

    // display saved location if any
    updatePrayerLocationDisplay();

    // try geolocation, fallback to ask
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
            try{ updateQibla(pos.coords.latitude, pos.coords.longitude); }catch(e){}
        }, err => {
            // fallback: ask for city
            // don't prompt immediately
        }, { timeout: 8000 });
    }

    // If we're on the dedicated prayer page and there's no saved location, prompt user.
    try {
        const onPrayerPage = window.location.pathname.endsWith('prayer.html') || window.location.href.includes('prayer.html');
        const saved = localStorage.getItem('prayer_location');
        if (onPrayerPage && (!saved || saved === 'null')) {
            // Prefer inline form if available on the page, otherwise fall back to modal
            const inlineForm = document.getElementById('inlineLocationForm');
            if (inlineForm) {
                // prefill if any and show
                const cityEl = document.getElementById('inlineLocCity');
                const countryEl = document.getElementById('inlineLocCountry');
                try{
                    const obj = JSON.parse(saved || 'null');
                    if (cityEl && obj) cityEl.value = obj.city || '';
                    if (countryEl && obj) countryEl.value = obj.country || '';
                }catch(e){}
                setTimeout(()=> showInlineLocationForm(), 300);
            } else {
                setTimeout(() => { promptForLocation(); }, 350);
            }
        }
    } catch (e) {}
}

// -------------------------------
// Qibla direction helpers
// -------------------------------
const KAABA_LAT = 21.422487;
const KAABA_LON = 39.826206;

function toRad(d) { return d * Math.PI / 180; }
function toDeg(r) { return r * 180 / Math.PI; }

function computeInitialBearing(lat1, lon1, lat2, lon2) {
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δλ = toRad(lon2 - lon1);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let θ = Math.atan2(y, x);
    let brng = (toDeg(θ) + 360) % 360;
    return brng;
}

function updateQibla(lat, lon) {
    if (typeof lat !== 'number' || typeof lon !== 'number') return;
    currentQiblaBearing = computeInitialBearing(lat, lon, KAABA_LAT, KAABA_LON);
    const degEl = document.getElementById('qiblaDegree');
    const arrow = document.getElementById('qiblaArrow');
    if (degEl) degEl.textContent = `الزاوية: ${Math.round(currentQiblaBearing)}°`;
    // If no device heading, rotate arrow to absolute bearing (clockwise from North)
    if (arrow && !deviceOrientationHandler) {
        requestAnimationFrame(()=> arrow.style.transform = `rotate(${currentQiblaBearing}deg)`);
    }
}

function enableDeviceCompass() {
    if (deviceOrientationHandler) return; // already enabled
    function getScreenOrientationAngle() {
        try {
            if (screen && screen.orientation && typeof screen.orientation.angle === 'number') return screen.orientation.angle;
        } catch (e) {}
        if (typeof window.orientation === 'number') return window.orientation;
        return 0;
    }

    function handle(e) {
        // prefer webkitCompassHeading if available (iOS)
        let heading = null;
        if (typeof e.webkitCompassHeading !== 'undefined' && e.webkitCompassHeading !== null) {
            heading = e.webkitCompassHeading; // 0 = North
        } else if (typeof e.alpha === 'number') {
            // compute heading from alpha and screen orientation
            const alpha = e.alpha; // device rotation around z
            const screenAngle = getScreenOrientationAngle();
            // heading: 0 = north, increasing clockwise
            heading = (360 - alpha + screenAngle) % 360;
        }
        if (heading === null) return;
        const arrow = document.getElementById('qiblaArrow');
        if (!arrow || currentQiblaBearing === null) return;
        const rotation = (currentQiblaBearing - heading + 360) % 360;
        // apply rotation smoothly
        requestAnimationFrame(()=> arrow.style.transform = `rotate(${rotation}deg)`);
        const degEl = document.getElementById('qiblaDegree');
        if (degEl) degEl.textContent = `الزاوية: ${Math.round(currentQiblaBearing)}° • بوصلتك: ${Math.round(heading)}°`;
    }

    // Ensure we have a Qibla bearing first. Try saved city, then geolocation.
    const ensureQiblaThenEnable = () => {
        if (currentQiblaBearing !== null) {
            // proceed to enable device orientation
            const attach = () => { window.addEventListener('deviceorientation', handle, true); deviceOrientationHandler = handle; showToast('تم تفعيل البوصلة'); };
            if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().then(response => {
                    if (response === 'granted') { attach(); }
                    else { showToast('لم يتم منح إذن الوصول إلى مستشعر البوصلة'); }
                }).catch(()=> showToast('خطأ عند طلب إذن البوصلة'));
            } else { attach(); }
            return;
        }

        // Try to geocode saved city
        try {
            const saved = JSON.parse(localStorage.getItem('prayer_location') || 'null');
            if (saved && saved.city) {
                geocodeCity(saved.city, saved.country).then(coords => {
                    if (coords) {
                        updateQibla(coords.lat, coords.lon);
                        ensureQiblaThenEnable();
                    } else if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(p=>{ updateQibla(p.coords.latitude, p.coords.longitude); ensureQiblaThenEnable(); }, ()=>{ showToast('تعذر الحصول على الموقع. الرجاء تحديد المدينة يدوياً أو السماح بالوصول للموقع.'); });
                    } else {
                        showToast('لا يوجد موقع محدد لحساب القبلة. الرجاء تحديد المدينة أو استخدام زر "استخدام موقعي".');
                    }
                });
                return;
            }
        } catch(e) {}

        // fallback: try device geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(p=>{ updateQibla(p.coords.latitude, p.coords.longitude); ensureQiblaThenEnable(); }, ()=>{ showToast('تعذر الحصول على الموقع. الرجاء تحديد المدينة يدوياً أو السماح بالوصول للموقع.'); }, { timeout: 8000 });
        } else {
            showToast('لا يوجد وسيلة للحصول على الموقع لحساب القبلة. الرجاء إدخال المدينة يدوياً.');
        }
    };

    ensureQiblaThenEnable();
}

function disableDeviceCompass() {
    if (!deviceOrientationHandler) return;
    window.removeEventListener('deviceorientation', deviceOrientationHandler, true);
    deviceOrientationHandler = null;
    // reset arrow to absolute bearing
    const arrow = document.getElementById('qiblaArrow');
    if (arrow && currentQiblaBearing !== null) arrow.style.transform = `rotate(${currentQiblaBearing}deg)`;
}

// -------------------------------
// Geocoding (Nominatim) - resolve city -> lat/lon
// -------------------------------
function geocodeCity(city, country) {
    if (!city) return Promise.resolve(null);
    const q = country ? `${city}, ${country}` : city;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
    return fetch(url, { method: 'GET' })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Geocode failed')))
        .then(arr => {
            if (!Array.isArray(arr) || arr.length === 0) return null;
            const first = arr[0];
            const lat = parseFloat(first.lat);
            const lon = parseFloat(first.lon);
            if (isNaN(lat) || isNaN(lon)) return null;
            return { lat, lon };
        }).catch(err => {
            console.warn('geocode error', err);
            return null;
        });
}

function promptForLocation() {
    // If there's a location modal in the page, open it for better input (city + optional country)
    const modal = document.getElementById('locationModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // prefill from localStorage if available
        const saved = localStorage.getItem('prayer_location');
        if (saved) {
            try {
                const obj = JSON.parse(saved);
                const cityEl = document.getElementById('locCity');
                const countryEl = document.getElementById('locCountry');
                if (cityEl) cityEl.value = obj.city || '';
                if (countryEl) countryEl.value = obj.country || '';
            } catch(e) {}
        }
        // focus first input for better UX
        const cityInput = document.getElementById('locCity');
        if (cityInput) setTimeout(()=> cityInput.focus(), 80);
        return;
    }

    // fallback to simple prompt
    const city = prompt('أدخل اسم المدينة أو اضغط إلغاء لاستخدام الموقع الجغرافي: (مثال: Cairo)');
    if (!city) {
        if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => fetchPrayerTimes(p.coords.latitude, p.coords.longitude), () => showToast('تعذر تحديد الموقع. الرجاء إدخال المدينة يدوياً.'));
        return;
    }
    fetchPrayerTimesByCity(city, '');
}

function closeLocationModal(){
    const modal = document.getElementById('locationModal');
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

function updatePrayerLocationDisplay() {
    const locDisplay = document.getElementById('prayerLocationName');
    const inlineDisplay = document.getElementById('inlinePrayerLocationName');
    let text = 'غير محدد';
    try{
        const saved = JSON.parse(localStorage.getItem('prayer_location') || 'null');
        if (saved && saved.city) text = saved.country ? `${saved.city}, ${saved.country}` : saved.city;
    }catch(e){ text = 'غير محدد'; }
    if (locDisplay) locDisplay.textContent = text;
    if (inlineDisplay) inlineDisplay.textContent = text;
}

// Helpers for inline form on prayer.html
function showInlineLocationForm() {
    const form = document.getElementById('inlineLocationForm');
    if (!form) return;
    form.style.display = 'flex';
    form.style.flexWrap = 'wrap';
    const city = document.getElementById('inlineLocCity');
    if (city) setTimeout(()=> city.focus(), 60);
}

function hideInlineLocationForm() {
    const form = document.getElementById('inlineLocationForm');
    if (!form) return;
    form.style.display = 'none';
}

function fetchPrayerTimesByCity(city, country){
    const q = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country||'')}&method=${PRAYER_API_METHOD}`;
    fetch(q)
        .then(r => r.json())
        .then(data => {
            if (data && data.data) renderPrayerTimes(data.data);
            else showToast('تعذر جلب مواقيت الصلاة للمدينة المحددة');
        }).catch(()=> showToast('خطأ عند جلب مواقيت الصلاة'));
}



function fetchPrayerTimes(lat, lng) {
    fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${PRAYER_API_METHOD}`)
        .then(r => r.json())
        .then(data => {
            if (data && data.data) renderPrayerTimes(data.data);
            else showToast('تعذر جلب مواقيت الصلاة');
        }).catch(()=> showToast('خطأ عند جلب مواقيت الصلاة'));
}

function renderPrayerTimes(payload) {
    const list = document.getElementById('prayerList');
    if (!list) return;
    const timings = payload.timings;
    list.innerHTML = '';
    const order = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
    order.forEach(key => {
        if (!timings[key]) return;
        const row = document.createElement('div');
        row.className = 'prayer-row';
        row.innerHTML = `<span class="prayer-name">${arabicPrayerName(key)}</span><span class="prayer-time">${timings[key]}</span>`;
        list.appendChild(row);
    });

    // schedule notifications for upcoming prayers
    clearScheduledPrayers();
    schedulePrayerNotifications(timings);
}

function arabicPrayerName(key) {
    switch(key) {
        case 'Fajr': return 'الفجر';
        case 'Sunrise': return 'الشروق';
        case 'Dhuhr': return 'الظهر';
        case 'Asr': return 'العصر';
        case 'Maghrib': return 'المغرب';
        case 'Isha': return 'العشاء';
        default: return key;
    }
}

function clearScheduledPrayers() {
    scheduledPrayerTimeouts.forEach(t => clearTimeout(t));
    scheduledPrayerTimeouts = [];
}

function schedulePrayerNotifications(timings) {
    const now = new Date();
    Object.keys(timings).forEach(key => {
        const timeStr = timings[key];
        const hhmm = timeStr.split(' ')[0];
        const [hh, mm] = hhmm.split(':').map(Number);
        if (isNaN(hh) || isNaN(mm)) return;
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
        if (target <= now) return;
        const delay = target - now;
        const t = setTimeout(()=>{
            const name = arabicPrayerName(key);
            showToast(`حان الآن وقت ${name}`);
            showNotification('موعد الصلاة', `حان الآن وقت ${name}`);
        }, delay);
        scheduledPrayerTimeouts.push(t);
    });
}

// ========================================
// Azkar Modal & Data
// ========================================
const azkarData = {
    morning: {
        title: 'أذكار الصباح',
        items: [
            { text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ', count: 1 },
            { text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ', count: 1 },
            { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100 },
            { text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', count: 100 },
            { text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', count: 100 }
        ]
    },
    evening: {
        title: 'أذكار المساء',
        items: [
            { text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ للهِ، وَالْحَمْدُ للهِ، لَا إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ', count: 1 },
            { text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ', count: 1 },
            { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100 },
            { text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', count: 3 }
        ]
    },
    sleep: {
        title: 'أذكار النوم',
        items: [
            { text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', count: 1 },
            { text: 'سُبْحَانَ اللَّهِ', count: 33 },
            { text: 'الْحَمْدُ لِلَّهِ', count: 33 },
            { text: 'اللَّهُ أَكْبَرُ', count: 34 }
        ]
    },
    prayer: {
        title: 'أذكار بعد الصلاة',
        items: [
            { text: 'أَسْتَغْفِرُ اللَّهَ', count: 3 },
            { text: 'اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ', count: 1 },
            { text: 'سُبْحَانَ اللَّهِ', count: 33 },
            { text: 'الْحَمْدُ لِلَّهِ', count: 33 },
            { text: 'اللَّهُ أَكْبَرُ', count: 33 }
        ]
    },
    travel: {
        title: 'أذكار السفر',
        items: [
            { text: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ', count: 1 },
            { text: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى', count: 1 },
            { text: 'اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ', count: 1 }
        ]
    },
    general: {
        title: 'أذكار متنوعة',
        items: [
            { text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', count: 10 },
            { text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', count: 7 },
            { text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', count: 10 }
        ]
    }
};

// Track individual zikr counts
let zikrCounts = {};

function openAzkarModal(category) {
    const data = azkarData[category];
    if (!data) return;
    
    // Initialize counts for this category if not exists
    if (!zikrCounts[category]) {
        zikrCounts[category] = data.items.map(() => 0);
    }
    
    document.getElementById('modalTitle').textContent = data.title;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = data.items.map((item, index) => `
        <div class="zikr-item">
            <p class="zikr-text">${item.text}</p>
            <div class="zikr-count-container">
                <div class="zikr-counter">
                    <button onclick="decrementZikr('${category}', ${index})">-</button>
                    <span id="zikr-${category}-${index}">${zikrCounts[category][index]} / ${item.count}</span>
                    <button onclick="incrementZikr('${category}', ${index}, ${item.count})">+</button>
                </div>
                <span class="zikr-target">المطلوب: ${item.count} مرة</span>
            </div>
        </div>
    `).join('');
    
    document.getElementById('azkarModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAzkarModal() {
    document.getElementById('azkarModal').classList.remove('active');
    document.body.style.overflow = '';
}

function incrementZikr(category, index, max) {
    if (zikrCounts[category][index] < max) {
        zikrCounts[category][index]++;
        document.getElementById(`zikr-${category}-${index}`).textContent = 
            `${zikrCounts[category][index]} / ${max}`;
        
        if (soundEnabled) {
            playClickSound();
        }
    }
}

function decrementZikr(category, index) {
    const data = azkarData[category];
    if (zikrCounts[category][index] > 0) {
        zikrCounts[category][index]--;
        document.getElementById(`zikr-${category}-${index}`).textContent = 
            `${zikrCounts[category][index]} / ${data.items[index].count}`;
    }
}

// Close modal on outside click
document.getElementById('azkarModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'azkarModal') {
        closeAzkarModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAzkarModal();
    }
});

// ========================================
// Initialize
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize hadith carousel only if hadith DOM exists
    if (document.getElementById('hadithText')) {
        try { initHadithCarousel(); } catch(e) { console.warn('Hadith init failed', e); }
    }
    // initialize prayer widget (geolocation or manual city) if prayer elements present
    if (document.getElementById('prayerSettingsBtn') || document.getElementById('prayerList') || document.getElementById('prayerWidget')) {
        try { initPrayerWidget(); } catch(e) { console.warn('Prayer widget init failed', e); }
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Wire location modal buttons once
    const saveBtn = document.getElementById('saveLocationBtn');
    const cancelBtn = document.getElementById('cancelLocationBtn');
    const closeBtn = document.getElementById('closeLocationModal');
    const locModal = document.getElementById('locationModal');

    if (saveBtn) saveBtn.addEventListener('click', ()=>{
        const cityEl = document.getElementById('locCity');
        const countryEl = document.getElementById('locCountry');
        const city = cityEl ? cityEl.value.trim() : '';
        const country = countryEl ? countryEl.value.trim() : '';
        if (!city) { showToast('الرجاء إدخال اسم المدينة'); return; }
        localStorage.setItem('prayer_location', JSON.stringify({ city, country }));
        updatePrayerLocationDisplay();
        closeLocationModal();
        fetchPrayerTimesByCity(city, country);
        // Attempt to geocode the saved city to compute Qibla
        geocodeCity(city, country).then(coords => {
            if (coords) {
                updateQibla(coords.lat, coords.lon);
            } else {
                // fallback: try device geolocation if available
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(p=>{
                        try { updateQibla(p.coords.latitude, p.coords.longitude); } catch(e){}
                    }, ()=>{}, { timeout: 6000 });
                } else {
                    showToast('تعذر تحديد إحداثيات المدينة لحساب القبلة');
                }
            }
        });
    });
    if (cancelBtn) cancelBtn.addEventListener('click', closeLocationModal);
    if (closeBtn) closeBtn.addEventListener('click', closeLocationModal);
    // close modal when clicking outside content
    if (locModal) locModal.addEventListener('click', (e)=>{ if (e.target.id === 'locationModal') closeLocationModal(); });

    // Inline form wiring for prayer.html (if present)
    const toggleInlineBtn = document.getElementById('toggleInlineLocationBtn');
    const inlineSaveBtn = document.getElementById('inlineSaveLocationBtn');
    const inlineCancelBtn = document.getElementById('inlineCancelLocationBtn');
    if (toggleInlineBtn) toggleInlineBtn.addEventListener('click', ()=>{
        showInlineLocationForm();
    });
    if (inlineSaveBtn) inlineSaveBtn.addEventListener('click', ()=>{
        const cityEl = document.getElementById('inlineLocCity');
        const countryEl = document.getElementById('inlineLocCountry');
        const city = cityEl ? cityEl.value.trim() : '';
        const country = countryEl ? countryEl.value.trim() : '';
        if (!city) { showToast('الرجاء إدخال اسم المدينة'); return; }
        localStorage.setItem('prayer_location', JSON.stringify({ city, country }));
        updatePrayerLocationDisplay();
        hideInlineLocationForm();
        fetchPrayerTimesByCity(city, country);
        // Geocode the saved city to compute Qibla; fallback to device geolocation
        geocodeCity(city, country).then(coords => {
            if (coords) updateQibla(coords.lat, coords.lon);
            else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(p=>{
                    try { updateQibla(p.coords.latitude, p.coords.longitude); } catch(e){}
                }, ()=>{}, { timeout: 6000 });
            } else {
                showToast('تعذر تحديد إحداثيات المدينة لحساب القبلة');
            }
        });
    });
    if (inlineCancelBtn) inlineCancelBtn.addEventListener('click', ()=>{
        hideInlineLocationForm();
    });
    // Permission modal wiring (retry/close)
    const locationPermissionModal = document.getElementById('locationPermissionModal');
    const retryGeoBtn = document.getElementById('retryGeolocationBtn');
    const dismissPermBtn = document.getElementById('dismissPermissionModal');
    const closePermModalBtn = document.getElementById('closePermissionModal');
    function showLocationPermissionModal(){ if (locationPermissionModal) { locationPermissionModal.classList.add('active'); document.body.style.overflow='hidden'; } }
    function hideLocationPermissionModal(){ if (locationPermissionModal) { locationPermissionModal.classList.remove('active'); document.body.style.overflow=''; } }
    if (retryGeoBtn) retryGeoBtn.addEventListener('click', ()=>{ hideLocationPermissionModal(); qiblaGeoBtn && qiblaGeoBtn.click(); });
    if (dismissPermBtn) dismissPermBtn.addEventListener('click', hideLocationPermissionModal);
    if (closePermModalBtn) closePermModalBtn.addEventListener('click', hideLocationPermissionModal);
    // Qibla buttons
    const qiblaGeoBtn = document.getElementById('qiblaUseGeoBtn');
    const qiblaDeviceBtn = document.getElementById('qiblaUseDeviceBtn');
    if (qiblaGeoBtn) qiblaGeoBtn.addEventListener('click', ()=>{
        // Improved permission-aware flow
        if (!navigator.geolocation) { showToast('الموقع غير مدعوم في هذا المتصفح'); return; }
        // If Permissions API is available, check status first
        const tryGeolocate = () => {
            showToast('جاري تحديد موقعك...');
            navigator.geolocation.getCurrentPosition(pos => {
                updateQibla(pos.coords.latitude, pos.coords.longitude);
                // also fetch prayer times by coords
                fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
            }, err => {
                // More detailed error handling
                if (err && err.code === 1) { // PERMISSION_DENIED
                    // show modal with instructions
                    showLocationPermissionModal();
                } else if (err && err.code === 2) { // POSITION_UNAVAILABLE
                    showToast('تعذر تحديد موقعك حالياً. حاول في مكان به إشارة GPS أفضل.');
                } else if (err && err.code === 3) { // TIMEOUT
                    showToast('انتهت مهلة الحصول على الموقع. حاول مرة أخرى.');
                } else {
                    showToast('تعذر الحصول على موقعك. الرجاء التحقق من أذونات الموقع.');
                }
            }, { timeout: 10000, enableHighAccuracy: true });
        };

        if (navigator.permissions && navigator.permissions.query) {
            try {
                navigator.permissions.query({ name: 'geolocation' }).then(p => {
                    if (p.state === 'granted') {
                        tryGeolocate();
                    } else if (p.state === 'prompt') {
                        tryGeolocate();
                    } else if (p.state === 'denied') {
                        // user has denied — show modal with steps
                        showLocationPermissionModal();
                        // listen for change so user can retry
                        p.onchange = () => { if (p.state === 'granted') tryGeolocate(); };
                    } else {
                        tryGeolocate();
                    }
                }).catch(()=> tryGeolocate());
            } catch(e) { tryGeolocate(); }
        } else {
            // Fallback: just try and handle errors
            tryGeolocate();
        }
    });
    if (qiblaDeviceBtn) qiblaDeviceBtn.addEventListener('click', ()=>{
        // toggle device compass
        if (deviceOrientationHandler) { disableDeviceCompass(); showToast('تم إيقاف البوصلة'); }
        else enableDeviceCompass();
    });
});

// Add CSS animation for pulse
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
`;
document.head.appendChild(style);


