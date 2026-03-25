# Grotta di Sale — MVP

## Parte 1 — Design system

### Tipografia

#### Display / titoli: Fraunces (Google Fonts, variable)

Un unico file variable (woff2) copre tutti gli assi. In Next.js:

```ts
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  axes: ['WONK', 'SOFT', 'opsz'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
})
```

**Assi:**

| Asse | Range | Uso |
|------|--------|-----|
| `wght` | 100–900 | 300 hero, 500 titoli sezione, 600 emphasis / card |
| `opsz` | 9–144 | 72+ display, 18–36 titoli medi, 9 body (qui non usato per body) |
| `WONK` | 0–1 | “Stravaganza” delle curve: 0 serio/autorevole, 1 caldo/organico; default equilibrio **0.5** dove non specificato |
| `SOFT` | 0–100 | Arrotondamento terminali; default **0** |

**Regole:**

- **Letter-spacing:** `-0.02em` sui titoli grandi (Fraunces è più largo di Cormorant).
- **Uppercase:** non usare Fraunces in uppercase — perde il carattere. Per label uppercase usare **DM Sans** (classe `.type-label-uppercase`: 12px, weight 500, `letter-spacing: 0.2em`).

#### Scala tipografica (implementata in `globals.css`)

| Ruolo | Misura | Font / assi |
|--------|--------|-------------|
| Hero / titolo intro | `clamp(2.5rem, 6vw, 4rem)` | Fraunces `wght` 300, `opsz` 72, `WONK` 0, `SOFT` 0 — classe `.type-display-hero` |
| Titolo sezione | `clamp(1.5rem, 3vw, 2.25rem)` | Fraunces `wght` 500, `opsz` 36, `WONK` 0 — `.type-display-section` |
| Titolo card / emphasis | `clamp(1.25rem, 2vw, 1.75rem)` | Fraunces `wght` 600, `opsz` 24, `WONK` 0 — `.type-display-card` |
| Body | 1rem (16px) | DM Sans 400 |
| Small / label | 0.875rem (14px) | DM Sans 400 |
| Caption / disclaimer | 0.75rem (12px) | DM Sans 400 |
| Label uppercase | 0.75rem (12px) | DM Sans 500, `letter-spacing` 0.2em |

#### Corpo e UI: DM Sans

```ts
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: true,
})
```

### Animazione tipografica (USP)

Solo su **1–2 titoli principali** per pagina (es. hero Stanza 2). Non animare tutti i titoli.

**Scroll-driven weight (desktop):** il titolo parte a `wght` 300 e arriva a `wght` 600 mentre entra nel viewport — GSAP `ScrollTrigger` con `scrub`.

**Hover WONK (solo desktop, `hover` + `fine`):** al passaggio del mouse, `WONK` da 0 → 1 in **600ms**, easing `power2.out`.

Esempio (concettuale — vedi `ScienceHero.tsx`):

```ts
gsap.to('.hero-title', {
  fontVariationSettings: '"wght" 600, "WONK" 0, "opsz" 72',
  scrollTrigger: { trigger: '.hero-title', start: 'top 80%', end: 'top 30%', scrub: 1 },
})
```

**Nota performance:** `font-variation-settings` non è GPU-compositata e può causare reflow. Mitigazioni:

- `will-change: contents` sul contenitore durante l’animazione (`.hero-title-var-wrap`).
- Limitare a 1–2 titoli animati.
- **Mobile:** una sola transizione `wght` 300 → 600 senza scrub, al primo ingresso in viewport.
- **`prefers-reduced-motion`:** nessuna animazione sui font; mostrare direttamente `wght` 500 (regole in `globals.css` + ramo ridotto in componente).

---

*Altre parti del documento MVP da integrare qui sotto.*
