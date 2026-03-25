import { ImageResponse } from 'next/og'

export const alt = 'Grotta di Sale Roma — haloterapia'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a08',
          backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,150,122,0.2) 0%, transparent 55%)',
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 400,
            color: '#e8c4a0',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          Grotta di Sale
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 22,
            color: '#9c9486',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Il tuo rifugio di sale nel cuore di Roma
        </div>
      </div>
    ),
    { ...size },
  )
}
