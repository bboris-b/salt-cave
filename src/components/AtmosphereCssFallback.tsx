/**
 * Fallback quando il canvas 2D non è disponibile o durante il lazy load.
 * Gradiente caldo + pattern tipo grain (CSS).
 */
export function AtmosphereCssFallback() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 min-h-dvh bg-cave-black"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 120% 80% at 50% 40%, rgba(212, 150, 122, 0.12) 0%, transparent 55%),
          radial-gradient(ellipse 90% 60% at 70% 20%, rgba(200, 135, 79, 0.08) 0%, transparent 50%),
          linear-gradient(180deg, #0a0a08 0%, #14120e 50%, #0a0a08 100%)
        `,
      }}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  )
}
