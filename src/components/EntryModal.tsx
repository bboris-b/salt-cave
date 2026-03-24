import './GrottaIntro.css'

type Props = {
  exiting: boolean
  onEnter: () => void
}

export function EntryModal({ exiting, onEnter }: Props) {
  return (
    <div className={`entry-modal${exiting ? ' entry-modal--exit' : ''}`} role="dialog" aria-modal="true" aria-labelledby="grotta-entry-title">
      <div className="entry-modal__card">
        <h1 id="grotta-entry-title" className="entry-modal__title">
          Grotta di Sale
        </h1>
        <p className="entry-modal__lead">
          Un momento per lasciare la città fuori. Ti guideremo con il respiro verso il silenzio della grotta.
        </p>
        <button type="button" className="entry-modal__cta" onClick={onEnter}>
          Entra nella grotta
        </button>
        <p className="entry-modal__hint">
          Servirà il microfono per dare vita alla sfera di sale. I suoni ambientali sono opzionali.
        </p>
      </div>
    </div>
  )
}
