// handleSubmit je funkcia, ktorá sa spustí keď sa bude mať odoslať náš formulár
function handleSubmit(e) {
    e.preventDefault(); // zabrániť vstavenému odosielaniu v prehliadači

    // this reprezentuje ten formular, ktory odosielame
    const ves = this.querySelector("textarea").value; // Načítame text z textarea
    const width = document.querySelector("section:nth-child(2)").clientWidth; // Načítame aktuálnu šírku výstupného okna

    const formular = new URLSearchParams(); // Vytvoríme štruktúru, ktorá bude reprezentovať formulár
    formular.append('ves', ves); // Pridáme tam naše hodnoty
    formular.append('width', width);

    const url = this.action; // Nacitame povodnu URL zadanu vo formulari
    const method = this.method; // NAcitame povodnu metodu zadanu vo formulari
    fetch(url, { method: method, body: formular }) // Urobíme HTTP požiadavku na náš server POST /render a formularom v tele požiadavky 
        .then((res) => res.blob()) // Dostali sme binárne dáta (blob)
        .then((image) => {
            document.querySelector("#output").src = URL.createObjectURL(image); // Nastavíme src našeho <img> na načítaný obrázok
        })
}
document.querySelector("form").addEventListener("submit", handleSubmit); // Nastavíme formulár, aby pri submit udalosti spustil našu handleSubmit funkciu

// Inicializačné vykreslenie prázdneho plátna hneď po načítaní stránky
window.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('textarea[name="ves"]');
    if (textarea.value.trim() === '') {
        // Nastavíme rozmery plátna presne podľa fyzickej veľkosti textového boxu
        const w = textarea.clientWidth > 0 ? textarea.clientWidth : 800;
        const h = textarea.clientHeight > 0 ? textarea.clientHeight : 600;
        textarea.value = `VES v1.0 ${w} ${h}\n`;
    }
    document.querySelector("form").dispatchEvent(new Event("submit"));
});

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
const outputImg = document.getElementById('output');

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

    // Načítam farbu a veľkosť z inputov
    const colorInput = document.getElementById('shapeColor');
    const color = colorInput ? colorInput.value.toUpperCase() : '#FF0000';

    const sizeInput = document.getElementById('shapeSize');
    const size = sizeInput ? parseInt(sizeInput.value, 10) : 50;
    const thickness = Math.max(1, Math.floor(size / 15)); // hrúbka sa ráta podľa veľkosti

    // Zabezpečenie, aby tvary nepretiekli mimo rozsah plátna
    if (selectedShape === 'CIRCLE' || selectedShape === 'FILL_CIRCLE') {
        clickX = Math.max(size, Math.min(clickX, origWidth - size));
        clickY = Math.max(size, Math.min(clickY, origHeight - size));
    } else if (selectedShape === 'RECT' || selectedShape === 'FILL_RECT') {
        clickX = Math.max(0, Math.min(clickX, origWidth - (size * 2)));
        clickY = Math.max(0, Math.min(clickY, origHeight - size));
    } else if (selectedShape === 'TRIANGLE') {
        const trWidth = Math.round(size * 1.2);
        clickX = Math.max(0, Math.min(clickX, origWidth - trWidth));
        clickY = Math.max(size, Math.min(clickY, origHeight));
    }

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
    textarea.closest('form').dispatchEvent(new Event('submit'));
});
