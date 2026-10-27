# Dheco — nieuwe website (preview)
Statische site (vanilla HTML/CSS/JS). Bron in `src/`, `build.py` genereert `dist/`.
- Preview: `python3 build.py` (noindex, canonical = preview-URL)
- Livegang: `DHECO_LIVE=1 python3 build.py` (indexeerbaar, canonical = https://dheco.be/)
- Formulier: zet `FORM_ENDPOINT` in `assets/js/app.js` (bv. Formspree); leeg = mailto-demo.
Beelden gemarkeerd als “illustratie” zijn AI-gegenereerd en moeten bij livegang vervangen worden door echte projectfoto’s.
