// handleSubmit je funkcia, ktorá sa spustí keď sa bude mať odoslať náš formulár
function handleSubmit(e) {
    e.preventDefault(); // zabrániť vstavenému odosielaniu v prehliadači

    // this reprezentuje ten formular, ktory odosielame
    const ves = this.querySelector("textarea").value; // Načítame text z textarea
    const outputSection = document.querySelector("section:nth-of-type(2)");
    const width = outputSection ? outputSection.clientWidth : 800; // Použijeme šírku celej sekcie, nie samotného obrázka, aby sme predišli "nafukovaniu"

    const formular = new URLSearchParams(); // Vytvoríme štruktúru, ktorá bude reprezentovať formulár
    formular.append('ves', ves); // Pridáme tam naše hodnoty
    formular.append('width', width);

    const url = this.action; // Nacitame povodnu URL zadanu vo formulari
    const method = this.method; // NAcitame povodnu metodu zadanu vo formulari
    fetch(url, { method: method, body: formular }) // Urobíme HTTP požiadavku na náš server POST /render a formularom v tele požiadavky 
        .then((res) => res.blob()) // Dostali sme binárne dáta (blob)
        .then((image) => {
            document.querySelector("#outputImg").src = URL.createObjectURL(image); // Nastavíme src našeho <img> na načítaný obrázok
        })
}
document.querySelector("form").addEventListener("submit", handleSubmit); // Nastavíme formulár, aby pri submit udalosti spustil našu handleSubmit funkciu


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

// --- YOUTUBE MUSIC LOGIC ---
const soundToggleBtn = document.getElementById('soundToggle');
let isPlaying = false;
let audioIframe = null;

if (soundToggleBtn) {
    // Odstránime pôvodný API loading
    soundToggleBtn.addEventListener('click', () => {
        if (!isPlaying) {
            // Vytvorí sa skutočný viditeľný (no mikroskopický) iframe, pretože
            // lokálne spustenie stránky (file://) blokuje pokročilé YT API skripty
            audioIframe = document.createElement('iframe');
            audioIframe.src = "https://www.youtube.com/embed/mEJ_jxFJU_0?autoplay=1";
            audioIframe.allow = "autoplay"; // kľúčové povolenie pre spustenie

            // Aby ho prehliadač neoznačil ako "skrytý podvod" a nezablokoval mu zvuk, 
            // musí byť na ploche fyzicky prítomný, hoci bude dole a malinkatý.
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
            // Zastavenie zvuku sa vyrieši úplným odstránením prehrávaču
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
const outputImg = document.getElementById('outputImg');

shapeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Ak kliknem na už zapnutý nástroj, tak ho vypnem
        if (selectedShape === btn.dataset.shape) {
            selectedShape = null;
            btn.classList.remove('active');
            outputImg.classList.remove('crosshair-active');
        } else {
            // Vypnem všetky ostatné
            shapeBtns.forEach(b => b.classList.remove('active'));
            // Zapnem nový
            selectedShape = btn.dataset.shape;
            btn.classList.add('active');
            outputImg.classList.add('crosshair-active');
        }
    });
});

// Zmazanie celého obsahu (odpadkový kôš)
const clearBtn = document.getElementById('clearBtn');
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        const textarea = document.querySelector('textarea[name="ves"]');
        textarea.value = ''; // Úplne vymaže textové pole
        document.querySelector("form").dispatchEvent(new Event("submit")); // Pošle na render čisté plátno
    });
}

outputImg.addEventListener('click', (e) => {
    // Ak nemám vybratý žiaden nástroj, nerobím nič
    if (!selectedShape) return;

    const textarea = document.querySelector('textarea[name="ves"]');

    // Ak je pole prázdne, doplň automaticky predvolenú hlavičku podľa veľkosti textového poľa
    if (textarea.value.trim() === '') {
        const w = textarea.clientWidth > 0 ? textarea.clientWidth : 800;
        const h = textarea.clientHeight > 0 ? textarea.clientHeight : 600;
        textarea.value = `VES v1.0 ${w} ${h}\n`;
    }

    const vesCode = textarea.value.trim().split('\n');
    let origWidth = textarea.clientWidth > 0 ? textarea.clientWidth : 800;
    let origHeight = textarea.clientHeight > 0 ? textarea.clientHeight : 600;

    // Zistím originálnu veľkosť z 1. riadku, aby som zachytil presné súradnice
    if (vesCode.length > 0 && vesCode[0].startsWith('VES')) {
        const parts = vesCode[0].split(' ').filter(p => p);
        if (parts.length >= 4) {
            origWidth = parseInt(parts[2]) || origWidth;
            origHeight = parseInt(parts[3]) || origHeight;
        }
    }

    // Výpočet kliknutej polohy pre VES plátno
    let clickX = Math.round((e.offsetX / outputImg.clientWidth) * origWidth);
    let clickY = Math.round((e.offsetY / outputImg.clientHeight) * origHeight);

    // Obmedzenie kliknutia prísne na oblasť plátna (napr. ak sa kliklo na padding/border obrázka)
    clickX = Math.max(0, Math.min(clickX, origWidth));
    clickY = Math.max(0, Math.min(clickY, origHeight));

    // Načítam farbu a veľkosť z inputov
    const colorInput = document.getElementById('shapeColor');
    const color = colorInput ? colorInput.value.toUpperCase() : '#FF0000';

    const sizeInput = document.getElementById('shapeSize');
    const size = sizeInput ? parseInt(sizeInput.value, 10) : 50;
    const thickness = Math.max(1, Math.floor(size / 15)); // hrúbka sa ráta podľa veľkosti

    let command = "";
    if (selectedShape === 'CIRCLE') {
        command = `CIRCLE ${clickX} ${clickY} ${size} ${thickness} ${color}`;
    } else if (selectedShape === 'FILL_CIRCLE') {
        command = `FILL_CIRCLE ${clickX} ${clickY} ${size} ${color}`;
    } else if (selectedShape === 'RECT') {
        command = `RECT ${clickX} ${clickY} ${size * 2} ${size} ${thickness} ${color}`;
    } else if (selectedShape === 'FILL_RECT') {
        command = `FILL_RECT ${clickX} ${clickY} ${size * 2} ${size} ${color}`;
    } else if (selectedShape === 'TRIANGLE') {
        command = `TRIANGLE ${clickX} ${clickY} ${clickX + Math.round(size * 1.2)} ${clickY} ${clickX + Math.round(size * 0.6)} ${clickY - size} ${thickness} ${color}`;
    }

    // Pridám príkaz do textového poľa
    if (textarea.value && !textarea.value.endsWith('\n')) {
        textarea.value += '\n';
    }
    textarea.value += command + '\n';

    // Automaticky odoslať formulár na renderovanie bez refreshtnutia
    // dispatchEvent urobí plynulé odoslanie ako keby som klikol na tlačidlo
    // Automaticky odoslať formulár na renderovanie bez refreshtnutia
    // dispatchEvent urobí plynulé odoslanie ako keby som klikol na tlačidlo
    textarea.closest('form').dispatchEvent(new Event('submit'));
});

// --- INICIALIZÁCIA A UKÁŽKY KÓDOV ---
window.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('textarea[name="ves"]');

    // 1. Nastavenie predvoleného kódu ak je prázdny
    if (textarea && textarea.value.trim() === '') {
        const w = textarea.clientWidth > 0 ? textarea.clientWidth : 800;
        const h = textarea.clientHeight > 0 ? textarea.clientHeight : 600;
        textarea.value = `VES v1.0 ${w} ${h}\n`;
    }

    // 2. Prvé vyrenderovanie
    const form = document.querySelector("form");
    if (form) form.dispatchEvent(new Event("submit"));

    // 3. Generovanie galérie ukážok
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
            code: 'VES v1.0 800 600\n# --- Pozadie (Obloha) ---\nCLEAR #87CEEB\n\n# --- Obláčiky (Vykreslené ako prvé, budú v pozadí) ---\nFILL_CIRCLE 100 200 50 #FFFFFF\nFILL_CIRCLE 150 200 60 #FFFFFF\nFILL_CIRCLE 200 200 50 #FFFFFF\n\nFILL_CIRCLE 600 150 40 #FFFFFF\nFILL_CIRCLE 650 150 50 #FFFFFF\nFILL_CIRCLE 700 150 40 #FFFFFF\n\nFILL_CIRCLE 350 100 30 #FFFFFF\nFILL_CIRCLE 390 100 40 #FFFFFF\nFILL_CIRCLE 430 100 30 #FFFFFF\n\n# --- Dúha (Vykreslená nakoniec, bude v popredí) ---\n# Dúha je tvorená sériou polkruhov (vykreslených pod úrovňou 500)\n# Používame veľké kruhy, ktorých stred je mimo plátna, aby vyzerali ako oblúky\nFILL_CIRCLE 400 650 450 #FF0000\nFILL_CIRCLE 400 650 410 #FF7F00\nFILL_CIRCLE 400 650 370 #FFFF00\nFILL_CIRCLE 400 650 330 #00FF00\nFILL_CIRCLE 400 650 290 #0000FF\nFILL_CIRCLE 400 650 250 #4B0082\nFILL_CIRCLE 400 650 210 #9400D3\n\n# --- Zrezanie dúhy ---\n# Prekryjeme spodnú časť oblohou, aby dúha nezasahovala do zeme\nFILL_RECT 0 450 800 150 #87CEEB'
        },
        {
            title: '🎯 Terč',
            img: 'target_preview_1776548322400.png',
            code: 'VES v1.0 800 600\nFILL_CIRCLE 400 300 250 #FF0000\nFILL_CIRCLE 400 300 200 #FFFFFF\nFILL_CIRCLE 400 300 150 #FF0000\nFILL_CIRCLE 400 300 100 #FFFFFF\nFILL_CIRCLE 400 300 50 #FF0000'
        },
        {
            title: '🎨 Abstrakt',
            img: 'abstrakt.png',
            code: 'VES v1.0 680 400\n\nCLEAR #FF0000\nFILL_CIRCLE 200 100 50 #00FF00\nFILL_RECT 400 100 150 200 #00FF00\nCIRCLE 300 200 100 1 #FFFFFF\nTRIANGLE 50 100 200 300 150 200 1 #00FF00\nRECT 200 100 300 200 1 #000000\nFILL_TRIANGLE 200 100 400 300 300 300 #0000FF\nLINE 0 0 600 400 1 #000000'
        },
        {
            title: '❄️ Zima',
            img: 'zima.png',
            code: 'VES v1.0 800 600\nCLEAR #001133\n\n# --- Mesiac a Hviezdy (Pozadie) ---\nFILL_CIRCLE 700 80 50 #FDFD96\n# Krátery na mesiaci (detaily)\nFILL_CIRCLE 720 90 10 #ECEC80\nFILL_CIRCLE 690 70 6 #ECEC80\n# Hviezdy (náhodné bodky)\nFILL_CIRCLE 100 50 2 #FFFFFF\nFILL_CIRCLE 250 120 2 #FFFFFF\nFILL_CIRCLE 400 30 3 #FFFFFF\nFILL_CIRCLE 50 200 2 #FFFFFF\nFILL_CIRCLE 550 60 2 #FFFFFF\nFILL_CIRCLE 300 300 2 #FFFFFF\nFILL_CIRCLE 150 150 1 #FFFFFF\n\n# --- Zem (Sneh) ---\nFILL_RECT 0 450 800 150 #F0F8FF\n\n# --- Domček (Vľavo) ---\n# Fasáda\nFILL_RECT 50 300 200 150 #8B0000\nRECT 50 300 200 150 3 #2F0000\n# Strecha\nFILL_TRIANGLE 30 300 150 180 270 300 #333333\nTRIANGLE 30 300 150 180 270 300 3 #000000\n# Komín\nFILL_RECT 180 220 30 60 #552200\nRECT 180 220 30 60 2 #000000\n# Dvere\nFILL_RECT 120 370 60 80 #654321\nRECT 120 370 60 80 2 #331100\nFILL_CIRCLE 170 410 4 #FFD700\n# Okno (svietiace)\nFILL_RECT 70 330 40 40 #FFFFE0\nRECT 70 330 40 40 3 #654321\nLINE 90 330 90 370 2 #654321\nLINE 70 350 110 350 2 #654321\n\n# --- Vianočný Stromček (Vpravo) ---\n# Kmeň\nFILL_RECT 580 450 40 50 #3E2723\n# Ihličie (vrstvené trojuholníky)\nFILL_TRIANGLE 480 450 720 450 600 300 #006400\nFILL_TRIANGLE 500 350 700 350 600 220 #008000\nFILL_TRIANGLE 530 250 670 250 600 150 #228B22\n# Hviezda na vrchole\nFILL_TRIANGLE 600 130 585 160 615 160 #FFD700\nFILL_TRIANGLE 600 170 585 145 615 145 #FFD700\n# Ozdoby (Gule)\nFILL_CIRCLE 550 400 10 #FF0000\nFILL_CIRCLE 650 410 10 #0000FF\nFILL_CIRCLE 600 380 10 #FFD700\nFILL_CIRCLE 580 300 9 #800080\nFILL_CIRCLE 620 300 9 #FFA500\nFILL_CIRCLE 600 200 8 #FF0000\n# Girlandy (Čiary)\nLINE 530 380 600 400 3 #C0C0C0\nLINE 600 400 670 380 3 #C0C0C0\nLINE 550 280 600 300 3 #FFD700\nLINE 600 300 650 280 3 #FFD700\n\n# --- Snehuliak (Stred) ---\n# Telo (spodná, stredná, horná guľa s obrysmi)\nFILL_CIRCLE 350 480 45 #FAFAFA\nCIRCLE 350 480 45 1 #CCCCCC\nFILL_CIRCLE 350 420 35 #FAFAFA\nCIRCLE 350 420 35 1 #CCCCCC\nFILL_CIRCLE 350 370 25 #FAFAFA\nCIRCLE 350 370 25 1 #CCCCCC\n# Klobúk\nFILL_RECT 330 355 40 5 #000000\nFILL_RECT 335 325 30 30 #000000\n# Oči a gombíky\nFILL_CIRCLE 342 365 3 #000000\nFILL_CIRCLE 358 365 3 #000000\nFILL_CIRCLE 350 410 3 #000000\nFILL_CIRCLE 350 430 3 #000000\nFILL_CIRCLE 350 480 3 #000000\n# Nos (mrkva)\nFILL_TRIANGLE 350 370 350 376 375 373 #FF8C00\n# Ruky (konáre)\nLINE 315 420 280 400 2 #5D4037\nLINE 385 420 420 400 2 #5D4037\n# --- Darček ---\nFILL_RECT 680 480 50 50 #FF1493\n# Stuhy\nFILL_RECT 702 480 6 50 #FFFF00\nFILL_RECT 680 502 50 6 #FFFF00\nLINE 705 480 690 470 3 #FFFF00\nLINE 705 480 720 470 3 #FFFF00\n\n# --- Rám obrazu ---\nRECT 0 0 799 599 10 #FFFFFF'
        },
        {
            title: '🚗 Auto v horách',
            img: 'auto.png',
            code: 'VES v1.0 700 500\nCLEAR #2BC6FF\n\n#---Hory---\nFILL_TRIANGLE 100 400 340 100 600 400 #4F4F4F\nFILL_RECT 0 300 495 100 #5B626C\nFILL_TRIANGLE 0 300 220 80 350 400 #5B626C\nFILL_TRIANGLE 300 400 650 40 800 400 #5B626C\nFILL_TRIANGLE 300 400 600 90 620 400 #6E7B8D\nFILL_RECT 600 150 100 350 #6E7B8D\n\n#---Cesta---\nFILL_RECT 0 400 700 100 #303030\n# Pásy na ceste\nFILL_RECT 10 440 60 15 #F0F8FF\nFILL_RECT 100 440 60 15 #F0F8FF\nFILL_RECT 190 440 60 15 #F0F8FF\nFILL_RECT 280 440 60 15 #F0F8FF\nFILL_RECT 370 440 60 15 #F0F8FF\nFILL_RECT 460 440 60 15 #F0F8FF\nFILL_RECT 550 440 60 15 #F0F8FF\nFILL_RECT 640 440 60 15 #F0F8FF\n\n#---Strom---\n#Kmeň\nFILL_RECT 50 150 75 250 #4F1E20\n#Koruna\nFILL_CIRCLE 90 100 80 #008F50\nFILL_CIRCLE 160 120 30 #008F50\nFILL_CIRCLE 50 160 30 #008F50\nFILL_CIRCLE 90 170 30 #008F50\nFILL_CIRCLE 130 160 30 #008F50\nFILL_CIRCLE 160 170 30 #008F50\nFILL_CIRCLE 170 80 40 #008F50\nFILL_CIRCLE 175 75 30 #008F50\nFILL_CIRCLE 20 130 20 #008F50\nFILL_CIRCLE 20 100 30 #008F50\nFILL_CIRCLE 40 50 30 #008F50\nFILL_CIRCLE 80 40 30 #008F50\nFILL_CIRCLE 120 20 30 #008F50\nFILL_CIRCLE 150 30 30 #008F50\n\n#---Auto---\n#Svetlá\nFILL_CIRCLE 153 325 15 #E3F35F\nFILL_CIRCLE 597 325 15 #FF0000\n#Plechy\nFILL_RECT 150 300 450 70 #B20C11\nFILL_TRIANGLE 220 300 270 220 270 300 #B20C11\nFILL_TRIANGLE 500 300 500 220 550 300 #B20C11\nFILL_RECT 270 220 230 80 #B20C11\n#Okná\nFILL_TRIANGLE 230 298 275 225 275 298 #82C4DC\nFILL_TRIANGLE 495 225 495 298 540 298 #82C4DC\nFILL_RECT 275 225 220 73 #82C4DC\nFILL_RECT 380 220 10 80 #B20C11\n#Kľučky\nLINE 340 310 360 310 4 #660000\nLINE 500 310 520 310 4 #660000\n#Kolesá\nFILL_CIRCLE 255 380 46 #202020\nFILL_CIRCLE 255 380 28 #D6003A\nFILL_CIRCLE 495 380 46 #202020\nFILL_CIRCLE 495 380 28 #D6003A\n\n#---Motýľ---\nFILL_TRIANGLE 455 110 470 80 485 100 #7100A2\nFILL_TRIANGLE 455 110 440 80 425 100 #7100A2\nFILL_TRIANGLE 455 110 485 115 465 125 #A2005F\nFILL_TRIANGLE 455 110 425 115 445 125 #A2005F\nLINE 455 100 455 120 7 #DCD486'
        }
    ];

    const examplesList = document.getElementById('examples-list');
    if (examplesList) {
        examples.forEach(ex => {
            const card = document.createElement('div');
            card.className = 'example-card';

            // Pridanie obrázka náhľadu
            if (ex.img) {
                const imgElement = document.createElement('img');
                imgElement.src = ex.img;
                imgElement.className = 'example-img';
                imgElement.alt = ex.title;
                card.appendChild(imgElement);
            } else {
                // Placeholder ak obrázok chýba
                const placeholder = document.createElement('div');
                placeholder.className = 'example-img placeholder';
                placeholder.innerHTML = '<span>VES</span>';
                card.appendChild(placeholder);
            }

            const titleSpan = document.createElement('span');
            titleSpan.className = 'example-title';
            titleSpan.innerText = ex.title;

            const codePreview = document.createElement('div');
            codePreview.className = 'example-code';
            const previewLines = ex.code.split('\n');
            const previewText = previewLines.slice(0, 3).join('\n') + (previewLines.length > 3 ? '\n...' : '');
            codePreview.innerText = previewText;

            card.appendChild(titleSpan);
            card.appendChild(codePreview);

            card.addEventListener('click', () => {
                textarea.value = ex.code;
                if (form) form.dispatchEvent(new Event("submit"));

                // Plynulý scroll k výsledku
                const canvasWrapper = document.getElementById('canvas-wrapper');
                if (canvasWrapper) canvasWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });

            examplesList.appendChild(card);
        });
    }

    // Event listener pre samostatné tlačidlo presunu
    const scrollBtn = document.getElementById('scroll-to-canvas');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            const canvasWrapper = document.getElementById('canvas-wrapper');
            if (canvasWrapper) canvasWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
});
