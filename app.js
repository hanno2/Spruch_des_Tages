// Spruch des Tages - MySQL2 API Integration

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Helper Functions
const api = {
    // GET request helper
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('GET request error:', error);
            throw error;
        }
    },
    
    // POST request helper  
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('POST request error:', error);
            throw error;
        }
    },
    
    // DELETE request helper
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('DELETE request error:', error);
            throw error;
        }
    }
};

// Global state - jetzt aus MySQL geladen
let sprueche = [];

// DOM-Elemente mit Error-Handling
const elements = (() => {
    const els = {
        liste: document.getElementById('spruch-liste'),
        anzeige: document.getElementById('spruch-anzeige'),
        randomBtn: document.getElementById('random-spruch-btn'),
        form: document.getElementById('neuer-spruch-form'),
        textInput: document.getElementById('spruch-input'),
        autorInput: document.getElementById('autor-input'),
        leerMsg: document.getElementById('spruch-liste-leer')
    };
    
    // Validierung aller kritischen Elemente
    const missing = Object.entries(els).filter(([key, el]) => !el);
    if (missing.length > 0) {
        console.error('❌ Kritische DOM-Elemente fehlen:', missing.map(([key]) => key));
        throw new Error(`DOM-Elemente nicht gefunden: ${missing.map(([key]) => key).join(', ')}`);
    }
    
    return els;
})();

// MySQL2 API Functions

// Alle Sprüche von der API laden
async function ladeSprueche() {
    try {
        const response = await api.get('/sprueche');
        if (response.success) {
            sprueche = response.data;
            console.log(`✅ ${sprueche.length} Sprüche aus MySQL geladen`);
            return sprueche;
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('❌ Fehler beim Laden der Sprüche:', error);
        showAlert('Fehler beim Laden der Sprüche aus der Datenbank', 'danger');
        return [];
    }
}

// Zufälligen Spruch von der API laden
async function ladeZufallsSpruch() {
    try {
        const response = await api.get('/sprueche/random');
        if (response.success) {
            return response.data;
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('❌ Fehler beim Laden des zufälligen Spruchs:', error);
        showAlert('Fehler beim Laden des zufälligen Spruchs', 'danger');
        return null;
    }
}

// Neuen Spruch zur Datenbank hinzufügen
async function speichereSpruch(text, autor) {
    try {
        const response = await api.post('/sprueche', { text, autor });
        if (response.success) {
            console.log('✅ Spruch gespeichert:', response.data);
            return response.data;
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('❌ Fehler beim Speichern:', error);
        showAlert(`Fehler beim Speichern: ${error.message}`, 'danger');
        return null;
    }
}

// Spruch aus der Datenbank löschen
async function loescheSpruchAPI(id) {
    try {
        const response = await api.delete(`/sprueche/${id}`);
        if (response.success) {
            console.log('✅ Spruch gelöscht:', response.data);
            return true;
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error('❌ Fehler beim Löschen:', error);
        showAlert(`Fehler beim Löschen: ${error.message}`, 'danger');
        return false;
    }
}
    // (Diese fehlerhafte Definition wird entfernt)

// Utility-Funktionen für Performance und UX
const utils = {
    // Debounce-Funktion für Performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Input-Sanitization
    sanitizeInput: (input) => {
        return input.trim()
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .slice(0, 500); // Max 500 Zeichen
    },
    
    // Validierung
    validateSpruch: (text, autor) => {
        const errors = [];
        
        if (!text || text.trim().length < 3) {
            errors.push('Spruch muss mindestens 3 Zeichen lang sein');
        }
        
        if (!autor || autor.trim().length < 2) {
            errors.push('Autor muss mindestens 2 Zeichen lang sein');
        }
        
        if (text && text.length > 500) {
            errors.push('Spruch darf maximal 500 Zeichen lang sein');
        }
        
        if (autor && autor.length > 100) {
            errors.push('Autorname darf maximal 100 Zeichen lang sein');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};

// Daten speichern (LocalStorage) mit Error-Handling
function speichereDaten() {
    try {
        localStorage.setItem('sprueche', JSON.stringify(sprueche));
        console.log('💾 Daten erfolgreich gespeichert');
    } catch (error) {
        console.error('❌ Fehler beim Speichern:', error);
        showAlert('Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.', 'danger');
    }
}

// Alert-System mit besserer UX
function showAlert(message, type = 'info', duration = 3000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    alertDiv.innerHTML = `
        <i class="bi bi-${getAlertIcon(type)}"></i> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Schließen"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-remove nach duration
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, duration);
}

function getAlertIcon(type) {
    const icons = {
        success: 'check-circle-fill',
        danger: 'exclamation-triangle-fill',
        warning: 'exclamation-triangle-fill',
        info: 'info-circle-fill'
    };
    return icons[type] || 'info-circle-fill';
}
// MySQL2-basierte Spruchliste rendern
async function renderSprueche() {
    try {
        // Daten aus MySQL2 API laden
        await ladeSprueche();
        
        elements.leerMsg.style.display = sprueche.length === 0 ? 'block' : 'none';
        
        // Spruch-Counter aktualisieren
        const counter = document.getElementById('quotes-count');
        if (counter) {
            counter.textContent = sprueche.length;
            counter.setAttribute('aria-label', `${sprueche.length} Sprüche in der Sammlung`);
        }
        
        if (sprueche.length === 0) {
            elements.liste.innerHTML = '';
            return;
        }
        
        elements.liste.innerHTML = sprueche.map((spruch, index) => `
            <li class="list-group-item d-flex justify-content-between align-items-center fade-in-item" 
                style="animation-delay: ${index * 0.1}s"
                role="listitem"
                data-spruch-id="${spruch.id}">
                <div class="flex-grow-1 quote-content">
                    <p class="spruch-text mb-1" aria-label="Spruch-Text">
                        <i class="bi bi-quote text-muted me-1" aria-hidden="true"></i>
                        "${utils.escapeHtml(spruch.text)}"
                    </p>
                    <small class="spruch-autor text-muted" aria-label="Autor">
                        <i class="bi bi-person text-muted me-1" aria-hidden="true"></i>
                        — ${utils.escapeHtml(spruch.autor)}
                    </small>
                    <small class="text-muted d-block">
                        <i class="bi bi-clock text-muted me-1" aria-hidden="true"></i>
                        ${new Date(spruch.created_at).toLocaleDateString('de-DE')}
                    </small>
                </div>
                <button class="btn btn-sm btn-danger ms-3" 
                        onclick="loescheSpruch(${spruch.id})"
                        aria-label="Spruch von ${utils.escapeHtml(spruch.autor)} löschen"
                        title="Diesen Spruch aus der Sammlung entfernen">
                    <i class="bi bi-trash" aria-hidden="true"></i>
                    <span class="visually-hidden">Löschen</span>
                </button>
            </li>
        `).join('');
        
        // Accessibility: Liste als aktualisiert kennzeichnen
        elements.liste.setAttribute('aria-live', 'polite');
        
        console.log(`✅ ${sprueche.length} Sprüche gerendert`);
        
    } catch (error) {
        console.error('❌ Fehler beim Rendern der Sprüche:', error);
        showAlert('Fehler beim Anzeigen der Sprüche. Bitte laden Sie die Seite neu.', 'danger');
    }
}

// HTML Escaping für XSS-Schutz
utils.escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Zufälligen Spruch aus MySQL2 anzeigen
async function zeigeZufallsSpruch() {
    try {
        const spruch = await ladeZufallsSpruch();
        
        if (!spruch) {
            elements.anzeige.innerHTML = `
                <p class="text-muted">Keine Sprüche in der Datenbank. Füge zuerst welche hinzu!</p>
            `;
            return;
        }
        
        elements.anzeige.innerHTML = `
            <p class="mb-3">"${utils.escapeHtml(spruch.text)}"</p>
            <footer class="blockquote-footer">
                <cite>${utils.escapeHtml(spruch.autor)}</cite>
                <small class="text-muted ms-2">
                    ${new Date(spruch.created_at).toLocaleDateString('de-DE')}
                </small>
            </footer>
        `;
        
        // Animation hinzufügen
        elements.anzeige.classList.add('fade-in');
        setTimeout(() => elements.anzeige.classList.remove('fade-in'), 500);
        
    } catch (error) {
        console.error('❌ Fehler beim Anzeigen des Spruchs:', error);
        elements.anzeige.innerHTML = `
            <p class="text-danger">Fehler beim Laden des Spruchs.</p>
        `;
    }
}

// Neuen Spruch in MySQL2 speichern
async function fuegeSpruchHinzu(text, autor) {
    const validation = utils.validateSpruch(text, autor);
    
    if (!validation.isValid) {
        showAlert(validation.errors.join('<br>'), 'warning');
        return false;
    }
    
    try {
        const sanitizedText = utils.sanitizeInput(text);
        const sanitizedAutor = utils.sanitizeInput(autor);
        
        const neuerSpruch = await speichereSpruch(sanitizedText, sanitizedAutor);
        
        if (neuerSpruch) {
            await renderSprueche(); // Liste neu laden
            await zeigeZufallsSpruch(); // Neuen Spruch anzeigen
            
            showAlert(`Spruch von "${sanitizedAutor}" erfolgreich in MySQL gespeichert!`, 'success');
            console.log('✅ Neuer Spruch zur Datenbank hinzugefügt:', neuerSpruch);
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Fehler beim Hinzufügen des Spruchs:', error);
        showAlert('Fehler beim Hinzufügen des Spruchs zur Datenbank.', 'danger');
        return false;
    }
}

// Spruch aus MySQL2 löschen
async function loescheSpruch(spruchId) {
    try {
        // Spruch-Details für Bestätigungsdialog
        const spruch = sprueche.find(s => s.id === spruchId);
        if (!spruch) {
            showAlert('Spruch nicht gefunden.', 'warning');
            return;
        }
        
        const confirmMessage = `Möchtest du diesen Spruch wirklich aus der Datenbank löschen?\n\n"${spruch.text.slice(0, 50)}${spruch.text.length > 50 ? '...' : ''}"\n— ${spruch.autor}`;
        
        if (confirm(confirmMessage)) {
            const success = await loescheSpruchAPI(spruchId);
            
            if (success) {
                await renderSprueche(); // Liste neu laden
                await zeigeZufallsSpruch(); // Neuen Spruch anzeigen
                
                showAlert(`Spruch von "${spruch.autor}" wurde aus der Datenbank gelöscht.`, 'info', 2000);
                console.log('🗑️ Spruch aus MySQL gelöscht:', spruch);
            }
        }
        
    } catch (error) {
        console.error('❌ Fehler beim Löschen des Spruchs:', error);
        showAlert('Fehler beim Löschen des Spruchs aus der Datenbank.', 'danger');
    }
}

// Theme-Management
const themeManager = {
    init() {
        this.currentTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.applyTheme(this.currentTheme);
        this.setupToggleButton();
        this.watchSystemTheme();
    },
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateToggleButton(theme);
        this.currentTheme = theme;
    },
    
    setupToggleButton() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    },
    
    updateToggleButton(theme) {
        const icon = document.getElementById('theme-icon');
        const btn = document.getElementById('theme-toggle');
        
        if (icon && btn) {
            if (theme === 'dark') {
                icon.className = 'bi bi-sun';
                btn.setAttribute('aria-label', 'Zu hellem Theme wechseln');
                btn.title = 'Helles Theme';
            } else {
                icon.className = 'bi bi-moon';
                btn.setAttribute('aria-label', 'Zu dunklem Theme wechseln');
                btn.title = 'Dunkles Theme';
            }
        }
    },
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Feedback für Benutzer
        showAlert(`${newTheme === 'dark' ? 'Dunkles' : 'Helles'} Theme aktiviert`, 'info', 1500);
    },
    
    watchSystemTheme() {
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
    }
};

// Event-Listener: Formular absenden (modernisiert mit besserer UX)
elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = elements.textInput.value.trim();
    const autor = elements.autorInput.value.trim();
    
    // Loading State anzeigen
    const submitBtn = elements.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split" aria-hidden="true"></i> Speichere...';
    
    // Async processing für bessere UX
    setTimeout(() => {
        const success = fuegeSpruchHinzu(text, autor);
        
        if (success) {
            elements.form.reset();
            // Fokus zurück auf das erste Feld für bessere UX
            elements.textInput.focus();
        }
        
        // Loading State entfernen
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        // Zeichenzähler zurücksetzen
        updateCharCounter();
        
    }, 300); // Kurze Verzögerung für bessere UX
});

// Event-Listener: Reset Button
elements.form.addEventListener('reset', () => {
    updateCharCounter();
    showAlert('Formular zurückgesetzt', 'info', 1000);
});

// Event-Listener: Zufälligen Spruch Button (mit verbesserter Animation)
elements.randomBtn.addEventListener('click', (e) => {
    e.target.disabled = true;
    e.target.innerHTML = '<i class="bi bi-arrow-repeat spin" aria-hidden="true"></i> <span>Lädt...</span>';
    
    setTimeout(() => {
        zeigeZufallsSpruch();
        e.target.disabled = false;
        e.target.innerHTML = '<i class="bi bi-shuffle" aria-hidden="true"></i> <span>Neue Inspiration!</span>';
    }, 500);
});

// Zeichenzähler mit Debouncing
const updateCharCounter = utils.debounce(() => {
    const charCount = elements.textInput.value.length;
    const maxChars = 500;
    let counter = document.getElementById('spruch-counter');
    
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'spruch-counter';
        counter.className = 'form-text';
        counter.setAttribute('aria-live', 'polite');
        elements.textInput.parentNode.appendChild(counter);
    }
    
    counter.textContent = `${charCount}/${maxChars} Zeichen`;
    
    // Farbcodierung für bessere UX
    if (charCount > maxChars * 0.9) {
        counter.style.color = 'var(--danger-color)';
        counter.textContent += ' - Fast zu lang!';
    } else if (charCount > maxChars * 0.7) {
        counter.style.color = 'var(--warning-color)';
    } else {
        counter.style.color = 'var(--text-muted)';
    }
}, 150);

// Live-Validierung für Textarea
elements.textInput.addEventListener('input', updateCharCounter);

// Live-Validierung für Autor-Feld
elements.autorInput.addEventListener('input', utils.debounce(() => {
    const value = elements.autorInput.value.trim();
    const isValid = value.length >= 2 && value.length <= 100;
    
    elements.autorInput.classList.toggle('is-valid', isValid && value.length > 0);
    elements.autorInput.classList.toggle('is-invalid', !isValid && value.length > 0);
}, 300));

// Enter-Taste Support (verbessert)
elements.textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        elements.form.dispatchEvent(new Event('submit'));
    }
});

// Paste-Event mit Validierung
elements.textInput.addEventListener('paste', (e) => {
    setTimeout(() => {
        const text = elements.textInput.value;
        if (text.length > 500) {
            showAlert('Der eingefügte Text ist zu lang und wurde gekürzt.', 'warning');
            elements.textInput.value = text.substring(0, 500);
        }
        updateCharCounter();
    }, 10);
});

// MySQL2 Initialisierung mit API-Check
document.addEventListener('DOMContentLoaded', async () => {
    const startTime = performance.now();
    
    try {
        console.log('🚀 Initialisiere Spruch des Tages App mit MySQL2...');
        
        // 1. API Health Check
        try {
            const healthResponse = await fetch('http://localhost:3000/health');
            if (!healthResponse.ok) {
                throw new Error('API nicht erreichbar');
            }
            const healthData = await healthResponse.json();
            console.log('✅ MySQL2 API verfügbar:', healthData.message);
        } catch (error) {
            console.error('❌ API Health Check fehlgeschlagen:', error);
            showAlert('Warnung: MySQL2 API nicht verfügbar. Bitte starten Sie den Server mit "npm run dev".', 'warning', 8000);
        }
        
        // 2. Theme-System initialisieren
        themeManager.init();
        console.log('✅ Theme-System geladen');
        
        // 3. UI-Komponenten initialisieren
        updateCharCounter();
        console.log('✅ UI-Komponenten initialisiert');
        
        // 4. Daten aus MySQL2 laden und rendern
        await renderSprueche();
        await zeigeZufallsSpruch();
        console.log('✅ MySQL2-Daten geladen und gerendert');
        
        // 5. Performance-Messung
        const loadTime = performance.now() - startTime;
        console.log(`⚡ App geladen in ${loadTime.toFixed(2)}ms`);
        
        // 6. Erfolgsmeldung mit MySQL2-Info
        const stats = {
            sprueche: sprueche.length,
            storage: 'MySQL2 Datenbank',
            theme: themeManager.currentTheme,
            performance: `${loadTime.toFixed(0)}ms`
        };
        
        console.log('📊 App-Statistiken:', stats);
        
        // 7. Welcome-Message
        setTimeout(() => {
            if (sprueche.length > 0) {
                showAlert('� MySQL2-basierte Spruch-App erfolgreich geladen!', 'success', 4000);
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Fehler bei der Initialisierung:', error);
        showAlert('Fehler beim Laden der MySQL2-App. Bitte laden Sie die Seite neu.', 'danger');
    }
});

// Erweiterte Tastatur-Navigation mit besserer UX
document.addEventListener('keydown', (e) => {
    // Shortcuts nur wenn kein Input fokussiert ist
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && 
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
    
    if (isInputFocused) return;
    
    switch (e.key) {
        case 'r':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                zeigeZufallsSpruch();
                showAlert('Neuer Spruch geladen! (Strg+R)', 'info', 1000);
            }
            break;
            
        case 'n':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                elements.textInput.focus();
                showAlert('Bereit für neuen Spruch! (Strg+N)', 'info', 1000);
            }
            break;
            
        case 't':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                themeManager.toggleTheme();
            }
            break;
            
        case 'Escape':
            elements.form.reset();
            updateCharCounter();
            document.activeElement?.blur();
            break;
            
        case '?':
            if (e.shiftKey) {
                e.preventDefault();
                showKeyboardHelp();
            }
            break;
    }
});

// Keyboard Help Modal
function showKeyboardHelp() {
    const helpContent = `
        <div class="keyboard-help">
            <h4><i class="bi bi-keyboard"></i> Tastatur-Shortcuts</h4>
            <ul class="list-unstyled">
                <li><kbd>Strg</kbd> + <kbd>R</kbd> - Neuer zufälliger Spruch</li>
                <li><kbd>Strg</kbd> + <kbd>N</kbd> - Neuen Spruch hinzufügen</li>
                <li><kbd>Strg</kbd> + <kbd>T</kbd> - Theme wechseln</li>
                <li><kbd>Strg</kbd> + <kbd>Enter</kbd> - Formular absenden</li>
                <li><kbd>Esc</kbd> - Formular zurücksetzen</li>
                <li><kbd>Shift</kbd> + <kbd>?</kbd> - Diese Hilfe</li>
            </ul>
        </div>
    `;
    showAlert(helpContent, 'info', 8000);
}

// Unload-Event für Cleanup
window.addEventListener('beforeunload', () => {
    speichereDaten();
    console.log('👋 App wird verlassen, Daten gespeichert');
});

// Error-Handler für unbehandelte Fehler
window.addEventListener('error', (event) => {
    console.error('🚨 Unbehandelter Fehler:', event.error);
    showAlert('Ein unerwarteter Fehler ist aufgetreten. Bitte laden Sie die Seite neu.', 'danger');
});

// Visibility-Change für bessere Performance
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('👁️ App wieder sichtbar');
    } else {
        console.log('🙈 App versteckt, speichere Daten');
        speichereDaten();
    }
});
