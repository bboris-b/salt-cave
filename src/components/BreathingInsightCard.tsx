'use client'

import { PillTag } from '@/components/ui/PillTag'
import type { BreathingAnalysisData } from '@/providers/BreathingDataProvider'

type Props = {
  data: BreathingAnalysisData
  className?: string
}

/**
 * Box dati post-intro (stesso linguaggio visivo delle card Benefici).
 */
export function BreathingInsightCard({ data, className = '' }: Props) {
  return (
    <aside
      className={`border border-cave-charcoal/60 bg-cave-dark/40 p-6 backdrop-blur-sm md:p-8 lg:border-cave-charcoal/50 ${className}`.trim()}
      aria-label="Riepilogo dal tuo respiro"
    >
      <PillTag className="mb-4">Dal tuo respiro</PillTag>
      <p className="type-display-lead text-salt-warm">{data.headline}</p>
      <p className="mt-4 font-sans text-sm font-normal leading-relaxed text-text-secondary">{data.personalizedMessage}</p>
      <p className="mt-4 border-t border-cave-charcoal/40 pt-4 font-sans text-xs text-text-muted">
        RR {data.respiratoryRate.toFixed(1)}/min · rapporto I:E {data.inhaleExhaleRatio.toFixed(2)}
      </p>
    </aside>
  )
}
