# Spud Bud Zagreb — prezentacijska web stranica

Jednostranična stranica (HTML/CSS/JS, bez build koraka) za **Spud Bud Zagreb** — prvi hrvatski koncept punjenog pečenog krumpira.

**Live:** https://kriscro99.github.io/spud-bud/

## Sadržaj i izvori
- Tekstovi, jelovnik (bez cijena), lokacije, telefoni, FAQ i recenzije: službena stranica spudbud.hr i Facebook stranica `spud.bud.zagreb`.
- Logo: vektorski PDF iz službenog media kita (2026-SpudBud-media-kit), pretvoren u SVG i razdvojen u slojeve za animaciju.
- Fotografije: media kit + spudbud.hr (pretvorene u WebP).
- Google ocjena 4,4 (1.100+ recenzija) za Bogovićevu 4 — provjereno 29. 9. 2026.

## Indeksiranje
Budući da klijent već ima službenu stranicu (spudbud.hr), ova verzija ima `<meta name="robots" content="noindex, follow">`.
Ako ova stranica postane službena, u `index.html` promijeni u `index, follow` i ažuriraj `og:url` / `og:image` na pravu domenu.

## Održavanje
- Radno vrijeme lokacija: `data-open` / `data-close` na `.loc` karticama (status "Otvoreno" računa se po zagrebačkom vremenu).
- Obavijest "Uskoro" (Bučijada) sama se skriva nakon datuma u `data-until`.
- "Mjeseci od prvog Spuda" računa se automatski od 11. 4. 2025.
