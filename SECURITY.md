# 🔒 Sicherheitsgehärtete Rezept-App

## ⚡ Sicherheits-Features

Diese Version der Rezept-App wurde nach höchsten Sicherheitsstandards entwickelt:

### ✅ Implementierte Sicherheitsmaßnahmen

#### 1. **Strikte Content Security Policy (CSP)**
- Keine inline Scripts oder Event-Handler
- Nur eigene Scripts erlaubt (`script-src 'self'`)
- Keine externen CDNs
- Kein `eval()` oder dynamischer Code
- Base-URI auf 'self' beschränkt
- Frame-Ancestors auf 'none' (kein Embedding)

#### 2. **Sichere DOM-Manipulation**
- **NIEMALS** `innerHTML`, `outerHTML` oder `insertAdjacentHTML`
- Nur `createElement()` + `textContent` + `appendChild()`
- Alle Event-Listener via `addEventListener()`
- Keine Inline-Event-Handler (`onclick`, etc.)

#### 3. **Input-Validierung**
- Jede Benutzereingabe wird validiert
- Regex-basierte Pattern-Validierung
- Längen-Limits für alle Felder
- Typ-Prüfung (String, Number, etc.)
- Wertebereichs-Validierung

#### 4. **Bild-Upload-Sicherheit**
- **SVG-Dateien blockiert** (XSS-Gefahr)
- Nur sichere Formate: JPG, PNG, WebP
- Maximale Dateigröße: 5MB
- MIME-Type-Prüfung
- Base64-Validierung
- Data-URL-Sanitization

#### 5. **Sichere Datenspeicherung**
- Try-Catch um alle Storage-Operationen
- Schema-Validation vor dem Speichern
- Speichergrößen-Limit (10MB)
- Sanitization aller Daten
- Deep-Clone zur Isolation

#### 6. **XSS-Schutz**
- Keine Template-Strings mit HTML
- Strikte Trennung von Daten und Code
- Escape aller Sonderzeichen
- Validierte Daten-URLs
- Sichere Attribut-Setzung

#### 7. **Modulare Code-Architektur**
- ES6 Module (`type="module"`)
- Strikte Trennung der Verantwortlichkeiten
- Einzelne Zweck pro Modul
- Import/Export-Kontrolle
- Kein globaler Scope

## 📁 Projekt-Struktur

```
SecureRezeptApp/
├── index.html                    # CSP-gehärtete Haupt-HTML
├── manifest.json                 # PWA-Manifest
├── sw.js                         # Sicherer Service Worker
│
├── css/
│   └── styles.css               # Alle Styles (keine Inline-Styles)
│
└── js/
    ├── config.js                # Sicherheits-Konfiguration
    ├── validator.js             # Input-Validierung
    ├── sanitizer.js             # Daten-Sanitization
    ├── storage.js               # Sicheres LocalStorage
    ├── dom-builder.js           # Sichere DOM-Erstellung
    ├── recipe-helpers.js        # Business-Logik
    ├── router.js                # View-Management
    ├── app.js                   # Haupt-App
    │
    └── views/
        ├── recipe-list.js       # Rezeptliste
        ├── recipe-detail.js     # Rezept-Details
        ├── recipe-form.js       # Rezept-Formular
        ├── shopping-list.js     # Einkaufsliste
        ├── recipe-select.js     # Rezept-Auswahl
        └── fridge-check.js      # Kühlschrank-Check
```

## 🛡️ Sicherheits-Patterns

### Pattern 1: Sichere Element-Erstellung
```javascript
// ❌ NIEMALS SO:
element.innerHTML = `<div>${userInput}</div>`;

// ✅ IMMER SO:
const div = DOMBuilder.createElement('div', {
    textContent: userInput  // Automatisch escaped
});
```

### Pattern 2: Event-Listener
```javascript
// ❌ NIEMALS SO:
element.setAttribute('onclick', 'handleClick()');

// ✅ IMMER SO:
element.addEventListener('click', handleClick);
```

### Pattern 3: Input-Validierung
```javascript
// Immer vor Verwendung validieren
const validation = Validator.validateRecipeName(userInput);
if (!validation.valid) {
    showError(validation.error);
    return;
}
const safeName = validation.value; // Bereits sanitized
```

### Pattern 4: Bild-Upload
```javascript
// Strikte Validierung
const validation = Validator.validateImageFile(file);
if (!validation.valid) {
    alert(validation.error);
    return;
}
// Zusätzlich Data-URL validieren
const safe = Sanitizer.validateImageDataURL(dataURL);
```

## 🔐 Validierungs-Regeln

### Rezeptname
- Max. 200 Zeichen
- Nur Buchstaben, Zahlen, Leerzeichen, `-.,!?()`
- Keine HTML-Tags oder Sonderzeichen

### Zutaten
- Max. 50 Zutaten pro Rezept
- Zutat max. 100 Zeichen
- Menge: 0.01 bis 10.000
- Nur erlaubte Einheiten

### Anleitung
- Max. 10.000 Zeichen
- Keine Code-Injection

### Bilder
- Nur JPG, PNG, WebP
- Max. 5MB
- Keine SVG (XSS-Risiko)

## 🚀 Installation & Deployment

### GitHub Pages (Empfohlen)
```bash
# 1. Repository erstellen
# 2. Alle Dateien hochladen
# 3. Settings → Pages → Source: main branch
# 4. Fertig!
```

### Lokaler Test
```bash
# Python SimpleHTTPServer
python3 -m http.server 8000

# Oder Node.js http-server
npx http-server
```

### Wichtig für GitHub Pages
- Alle Dateien müssen hochgeladen werden
- `icon-192.png` und `icon-512.png` erstellen (optional)
- CSP funktioniert out-of-the-box

## ⚠️ Bekannte Einschränkungen

1. **Keine externen Fonts/CDNs**
   - Aus Sicherheitsgründen nur lokale Ressourcen
   - System-Fonts werden verwendet

2. **Alert/Confirm Dialoge**
   - Nutzen native Browser-Dialoge
   - Könnten durch Custom-Modal ersetzt werden

3. **LocalStorage**
   - 10MB Limit
   - Kann bei Browser-Reset verloren gehen
   - Kein automatisches Backup

4. **Bilder als Base64**
   - Füllen LocalStorage schnell
   - Empfehlung: Max. 10-20 Rezeptbilder

## 🔒 Security Checklist

Bei Code-Änderungen prüfen:

- [ ] Keine `innerHTML` oder ähnliches verwendet?
- [ ] Alle Inputs validiert?
- [ ] Nur `textContent` für User-Daten?
- [ ] Keine Inline-Scripts/Event-Handler?
- [ ] Try-Catch um Storage-Operationen?
- [ ] Bild-Uploads validiert?
- [ ] Keine `eval()` oder `new Function()`?
- [ ] Keine Template-Strings mit HTML?

## 🐛 Fehlerbehandlung

Alle kritischen Operationen haben Fehlerbehandlung:

```javascript
// Beispiel: Storage
const result = SecureStorage.saveRecipes(recipes);
if (!result.success) {
    console.error(result.error);
    showUserError('Speichern fehlgeschlagen');
}
```

## 📊 Performance

- Modulare Struktur für besseres Caching
- Service Worker für Offline-Nutzung
- Nur statische Assets gecacht
- Lazy Loading von Bildern

## 🔄 Updates

App-Updates:
1. Dateien aktualisieren
2. Service Worker Cache-Name ändern (`v1` → `v2`)
3. Neuen Code deployen
4. User lädt App neu → automatisches Update

## 📝 Best Practices

1. **Immer validieren vor Speicherung**
2. **Nie User-Input direkt ins DOM**
3. **CSP-Header beachten**
4. **Regelmäßige Sicherheits-Audits**
5. **Console-Logs in Produktion entfernen**

## 🆘 Support

Bei Sicherheitsproblemen:
1. CSP-Fehler in Browser-Console prüfen
2. Service Worker Status prüfen
3. LocalStorage-Verfügbarkeit testen

## ✅ Compliance

Diese App erfüllt:
- ✅ OWASP Top 10 Best Practices
- ✅ CSP Level 3
- ✅ No-eval Policy
- ✅ XSS-Prevention
- ✅ Input Validation
- ✅ Safe DOM Manipulation

---

**Maximale Sicherheit für statisches Hosting! 🔒**
