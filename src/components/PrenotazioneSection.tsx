'use client'

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import SplitType from 'split-type'
import { gsap, initGsapPlugins } from '@/lib/gsap-init'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { getBookingPackageLabel } from '@/lib/bookingPackage'
import { getTimeSlotsForDate, type TimeSlot } from '@/lib/staticAvailability'
import { buildBookingWhatsAppUrl } from '@/lib/whatsappBooking'

const TITLE = 'Ti aspettiamo'
const WORD_STAGGER = 0.1
const WORD_DURATION = 0.75
const SUBTITLE_DURATION = 0.75

const WEEKDAYS = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'] as const

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function buildCalendarCells(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  const startPad = (first.getDay() + 6) % 7
  const cells: (number | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= lastDay; d++) cells.push(d)
  return cells
}

function formatDateItLong(d: Date): string {
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}

function dayAriaLabel(year: number, month: number, day: number, available: boolean): string {
  const dt = new Date(year, month, day)
  const long = dt.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return `${long.charAt(0).toUpperCase() + long.slice(1)}, ${available ? 'disponibile' : 'non disponibile'}`
}

function digitsPhone(s: string): string {
  return s.replace(/\D/g, '')
}

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function PrenotazioneSection() {
  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleInnerRef = useRef<HTMLSpanElement>(null)
  const calendarColRef = useRef<HTMLDivElement>(null)
  const formColRef = useRef<HTMLDivElement>(null)
  const slotsRef = useRef<HTMLDivElement>(null)

  const nameId = useId()
  const phoneId = useId()
  const peopleId = useId()
  const nameErrId = `${nameId}-err`
  const phoneErrId = `${phoneId}-err`
  const dateErrId = useId()
  const timeErrId = useId()

  const today = useMemo(() => startOfDay(new Date()), [])
  const [viewYear, setViewYear] = useState(() => today.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => today.getMonth())
  const [monthEnterDir, setMonthEnterDir] = useState<'left' | 'right'>('right')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [people, setPeople] = useState(1)
  const [packageLabel, setPackageLabel] = useState('Non specificato')
  const [errors, setErrors] = useState<{
    name?: string
    phone?: string
    date?: string
    time?: string
  }>({})

  /** Focus tastiera nel calendario (Tab non passa per ogni giorno) */
  const [rovingDay, setRovingDay] = useState<Date | null>(null)
  const gridNavRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPackageLabel(getBookingPackageLabel() ?? 'Non specificato')
    const onVis = () => setPackageLabel(getBookingPackageLabel() ?? 'Non specificato')
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('focus', onVis)
    }
  }, [])

  const slots: TimeSlot[] = useMemo(
    () => (selectedDate ? getTimeSlotsForDate(selectedDate) : []),
    [selectedDate],
  )

  useEffect(() => {
    setSelectedSlotId(null)
  }, [selectedDate])

  const cells = useMemo(() => buildCalendarCells(viewYear, viewMonth), [viewYear, viewMonth])

  const monthLabel = useMemo(
    () =>
      new Date(viewYear, viewMonth, 1).toLocaleDateString('it-IT', {
        month: 'long',
        year: 'numeric',
      }),
    [viewYear, viewMonth],
  )

  const goPrevMonth = useCallback(() => {
    setMonthEnterDir('left')
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1)
        return 11
      }
      return m - 1
    })
  }, [])

  const goNextMonth = useCallback(() => {
    setMonthEnterDir('right')
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1)
        return 0
      }
      return m + 1
    })
  }, [])

  const selectableDatesOrdered = useMemo(() => {
    const out: Date[] = []
    const last = new Date(viewYear, viewMonth + 1, 0).getDate()
    for (let d = 1; d <= last; d++) {
      const dt = startOfDay(new Date(viewYear, viewMonth, d))
      if (dt >= today) out.push(new Date(viewYear, viewMonth, d, 12, 0, 0))
    }
    return out
  }, [viewYear, viewMonth, today])

  useEffect(() => {
    if (selectableDatesOrdered.length === 0) {
      setRovingDay(null)
      return
    }
    setRovingDay((prev) => {
      if (!prev) return selectableDatesOrdered[0]
      const still = selectableDatesOrdered.some((d) => isSameDay(d, prev))
      return still ? prev : selectableDatesOrdered[0]
    })
  }, [selectableDatesOrdered])

  const gridMeta = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const pad = (first.getDay() + 6) % 7
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate()
    const totalCells = Math.ceil((pad + lastDay) / 7) * 7
    const giToDate = (gi: number): Date | null => {
      const dom = gi - pad + 1
      if (dom < 1 || dom > lastDay) return null
      return new Date(viewYear, viewMonth, dom, 12, 0, 0)
    }
    const dayToGi = (dom: number) => pad + dom - 1
    return { pad, lastDay, totalCells, giToDate, dayToGi }
  }, [viewYear, viewMonth])

  const moveRovingInGrid = useCallback(
    (fromDay: Date, dir: 'left' | 'right' | 'up' | 'down') => {
      const { totalCells, giToDate, dayToGi } = gridMeta
      const currentGi = dayToGi(fromDay.getDate())
      const isSelectable = (dt: Date | null) => dt && startOfDay(dt) >= today

      if (dir === 'right') {
        for (let g = currentGi + 1; g < totalCells; g++) {
          const dt = giToDate(g)
          if (isSelectable(dt)) {
            setRovingDay(dt)
            return
          }
        }
      }
      if (dir === 'left') {
        for (let g = currentGi - 1; g >= 0; g--) {
          const dt = giToDate(g)
          if (isSelectable(dt)) {
            setRovingDay(dt)
            return
          }
        }
      }
      if (dir === 'down') {
        for (let g = currentGi + 7; g < totalCells; g += 7) {
          const dt = giToDate(g)
          if (isSelectable(dt)) {
            setRovingDay(dt)
            return
          }
        }
      }
      if (dir === 'up') {
        for (let g = currentGi - 7; g >= 0; g -= 7) {
          const dt = giToDate(g)
          if (isSelectable(dt)) {
            setRovingDay(dt)
            return
          }
        }
      }
    },
    [gridMeta, today],
  )

  const onGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const current = rovingDay ?? selectableDatesOrdered[0]
      if (!current) return

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          moveRovingInGrid(current, 'right')
          break
        case 'ArrowLeft':
          e.preventDefault()
          moveRovingInGrid(current, 'left')
          break
        case 'ArrowDown':
          e.preventDefault()
          moveRovingInGrid(current, 'down')
          break
        case 'ArrowUp':
          e.preventDefault()
          moveRovingInGrid(current, 'up')
          break
        case 'Home':
          e.preventDefault()
          if (selectableDatesOrdered[0]) setRovingDay(selectableDatesOrdered[0])
          break
        case 'End':
          e.preventDefault()
          {
            const last = selectableDatesOrdered[selectableDatesOrdered.length - 1]
            if (last) setRovingDay(last)
          }
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (startOfDay(current) >= today) setSelectedDate(current)
          break
        default:
          break
      }
    },
    [moveRovingInGrid, rovingDay, selectableDatesOrdered, today],
  )

  /* ——— Header: word-by-word + subtitle clip ——— */
  useLayoutEffect(() => {
    initGsapPlugins()
    const section = sectionRef.current
    const titleEl = titleRef.current
    const subIn = subtitleInnerRef.current
    if (!section || !titleEl || !subIn) return

    let split: SplitType | null = null
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([titleEl, subIn], { clearProps: 'all' })
        gsap.set(titleEl, { autoAlpha: 1 })
        gsap.set(subIn, { yPercent: 0 })
        return
      }

      split = new SplitType(titleEl, { types: 'words', tagName: 'span' })
      const words = split.words
      if (!words?.length) {
        split.revert()
        split = null
        return
      }

      gsap.set(words, { autoAlpha: 0, y: 48 })
      gsap.set(subIn, { yPercent: 100 })

      const titleEnd = (words.length - 1) * WORD_STAGGER + WORD_DURATION

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          once: true,
        },
      })

      tl.fromTo(
        words,
        { autoAlpha: 0, y: 48 },
        {
          autoAlpha: 1,
          y: 0,
          duration: WORD_DURATION,
          stagger: WORD_STAGGER,
          ease: 'power3.out',
        },
        0,
      )
      tl.fromTo(
        subIn,
        { yPercent: 100 },
        { yPercent: 0, duration: SUBTITLE_DURATION, ease: 'power4.out' },
        titleEnd * 0.35,
      )
    }, section)

    return () => {
      ctx.revert()
      split?.revert()
    }
  }, [reduced])

  /* ——— Calendario + form: ingresso stagger ——— */
  useLayoutEffect(() => {
    initGsapPlugins()
    const section = sectionRef.current
    const cal = calendarColRef.current
    const form = formColRef.current
    if (!section || !cal || !form) return

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([cal, form], { clearProps: 'all', opacity: 1, y: 0 })
        return
      }
      gsap.set([cal, form], { autoAlpha: 0, y: 40 })
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          once: true,
        },
      })
      tl.to(cal, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      tl.to(form, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.2)
    }, section)

    return () => ctx.revert()
  }, [reduced])

  /* ——— Fasce orarie: micro-stagger ——— */
  useLayoutEffect(() => {
    const root = slotsRef.current
    if (!root || !selectedDate) return

    const pills = root.querySelectorAll('.booking-slot-pill')
    if (!pills.length) return

    if (reduced) {
      gsap.set(pills, { clearProps: 'all', opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        pills,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.04,
          ease: 'power2.out',
        },
      )
    }, root)

    return () => ctx.revert()
  }, [selectedDate, slots, reduced])

  const validate = useCallback(() => {
    const next: typeof errors = {}
    const nt = name.trim()
    if (nt.length < 2) next.name = 'Inserisci almeno 2 caratteri.'
    const pd = digitsPhone(phone)
    if (pd.length < 9) next.phone = 'Inserisci un numero di telefono valido.'
    if (!selectedDate) next.date = 'Seleziona un giorno nel calendario.'
    if (!selectedSlotId) next.time = 'Seleziona un orario tra quelli disponibili.'
    return next
  }, [name, phone, selectedDate, selectedSlotId])

  const formComplete =
    name.trim().length >= 2 &&
    digitsPhone(phone).length >= 9 &&
    selectedDate !== null &&
    selectedSlotId !== null

  const handleWhatsApp = useCallback(() => {
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) return

    if (!selectedDate || !selectedSlotId) return

    const slotLabel = slots.find((s) => s.id === selectedSlotId)?.label ?? selectedSlotId
    const url = buildBookingWhatsAppUrl({
      name: name.trim(),
      dateLabel: formatDateItLong(selectedDate),
      timeLabel: slotLabel,
      people,
      packageLabel,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [validate, selectedDate, selectedSlotId, slots, name, people, packageLabel])

  const inputClass =
    'w-full rounded-xl border border-cave-charcoal bg-cave-dark px-4 py-4 font-sans text-base font-normal text-text-primary outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-muted focus:border-salt-pink focus:shadow-[0_0_0_3px_rgba(212,150,122,0.1)] focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-black'

  const monthAnimClass =
    monthEnterDir === 'right' ? 'booking-cal-month-in-right' : 'booking-cal-month-in-left'

  return (
    <section
      ref={sectionRef}
      id="prenotazione"
      className="scroll-mt-24 border-t border-cave-charcoal/40"
      aria-labelledby="prenotazione-main-heading"
    >
      <div className="mx-auto max-w-[1100px] px-5 py-20 lg:px-8 lg:py-24">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="prenotazione-main-heading"
            ref={titleRef}
            className="type-display-hero text-salt-warm"
          >
            {TITLE}
          </h2>
          <div className="mt-5 overflow-hidden">
            <span
              ref={subtitleInnerRef}
              className="block font-sans text-base font-normal leading-snug text-text-secondary"
            >
              Scegli data e orario. Nient&apos;altro.
            </span>
          </div>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 lg:items-start">
          {/* Calendario */}
          <div ref={calendarColRef} className="min-w-0">
            <div className="rounded-[20px] bg-cave-dark p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cave-charcoal text-salt-warm outline-none transition-colors hover:border-salt-pink/40 focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-dark"
                  aria-label="Mese precedente"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <h3 className="type-display-lead capitalize text-salt-warm">{monthLabel}</h3>
                <button
                  type="button"
                  onClick={goNextMonth}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cave-charcoal text-salt-warm outline-none transition-colors hover:border-salt-pink/40 focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-dark"
                  aria-label="Mese successivo"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div key={`${viewYear}-${viewMonth}`} className={reduced ? '' : monthAnimClass}>
                <div className="mb-3 grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((d) => (
                    <div
                      key={d}
                      className="py-2 text-center font-sans text-xs font-normal uppercase tracking-wide text-text-muted"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div
                  ref={gridNavRef}
                  tabIndex={0}
                  role="grid"
                  aria-label={`Giorni di ${monthLabel}. Usa le frecce per spostarti, Invio per selezionare.`}
                  aria-activedescendant={rovingDay ? `cal-day-${dateKey(rovingDay)}` : undefined}
                  onKeyDown={onGridKeyDown}
                  onFocus={() => {
                    if (!rovingDay && selectableDatesOrdered[0]) setRovingDay(selectableDatesOrdered[0])
                  }}
                  className="grid grid-cols-7 gap-1 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-dark"
                >
                  {cells.map((day, i) => {
                    if (day === null) {
                      return <div key={`e-${i}`} className="aspect-square" />
                    }
                    const cellDate = new Date(viewYear, viewMonth, day, 12, 0, 0)
                    const sod = startOfDay(cellDate)
                    const isPast = sod < today
                    const isToday = isSameDay(cellDate, new Date())
                    const sel = selectedDate && isSameDay(cellDate, selectedDate)
                    const isRoving = rovingDay !== null && isSameDay(cellDate, rovingDay)
                    const k = dateKey(cellDate)
                    const available = !isPast

                    return (
                      <div key={k} className="aspect-square p-0.5">
                        <button
                          type="button"
                          id={`cal-day-${k}`}
                          role="gridcell"
                          disabled={!available}
                          aria-label={dayAriaLabel(viewYear, viewMonth, day, available)}
                          aria-selected={sel ? true : undefined}
                          tabIndex={-1}
                          onClick={() => {
                            if (!available) return
                            setSelectedDate(cellDate)
                            setRovingDay(cellDate)
                          }}
                          className={[
                            'flex h-full w-full items-center justify-center rounded-full font-sans text-base font-normal outline-none transition-[background-color,color,box-shadow] duration-200',
                            !available && 'cursor-not-allowed text-text-muted',
                            available && !sel && 'text-text-primary hover:bg-salt-pink/15',
                            sel && 'bg-salt-pink text-cave-black',
                            isToday && !sel && available && 'ring-1 ring-salt-pink',
                            isRoving && !sel && available && 'ring-2 ring-salt-pink/70 ring-offset-1 ring-offset-cave-dark',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {day}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {errors.date ? (
                <p id={dateErrId} className="mt-4 text-center font-sans text-xs text-salt-pink" role="alert">
                  {errors.date}
                </p>
              ) : null}
            </div>
          </div>

          {/* Form */}
          <div ref={formColRef} className="min-w-0">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()} noValidate id="booking-form">
              <div>
                <label htmlFor={nameId} className="mb-2 block font-sans text-sm font-normal text-text-primary">
                  Il tuo nome
                </label>
                <input
                  id={nameId}
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors((x) => ({ ...x, name: undefined }))
                  }}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? nameErrId : undefined}
                  className={inputClass}
                  placeholder="Nome e cognome"
                />
                {errors.name ? (
                  <p id={nameErrId} className="mt-1.5 font-sans text-xs text-salt-pink" role="alert">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor={phoneId} className="mb-2 block font-sans text-sm font-normal text-text-primary">
                  Telefono
                </label>
                <input
                  id={phoneId}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (errors.phone) setErrors((x) => ({ ...x, phone: undefined }))
                  }}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={errors.phone ? phoneErrId : undefined}
                  className={inputClass}
                  placeholder="Es. 333 123 4567"
                />
                {errors.phone ? (
                  <p id={phoneErrId} className="mt-1.5 font-sans text-xs text-salt-pink" role="alert">
                    {errors.phone}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor={peopleId} className="mb-2 block font-sans text-sm font-normal text-text-primary">
                  Quante persone?
                </label>
                <select
                  id={peopleId}
                  name="people"
                  value={people}
                  onChange={(e) => setPeople(Number(e.target.value))}
                  className={`${inputClass} cursor-pointer appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%239c9486'%3E%3Cpath d='M4 6l4 4 4-4' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  }}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-3 font-sans text-sm font-normal text-text-primary">Orario</p>
                <div
                  ref={slotsRef}
                  className="flex flex-wrap gap-2"
                  role="radiogroup"
                  aria-label="Fasce orarie disponibili"
                  aria-describedby={errors.time ? timeErrId : undefined}
                >
                  {!selectedDate ? (
                    <p className="font-sans text-sm text-text-muted">Seleziona prima un giorno.</p>
                  ) : (
                    slots.map((slot) => {
                      const active = selectedSlotId === slot.id
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={!slot.available}
                          onClick={() => {
                            if (!slot.available) return
                            setSelectedSlotId(slot.id)
                            if (errors.time) setErrors((x) => ({ ...x, time: undefined }))
                          }}
                          className={[
                            'booking-slot-pill rounded-full px-5 py-2 font-sans text-sm font-normal outline-none transition-[background-color,color,transform] duration-200',
                            'focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-black',
                            !slot.available && 'cursor-not-allowed text-text-muted line-through opacity-60',
                            slot.available && !active && 'bg-cave-charcoal text-text-primary hover:bg-cave-charcoal/90',
                            active && 'bg-salt-pink text-cave-black',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {slot.label}
                        </button>
                      )
                    })
                  )}
                </div>
                {errors.time ? (
                  <p id={timeErrId} className="mt-2 font-sans text-xs text-salt-pink" role="alert">
                    {errors.time}
                  </p>
                ) : null}
              </div>

              <p className="font-sans text-xs text-text-muted">
                Pacchetto: <span className="text-text-secondary">{packageLabel}</span>
              </p>

              <button
                type="button"
                onClick={handleWhatsApp}
                className={[
                  'flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 font-sans text-sm font-medium text-white outline-none transition-[transform,filter] duration-200 hover:scale-[1.01] hover:brightness-90 focus-visible:ring-2 focus-visible:ring-salt-pink focus-visible:ring-offset-2 focus-visible:ring-offset-cave-black',
                  formComplete && !reduced ? 'booking-wa-pulse' : '',
                ].join(' ')}
              >
                <IconWhatsApp className="shrink-0" />
                Conferma su WhatsApp
              </button>
            </form>
          </div>
        </div>

        {/* Rassicurazioni */}
        <div className="mx-auto mt-12 flex max-w-2xl flex-col flex-wrap items-center justify-center gap-6 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-2 text-text-muted">
            <span className="text-success" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path
                  d="M4 9.2 7.2 12.4 14 5.6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-sans text-xs font-normal">Annullamento gratuito</span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <span aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v6l3 2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="font-sans text-xs font-normal">Risposta in 1h</span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <span aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="6" width="18" height="12" rx="2" />
                <path d="M3 10h18" />
              </svg>
            </span>
            <span className="font-sans text-xs font-normal">Pagamento in sede</span>
          </div>
        </div>
      </div>
    </section>
  )
}
