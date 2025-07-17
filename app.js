// Spruch des Tages - JavaScript Logik mit Array-Speicherung

// Initialisierung der Spruchsammlung mit Lieblingssprüchen (JavaScript Array)
let sprueche = [
    { text: "Der Weg ist das Ziel.", autor: "Konfuzius" },
    { text: "Phantasie ist wichtiger als Wissen, denn Wissen ist begrenzt.", autor: "Albert Einstein" },
    { text: "Das Leben ist, was passiert, während du eifrig dabei bist, andere Pläne zu machen.", autor: "John Lennon" },
    { text: "Sei du selbst; alle anderen sind bereits vergeben.", autor: "Oscar Wilde" },
    { text: "Der größte Ruhm im Leben liegt nicht darin, nie zu fallen, sondern jedes Mal wieder aufzustehen.", autor: "Nelson Mandela" }
];

// DOM-Elemente
const spruchListe = document.getElementById('spruch-liste');
const spruchAnzeige = document.getElementById('spruch-anzeige');
const randomSpruchBtn = document.getElementById('random-spruch-btn');
const neuerSpruchForm = document.getElementById('neuer-spruch-form');
const spruchInput = document.getElementById('spruch-input');
const autorInput = document.getElementById('autor-input');
const spruchListeLeer = document.getElementById('spruch-liste-leer');

// Funktion: Spruchliste rendern
function renderSprueche() {
    // Liste leeren
    spruchListe.innerHTML = '';
    
    // Leere Liste Nachricht anzeigen/ausblenden
    if (sprueche.length === 0) {
        spruchListeLeer.style.display = 'block';
    } else {
        spruchListeLeer.style.display = 'none';
    }
    
    // Alle Sprüche durchgehen und anzeigen
    sprueche.forEach((spruch, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center fade-in';
        
        const spruchContent = document.createElement('div');
        spruchContent.className = 'flex-grow-1';
        
        const textElement = document.createElement('p');
        textElement.className = 'spruch-text mb-1';
        textElement.textContent = `"${spruch.text}"`;
        
        const autorElement = document.createElement('small');
        autorElement.className = 'spruch-autor';
        autorElement.textContent = `— ${spruch.autor}`;
        
        spruchContent.appendChild(textElement);
        spruchContent.appendChild(autorElement);
        
        // Löschen Button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.title = 'Löschen';
        deleteBtn.onclick = () => loescheSpruch(index);
        
        listItem.appendChild(spruchContent);
        listItem.appendChild(deleteBtn);
        
        spruchListe.appendChild(listItem);
    });
}

// Funktion: Zufälligen Spruch anzeigen
function zeigeZufallsSpruch() {
    if (sprueche.length === 0) {
        spruchAnzeige.innerHTML = `
            <p class="text-muted">Keine Sprüche vorhanden. Füge zuerst welche hinzu!</p>
        `;
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * sprueche.length);
    const spruch = sprueche[randomIndex];
    
    spruchAnzeige.innerHTML = `
        <p class="mb-3">"${spruch.text}"</p>
        <footer class="blockquote-footer">
            <cite>${spruch.autor}</cite>
        </footer>
    `;
    
    // Animation hinzufügen
    spruchAnzeige.classList.add('fade-in');
    setTimeout(() => spruchAnzeige.classList.remove('fade-in'), 500);
}

// Funktion: Neuen Spruch hinzufügen
function fuegeSpruchHinzu(text, autor) {
    if (text.trim() && autor.trim()) {
        sprueche.push({ text: text.trim(), autor: autor.trim() });
        renderSprueche();
        zeigeZufallsSpruch();
    }
}

// Funktion: Spruch löschen
function loescheSpruch(index) {
    if (confirm('Möchtest du diesen Spruch wirklich löschen?')) {
        sprueche.splice(index, 1);
        renderSprueche();
        zeigeZufallsSpruch();
    }
}

// Event-Listener: Formular absenden
neuerSpruchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = spruchInput.value.trim();
    const autor = autorInput.value.trim();
    
    if (text && autor) {
        fuegeSpruchHinzu(text, autor);
        neuerSpruchForm.reset();
        
        // Erfolgsmeldung anzeigen
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.innerHTML = `
            Spruch erfolgreich hinzugefügt!
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        neuerSpruchForm.parentNode.insertBefore(alertDiv, neuerSpruchForm.nextSibling);
        
        setTimeout(() => alertDiv.remove(), 3000);
    }
});

// Event-Listener: Zufälligen Spruch Button
randomSpruchBtn.addEventListener('click', zeigeZufallsSpruch);

// Event-Listener: Enter-Taste im Formular
spruchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        neuerSpruchForm.dispatchEvent(new Event('submit'));
    }
});

// Zeichenzähler für Textarea
spruchInput.addEventListener('input', () => {
    const charCount = spruchInput.value.length;
    const maxChars = 500;
    const counter = document.querySelector('.form-text');
    if (counter) {
        counter.textContent = `${charCount}/${maxChars} Zeichen`;
    }
});

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    renderSprueche();
    zeigeZufallsSpruch();
    
    console.log('Spruch des Tages App geladen mit', sprueche.length, 'Sprüchen');
});

// Tastatur-Navigation
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        zeigeZufallsSpruch();
    }
});
