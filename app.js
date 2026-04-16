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
