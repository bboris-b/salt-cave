export type BreathInsight = {
  rrLine: string
  body: string
}

export function getBreathMessage(rr: number, ieRatio: number): BreathInsight {
  const rrLine = `Il tuo ritmo: ${rr.toFixed(1)} respiri al minuto`

  if (rr > 18) {
    return {
      rrLine,
      body:
        "Il tuo respiro è un po' accelerato. Succede spesso a chi vive in città, sotto stress. L'aria micronizzata della grotta di sale aiuta naturalmente a ritrovare un ritmo più lento e profondo.",
    }
  }
  if (rr < 12) {
    return {
      rrLine,
      body:
        'Respiri in modo profondo e consapevole — un ritmo che indica calma. Potresti apprezzare l\'esperienza meditativa della nostra grotta di sale.',
    }
  }
  if (rr >= 12 && rr <= 18 && ieRatio > 0.9) {
    return {
      rrLine,
      body:
        'Il tuo ritmo è nella norma, ma le tue espirazioni sono brevi. Un\'espirazione più lunga attiva il sistema nervoso parasimpatico — quello del rilassamento. In grotta, il respiro si allunga spontaneamente.',
    }
  }
  return {
    rrLine,
    body:
      'Ottimo! Il tuo respiro è equilibrato, con una bella espirazione distesa. L\'haloterapia può aiutarti a mantenere questo benessere e rafforzare le tue vie respiratorie.',
  }
}
