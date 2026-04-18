// handleSubmit je funkcia, ktorá sa spustí keď sa bude mať odoslať náš formulár
function handleSubmit(e) {
    if (e) e.preventDefault(); // zabrániť vstavenému odosielaniu v prehliadači

    const textarea = document.querySelector("textarea[name='ves']");
    if (!textarea) return;

    const ves = textarea.value; // Načítame text z textarea
    
    // Načítame aktuálnu šírku pravého panelu pre stabilné kreslenie (predchádza nafukovaniu)
    const outputSection = document.querySelector("section:nth-of-type(2)");
    const width = outputSection ? outputSection.clientWidth : 800;

    const formular = new URLSearchParams(); // Vytvoríme štruktúru, ktorá bude reprezentovať formulár
    formular.append('ves', ves); // Pridáme tam naše hodnoty
    formular.append('width', width);

    // Načítame URL a metódu z formulára (fallback na /render a POST)
    const form = document.querySelector("form");
    const url = form ? form.action : "/render";
    const method = form ? form.method : "POST";

    fetch(url, { method: method, body: formular }) // Urobíme HTTP požiadavku
        .then((res) => res.blob()) // Dostali sme binárne dáta (blob)
        .then((image) => {
            const outputImg = document.getElementById("output");
            if (outputImg) outputImg.src = URL.createObjectURL(image); // Nastavíme src nášho <img>
        });
}

// Naviazanie na submit formulára
const form = document.querySelector("form");
if (form) form.addEventListener("submit", handleSubmit);

// --- TÉMA A ZVUK ---
// Theme toggle logic
const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const root = document.documentElement;
        const currentTheme = root.getAttribute('data-theme');
        if (currentTheme === 'light') {
            root.setAttribute('data-theme', 'dark');
            themeToggleBtn.innerText = '🌞 Light Mode';
        } else {
            root.setAttribute('data-theme', 'light');
            themeToggleBtn.innerText = '🌙 Dark Mode';
        }
    });
}

// YouTube Music Logic
const soundToggleBtn = document.getElementById('soundToggle');
let isPlaying = false;
let audioIframe = null;

if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
        if (!isPlaying) {
            audioIframe = document.createElement('iframe');
            audioIframe.src = "https://www.youtube.com/embed/mEJ_jxFJU_0?autoplay=1";
            audioIframe.allow = "autoplay";
            audioIframe.style.width = "2px";
            audioIframe.style.height = "2px";
            audioIframe.style.border = "none";
            audioIframe.style.position = "absolute";
            audioIframe.style.bottom = "0";
            audioIframe.style.right = "0";
            document.body.appendChild(audioIframe);
            soundToggleBtn.innerText = '🔊';
            isPlaying = true;
        } else {
            if (audioIframe) {
                audioIframe.remove();
                audioIframe = null;
            }
            soundToggleBtn.innerText = '🔈';
            isPlaying = false;
        }
    });
}

// --- LOGIKA KRESLIACEJ PALETY ---
let selectedShape = null;
const shapeBtns = document.querySelectorAll('.tool-btn[data-shape]');
const outputImg = document.getElementById('output');

shapeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (selectedShape === btn.dataset.shape) {
            selectedShape = null;
            btn.classList.remove('active');
            if (outputImg) outputImg.classList.remove('crosshair-active');
        } else {
            shapeBtns.forEach(b => b.classList.remove('active'));
            selectedShape = btn.dataset.shape;
            btn.classList.add('active');
            if (outputImg) outputImg.classList.add('crosshair-active');
        }
    });
});

const clearBtn = document.getElementById('clearBtn');
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        const textarea = document.querySelector('textarea[name="ves"]');
        if (textarea) {
            textarea.value = '';
            handleSubmit();
        }
    });
}

if (outputImg) {
    outputImg.addEventListener('click', (e) => {
        if (!selectedShape) return;
        const textarea = document.querySelector('textarea[name="ves"]');
        if (!textarea) return;

        if (textarea.value.trim() === '') {
            const w = textarea.clientWidth > 0 ? textarea.clientWidth : 800;
            const h = textarea.clientHeight > 0 ? textarea.clientHeight : 600;
            textarea.value = `VES v1.0 ${w} ${h}\n`;
        }

        const lines = textarea.value.trim().split('\n');
        let origWidth = 800, origHeight = 600;
        if (lines.length > 0 && lines[0].startsWith('VES')) {
            const parts = lines[0].split(' ').filter(p => p);
            if (parts.length >= 4) {
                origWidth = parseInt(parts[2]) || 800;
                origHeight = parseInt(parts[3]) || 600;
            }
        }

        let clickX = Math.round((e.offsetX / outputImg.clientWidth) * origWidth);
        let clickY = Math.round((e.offsetY / outputImg.clientHeight) * origHeight);
        
        // Bezpečnostná korekcia súradníc
        clickX = Math.max(0, Math.min(clickX, origWidth));
        clickY = Math.max(0, Math.min(clickY, origHeight));

        const color = document.getElementById('shapeColor')?.value.toUpperCase() || '#FF0000';
        const size = parseInt(document.getElementById('shapeSize')?.value || "50", 10);
        const thickness = Math.max(1, Math.floor(size / 15));

        let command = "";
        switch(selectedShape) {
            case 'CIRCLE': command = `CIRCLE ${clickX} ${clickY} ${size} ${thickness} ${color}`; break;
            case 'FILL_CIRCLE': command = `FILL_CIRCLE ${clickX} ${clickY} ${size} ${color}`; break;
            case 'RECT': command = `RECT ${clickX} ${clickY} ${size * 2} ${size} ${thickness} ${color}`; break;
            case 'FILL_RECT': command = `FILL_RECT ${clickX} ${clickY} ${size * 2} ${size} ${color}`; break;
            case 'TRIANGLE': command = `TRIANGLE ${clickX} ${clickY} ${clickX + Math.round(size * 1.2)} ${clickY} ${clickX + Math.round(size * 0.6)} ${clickY - size} ${thickness} ${color}`; break;
        }

        if (textarea.value && !textarea.value.endsWith('\n')) textarea.value += '\n';
        textarea.value += command + '\n';
        form.dispatchEvent(new Event('submit'));
    });
}

// --- GALÉRIA A INICIALIZÁCIA ---
window.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('textarea[name="ves"]');
    
    // Prvotné nastavenie a render
    if (textarea && textarea.value.trim() === '') {
        const w = textarea.clientWidth > 0 ? textarea.clientWidth : 800;
        const h = textarea.clientHeight > 0 ? textarea.clientHeight : 600;
        textarea.value = `VES v1.0 ${w} ${h}\n`;
    }
    handleSubmit();

    const examples = [
        {
            title: '🤖 Robot',
            img: 'robot.png',
            code: 'VES v1.0 800 600\nCLEAR #222222\n\n# --- Telo robota ---\n# Hlavný trup\nFILL_RECT 300 250 200 250 #AAAAAA\nRECT 300 250 200 250 5 #555555\n\n# Hlava\nFILL_RECT 325 100 150 150 #CCCCCC\nRECT 325 100 150 150 5 #555555\n\n# Anténa\nLINE 400 100 400 50 3 #FF0000\nFILL_CIRCLE 400 50 10 #FF0000\n\n# Oči\nFILL_CIRCLE 360 150 20 #000000\nFILL_CIRCLE 440 150 20 #000000\n# Odlesky v očiach\nFILL_CIRCLE 365 145 5 #FFFFFF\nFILL_CIRCLE 445 145 5 #FFFFFF\n\n# Úsmev\nLINE 360 200 440 200 3 #000000\n\n# --- Končatiny ---\n# Ruky\nFILL_RECT 220 280 80 30 #888888\nFILL_RECT 500 280 80 30 #888888\n# Nohy\nFILL_RECT 320 500 50 80 #888888\nFILL_RECT 430 500 50 80 #888888\n\n# --- Detaily na hrudi ---\n# Tlačidlá\nFILL_CIRCLE 350 300 15 #FF0000\nFILL_CIRCLE 400 300 15 #00FF00\nFILL_CIRCLE 450 300 15 #0000FF'
        },
        {
            title: '🏡 Domček',
            img: 'house.png',
            code: 'VES v1.0 800 600\n# --- Pozadie (Obloha) ---\nCLEAR #87CEEB\n\n# --- Tráva ---\nFILL_RECT 0 450 800 150 #228B22\n\n# --- Cestička ku dverám ---\nFILL_RECT 350 500 100 100 #A9A9A9\n\n# --- Domček ---\n# Fasáda\nFILL_RECT 200 300 400 200 #FFCC99\nRECT 200 300 400 200 4 #A0522D\n# Strecha\nFILL_TRIANGLE 150 300 650 300 400 100 #FF0000\n# Dvere\nFILL_RECT 350 400 100 100 #663300\nRECT 350 400 100 100 3 #3E2723\n# Okná\nFILL_RECT 250 350 80 80 #00FFFF\nRECT 250 350 80 80 3 #008B8B\nFILL_RECT 470 350 80 80 #00FFFF\nRECT 470 350 80 80 3 #008B8B\n\n# --- Dekorácie ---\n# Slnko\nFILL_CIRCLE 700 100 50 #FFD700\n# Strom (jednoduchý)\nFILL_RECT 65 430 30 50 #5D4037\nFILL_TRIANGLE 20 430 130 430 80 300 #006400\nFILL_TRIANGLE 30 330 130 330 80 220 #008000\n# Kvetinka\nFILL_CIRCLE 150 500 10 #FF69B4\nFILL_CIRCLE 150 500 5 #FFFF00'
        },
        {
            title: '🌈 Dúha',
            img: 'duha.png',
            code: 'VES v1.0 800 600\n# --- Pozadie (Obloha) ---\nCLEAR #87CEEB\n\n# --- Obláčiky ---\nFILL_CIRCLE 100 200 50 #FFFFFF\nFILL_CIRCLE 150 200 60 #FFFFFF\nFILL_CIRCLE 200 200 50 #FFFFFF\nFILL_CIRCLE 600 150 40 #FFFFFF\nFILL_CIRCLE 650 150 50 #FFFFFF\nFILL_CIRCLE 700 150 40 #FFFFFF\n\n# --- Dúha ---\nFILL_CIRCLE 400 650 450 #FF0000\nFILL_CIRCLE 400 650 410 #FF7F00\nFILL_CIRCLE 400 650 370 #FFFF00\nFILL_CIRCLE 400 650 330 #00FF00\nFILL_CIRCLE 400 650 290 #0000FF\nFILL_CIRCLE 400 650 250 #4B0082\nFILL_CIRCLE 400 650 210 #9400D3\n\n# --- Zrezanie ---\nFILL_RECT 0 450 800 150 #87CEEB'
        },
        {
            title: '🎨 Abstrakt',
            img: 'abstrakt.png',
            code: 'VES v1.0 680 400\n\nCLEAR #FF0000\nFILL_CIRCLE 200 100 50 #00FF00\nFILL_RECT 400 100 150 200 #00FF00\nCIRCLE 300 200 100 1 #FFFFFF\nTRIANGLE 50 100 200 300 150 200 1 #00FF00\nRECT 200 100 300 200 1 #000000\nFILL_TRIANGLE 200 100 400 300 300 300 #0000FF\nLINE 0 0 600 400 1 #000000'
        },
        {
            title: '❄️ Zima',
            img: 'zima.png',
            code: 'VES v1.0 800 600\nCLEAR #001133\n\n# --- Mesiac a Hviezdy ---\nFILL_CIRCLE 700 80 50 #FDFD96\n# Krátery\nFILL_CIRCLE 720 90 10 #ECEC80\nFILL_CIRCLE 690 70 6 #ECEC80\n# Hviezdy\nFILL_CIRCLE 100 50 2 #FFFFFF\nFILL_CIRCLE 250 120 2 #FFFFFF\nFILL_CIRCLE 400 30 3 #FFFFFF\nFILL_CIRCLE 50 200 2 #FFFFFF\nFILL_CIRCLE 550 60 2 #FFFFFF\nFILL_CIRCLE 300 300 2 #FFFFFF\nFILL_CIRCLE 150 150 1 #FFFFFF\n\n# --- Zem (Sneh) ---\nFILL_RECT 0 450 800 150 #F0F8FF\n\n# --- Domček ---\nFILL_RECT 50 300 200 150 #8B0000\nRECT 50 300 200 150 3 #2F0000\nFILL_TRIANGLE 30 300 150 180 270 300 #333333\nTRIANGLE 30 300 150 180 270 300 3 #000000\nFILL_RECT 180 220 30 60 #552200\nRECT 180 220 30 60 2 #000000\nFILL_RECT 120 370 60 80 #654321\nRECT 120 370 60 80 2 #331100\nFILL_CIRCLE 170 410 4 #FFD700\n\n# --- Stromček ---\nFILL_RECT 580 450 40 50 #3E2723\nFILL_TRIANGLE 480 450 720 450 600 300 #006400\nFILL_TRIANGLE 500 350 700 350 600 220 #008000\nFILL_TRIANGLE 530 250 670 250 600 150 #228B22\n\n# --- Snehuliak ---\nFILL_CIRCLE 350 480 45 #FAFAFA\nCIRCLE 350 480 45 1 #CCCCCC\nFILL_CIRCLE 350 420 35 #FAFAFA\nCIRCLE 350 420 35 1 #CCCCCC\nFILL_CIRCLE 350 370 25 #FAFAFA\nCIRCLE 350 370 25 1 #CCCCCC\nFILL_RECT 330 355 40 5 #000000\nFILL_RECT 335 325 30 30 #000000\n\n# --- Darček ---\nFILL_RECT 680 480 50 50 #FF1493\nFILL_RECT 702 480 6 50 #FFFF00\nFILL_RECT 680 502 50 6 #FFFF00\n\nRECT 0 0 799 599 10 #FFFFFF'
        },
        {
            title: '🚗 Auto v horách',
            img: 'auto.png',
            code: 'VES v1.0 700 500\nCLEAR #2BC6FF\n\n#---Hory---\nFILL_TRIANGLE 100 400 340 100 600 400 #4F4F4F\nFILL_RECT 0 300 495 100 #5B626C\nFILL_TRIANGLE 0 300 220 80 350 400 #5B626C\nFILL_TRIANGLE 300 400 650 40 800 400 #5B626C\nFILL_TRIANGLE 300 400 600 90 620 400 #6E7B8D\nFILL_RECT 600 150 100 350 #6E7B8D\n\n#---Cesta---\nFILL_RECT 0 400 700 100 #303030\nFILL_RECT 10 440 60 15 #F0F8FF\nFILL_RECT 100 440 60 15 #F0F8FF\nFILL_RECT 190 440 60 15 #F0F8FF\nFILL_RECT 280 440 60 15 #F0F8FF\nFILL_RECT 370 440 60 15 #F0F8FF\nFILL_RECT 460 440 60 15 #F0F8FF\nFILL_RECT 550 440 60 15 #F0F8FF\nFILL_RECT 640 440 60 15 #F0F8FF\n\n#---Auto---\nFILL_RECT 150 300 450 70 #B20C11\nFILL_TRIANGLE 220 300 270 220 270 300 #B20C11\nFILL_TRIANGLE 500 300 500 220 550 300 #B20C11\nFILL_RECT 275 225 220 73 #82C4DC\nFILL_CIRCLE 255 380 46 #202020\nFILL_CIRCLE 495 380 46 #202020\n\n#---Motýľ---\nFILL_TRIANGLE 455 110 470 80 485 100 #7100A2\nFILL_TRIANGLE 455 110 440 80 425 100 #7100A2\nFILL_TRIANGLE 455 110 485 115 465 125 #A2005F\nFILL_TRIANGLE 455 110 425 115 445 125 #A2005F\nLINE 455 100 455 120 7 #DCD486'
        },
        {
            title: '🎯 Terč',
            img: 'target_preview_1776548322400.png',
            code: 'VES v1.0 800 600\nFILL_CIRCLE 400 300 250 #FF0000\nFILL_CIRCLE 400 300 200 #FFFFFF\nFILL_CIRCLE 400 300 150 #FF0000\nFILL_CIRCLE 400 300 100 #FFFFFF\nFILL_CIRCLE 400 300 50 #FF0000'
        }
    ];

    const examplesList = document.getElementById('examples-list');
    if (examplesList) {
        examplesList.innerHTML = ''; // Vyčistiť pred naplnením
        examples.forEach(ex => {
            const card = document.createElement('div');
            card.className = 'example-card';
            
            if (ex.img) {
                const img = document.createElement('img');
                img.src = ex.img;
                img.className = 'example-img';
                img.alt = ex.title;
                card.appendChild(img);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'example-img placeholder';
                placeholder.innerHTML = '<span>VES</span>';
                card.appendChild(placeholder);
            }

            const title = document.createElement('span');
            title.className = 'example-title';
            title.innerText = ex.title;

            const codePreview = document.createElement('div');
            codePreview.className = 'example-code';
            const lines = ex.code.split('\n');
            codePreview.innerText = lines.slice(0, 3).join('\n') + (lines.length > 3 ? '\n...' : '');

            card.appendChild(title);
            card.appendChild(codePreview);

            card.addEventListener('click', () => {
                const tx = document.querySelector('textarea[name="ves"]');
                if (tx) tx.value = ex.code;
                handleSubmit();
                const wrapper = document.getElementById('canvas-wrapper');
                if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });

            examplesList.appendChild(card);
        });
    }

    const scrollBtn = document.getElementById('scroll-to-canvas');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            const wrapper = document.getElementById('canvas-wrapper');
            if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
});
