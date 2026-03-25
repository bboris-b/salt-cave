# Stanza 2 — Prompt Cursor & convenzioni DS

## Header — convenzioni design system (tipografia)

- **Display / titoli:** **Fraunces** (Google Fonts, **variable**), non Cormorant Garamond.
- **Assi:** `wght` 100–900 · `opsz` 9–144 · `WONK` 0–1 · `SOFT` 0–100.
- **Uso consigliato:** hero `wght` 300 + `opsz` 72 + `WONK` 0; sezioni `wght` 500 + `opsz` 36; card/emphasis `wght` 600 + `opsz` 24; `SOFT` default 0; `WONK` default 0.5 solo dove serve tono più organico.
- **Tracking:** `-0.02em` sui titoli display grandi.
- **Uppercase:** **mai** Fraunces in uppercase — label uppercase solo **DM Sans** (12px, 500, `letter-spacing` 0.2em), classe `.type-label-uppercase`.
- **Scala:** hero `clamp(2.5rem, 6vw, 4rem)` · sezione `clamp(1.5rem, 3vw, 2.25rem)` · card `clamp(1.25rem, 2vw, 1.75rem)` · body 16px DM Sans 400.
- **Layout font:** `next/font/google` — `Fraunces` con `weight: 'variable'`, `axes: ['WONK', 'SOFT', 'opsz']`, `variable: '--font-display'`, `preload: true`.
- **Motion font (hero):** scroll scrub `wght` 300→600; hover desktop `WONK` 0→1 in 600ms `power2.out`; mobile un solo step senza scrub; `prefers-reduced-motion` → statico `wght` 500, niente animazione assi.

---

## Prompt — hero / landing (display font)

Quando generi o modifichi il hero della Stanza 2, usa **Fraunces variable** per il titolo principale:

- Classe tipografica: `.type-display-hero` (o equivalente: `clamp(2.5rem, 6vw, 4rem)`, `wght` 300, `opsz` 72, `WONK` 0).
- Aggiungi animazione **solo se** il brief lo richiede: GSAP su `fontVariationSettings`, `ScrollTrigger` `scrub: 1`, range `wght` 300→600; contenitore con `will-change: contents`; massimo 1–2 titoli animati per pagina.

---

## Prompt — sezioni marketing (display font)

Per `h2` di sezione (“Benefici”, “Chi siamo”, blocchi editoriali):

- Usa **Fraunces** con **`.type-display-section`** (`wght` 500, `opsz` 36, tracking `-0.02em`).
- Non usare `font-light` / `font-normal` Tailwind per sostituire i pesi variable: i pesi passano da `font-variation-settings` (classi CSS o token).

---

## Prompt — card prezzi / emphasis (display font)

Per nomi pacchetto, prezzi in evidenza, micro-titoli card:

- **`.type-display-card`**: `wght` 600, `opsz` 24, `clamp(1.25rem, 2vw, 1.75rem)`.

---

## Prompt — brand / navbar / footer / loader (NO display serif in uppercase)

Per stringhe **uppercase** tipo “GROTTA DI SALE”, link brand, loader:

- Solo **DM Sans**: **`.type-label-uppercase`** (non `font-display`).

---

## Prompt — citazioni / italic (display font)

Per blockquote in Fraunces con corsivo:

- Caricare `Fraunces` con `style: ['normal', 'italic']` nel layout.
- Testo citazione: `.type-display-lead` + `italic` dove serve; virgolette decorative: `.type-display-deco`.

---

## Prompt — accessibilità motion

Se l’utente ha `prefers-reduced-motion: reduce` (o classe `salt-cave-reduced-motion`):

- Nessuna animazione su `font-variation-settings`.
- Titoli display con variante statica `wght` 500 (vedi `globals.css`).

---

## PROMPT 2 — Hero sezione scienza (`ScienceHero` / `#esperienza`)

1. **Tipografia e copy del blocco testo:** seguire l’header DS e il PROMPT hero / landing (Fraunces variable, `.type-display-hero`, animazioni titolo solo dove previsto).

2. **Animazione testo (ingresso):** timeline GSAP con `ScrollTrigger` sulla sezione (`start: 'top 75%'`, `once`) per label, parole del titolo, righe sottotitolo — senza legare il reveal del visual a questa timeline.

3. **VISUAL HERO — atmosfera grotta con parallax e clip-path reveal**

   NON usare un pattern SVG geometrico. NON usare immagini placeholder generiche.
   Costruire un hero visual che evochi l'interno della grotta anche senza foto reali.

   **STRUTTURA A LAYER (dal fondo alla superficie):**

   **Layer 0 (sfondo):** gradiente radiale atmosferico

   - radial-gradient ellittico dal centro-basso
   - Centro: `var(--salt-amber)` al 8% opacity
   - Bordi: `var(--cave-black)` al 100% opacity
   - Simula una sorgente di luce calda dal basso (come luce di candele nella grotta)
   - Animazione LENTISSIMA: il centro del gradiente oscilla leggermente
     (`translateY` 0→-3%→0, 8s, ease-in-out, infinite) — effetto luce viva
   - `@media (prefers-reduced-motion)`: gradiente statico

   **Layer 1 (texture):** CSS noise grain

   - Pseudo-element `::after` con background SVG noise (feTurbulence) o filter
   - Opacity: 0.03–0.05 (appena percettibile, dà matericità)
   - `mix-blend-mode: overlay`
   - Position: absolute, copre tutto il visual

   **Layer 2 (profondità):** particelle di sale (stessa logica delle particelle atmosferiche, es. `createSaltParticles` / canvas nel riquadro hero)

   - In questa zona le particelle aumentano leggermente di densità e luminosità
   - Parallax: le particelle si muovono a velocità diversa dallo scroll (offset da scroll + mouse leggero sul riquadro)

   **Layer 3 (contenuto):** immagine reale della grotta (quando disponibile)

   - Per ora: un div con aspect-ratio 16/9 che contiene i layer 0-1-2 (o struttura equivalente nel container hero)
   - Quando il cliente fornirà foto: `<img>` con `object-fit: cover`
   - In entrambi i casi, il visual ha:

   **CLIP-PATH REVEAL dall'alto:**

   - Stato iniziale: `clip-path: inset(0 0 100% 0)` — completamente nascosto
   - Stato finale: `clip-path: inset(0)` — completamente visibile
   - L'immagine si "rivela" scendendo dall'alto, come una tenda che si alza
   - Durata: 1400ms
   - Easing: `power4.inOut`
   - Trigger: ScrollTrigger, `start` `"top 70%"`

   **PARALLAX sull'immagine (wrapper interno):**

   - L'immagine interna si muove verso l'alto più lentamente dello scroll
   - `data-parallax="0.15"` (parallax leggero, non da nausea)
   - L'immagine è leggermente più grande del container (`scale` 1.15) per avere
     spazio di movimento senza mostrare bordi
   - GSAP: `gsap.to('.hero-visual-inner', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero-visual', start: 'top bottom', end: 'bottom top', scrub: true } })`

   **DIMENSIONI:**

   - Desktop: height `60vh`, max-height `600px`, full-width dentro max-width `1100px`
   - Mobile: height `50vh` / aspect-ratio `4/3` (container coerente con il layout)
   - Border-radius: `16px` (`rounded-2xl`)
   - Overflow: hidden (per clip-path e parallax)

   **CAPTION sotto il visual:**

   - "Sale Rosa dell'Himalaya, nebulizzato a particelle microscopiche"
   - Body font, caption size, `var(--text-muted)`
   - Fade-in 400ms dopo il completamento del clip-path reveal

   **CODICE DI RIFERIMENTO** per il clip-path + parallax:

   ```jsx
   // Dentro il componente HeroSection
   useLayoutEffect(() => {
     const ctx = gsap.context(() => {
       // Clip-path reveal
       gsap.from('.hero-visual', {
         clipPath: 'inset(0 0 100% 0)',
         duration: 1.4,
         ease: 'power4.inOut',
         scrollTrigger: {
           trigger: '.hero-visual',
           start: 'top 70%',
           once: true,
         }
       });

       // Parallax interno
       gsap.to('.hero-visual-inner', {
         yPercent: -8,
         ease: 'none',
         scrollTrigger: {
           trigger: '.hero-visual',
           start: 'top bottom',
           end: 'bottom top',
           scrub: true,
         }
       });
     });
     return () => ctx.revert();
   }, []);
   ```

   In produzione usare **ref** sugli elementi invece dei selettori globali quando il contesto è condiviso con altre animazioni.
