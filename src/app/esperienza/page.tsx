import dynamic from 'next/dynamic'

const GrottaExperience = dynamic(() => import('@/components/GrottaExperience').then((m) => m.GrottaExperience), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-dvh items-center justify-center bg-cave-black font-sans text-text-muted">
      Caricamento…
    </div>
  ),
})

export default function EsperienzaPage() {
  return <GrottaExperience />
}
