import { toRoman } from '@/lib/format'

const PENALTY_TABLE: { range: string; penalty: string; label: string }[] = [
  { range: '±0.5 eller mindre', penalty: '+0', label: 'Spot on' },
  { range: '±0.5 til ±1.0', penalty: '+1', label: '' },
  { range: '±1.0 til ±1.5', penalty: '+2', label: '' },
  { range: '±1.5 til ±2.0', penalty: '+3', label: '' },
  { range: 'Over ±2.0', penalty: '+4', label: 'Outlier' },
]

const EXAMPLE: { sips: number; base: number; distance: number; penalty: number; total: number; note?: string }[] = [
  { sips: 1, base: 1, distance: 3.0, penalty: 4, total: 5, note: 'Modig — men langt fra' },
  { sips: 3, base: 3, distance: 1.0, penalty: 1, total: 4, note: 'Sweet spot' },
  { sips: 4, base: 4, distance: 0, penalty: 0, total: 4, note: 'Spot on' },
  { sips: 5, base: 5, distance: 1.0, penalty: 1, total: 6 },
  { sips: 8, base: 8, distance: 4.0, penalty: 4, total: 12, note: 'Straf-shot!' },
]

interface Props {
  /** Compact mode for inline use on splash */
  compact?: boolean
}

export default function Rules({ compact = false }: Props) {
  return (
    <div className={`${compact ? 'space-y-5' : 'px-6 py-6 space-y-7'}`}>
      {/* Section 1 — The setup */}
      <section className="space-y-2">
        <p className="smallcaps-ink">Spillet</p>
        <ul className="font-sans text-ink-secondary text-base space-y-1.5 leading-snug list-none">
          <li>VI spillere, XII stops på én dag i Athen.</li>
          <li>Stop I er <em className="font-serif">prøverunde</em> — point tæller ikke.</li>
          <li>Hvert stop har én drink som <strong>alle</strong> skal tømme.</li>
        </ul>
      </section>

      {/* Section 2 — Core rule */}
      <section className="space-y-3">
        <p className="smallcaps-ink">Sådan scorer du</p>
        <p className="font-sans text-ink-secondary text-base leading-snug">
          Du vælger <strong>hemmeligt</strong> hvor mange slurke du tømmer drinken på.
          Når alle har valgt, afsløres tallene og gruppens gennemsnit beregnes.
        </p>

        <div className="bg-parchment-light border border-rule px-4 py-3">
          <p className="font-serif italic text-ink text-base text-center leading-snug">
            Din score = dit valgte tal + afstandsstraf fra gennemsnittet
          </p>
        </div>

        <div className="border border-rule">
          <div className="grid grid-cols-3 bg-parchment-dark/50 border-b border-rule">
            <p className="smallcaps px-3 py-2">Afstand</p>
            <p className="smallcaps px-3 py-2 text-center">Straf</p>
            <p className="smallcaps px-3 py-2 text-right">Note</p>
          </div>
          {PENALTY_TABLE.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 ${i < PENALTY_TABLE.length - 1 ? 'border-b border-rule' : ''}`}>
              <p className="font-sans text-ink text-base px-3 py-2">{row.range}</p>
              <p className="font-mono text-ink text-base font-semibold text-center px-3 py-2">{row.penalty}</p>
              <p className="font-serif italic text-ink-muted text-base text-right px-3 py-2">
                {row.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 — Example */}
      <section className="space-y-3">
        <p className="smallcaps-ink">Eksempel — gennemsnit IV.0</p>
        <div className="border border-rule">
          <div className="grid grid-cols-12 bg-parchment-dark/50 border-b border-rule">
            <p className="smallcaps col-span-2 px-2 py-2">Du</p>
            <p className="smallcaps col-span-2 px-2 py-2 text-center">Base</p>
            <p className="smallcaps col-span-2 px-2 py-2 text-center">±</p>
            <p className="smallcaps col-span-2 px-2 py-2 text-center">Straf</p>
            <p className="smallcaps col-span-2 px-2 py-2 text-center">Total</p>
            <p className="smallcaps col-span-2 px-2 py-2 text-right">Note</p>
          </div>
          {EXAMPLE.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-12 items-center ${i < EXAMPLE.length - 1 ? 'border-b border-rule' : ''} ${
                row.total === 4 ? 'bg-olive/5' : ''
              }`}
            >
              <p className="font-mono text-ink text-base font-semibold col-span-2 px-2 py-1.5">{row.sips}</p>
              <p className="font-mono text-ink-muted text-sm col-span-2 px-2 py-1.5 text-center">{row.base}</p>
              <p className="font-mono text-ink-muted text-sm col-span-2 px-2 py-1.5 text-center">{row.distance.toFixed(1)}</p>
              <p className="font-mono text-ink-muted text-sm col-span-2 px-2 py-1.5 text-center">+{row.penalty}</p>
              <p
                className={`font-mono text-base font-semibold col-span-2 px-2 py-1.5 text-center ${
                  row.total === 4 ? 'text-olive' : row.total >= 10 ? 'text-wine' : 'text-ink'
                }`}
              >
                {row.total}
              </p>
              <p className="font-serif italic text-ink-muted text-xs col-span-2 px-2 py-1.5 text-right leading-tight">
                {row.note ?? ''}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4 — Strategy */}
      <section className="space-y-2">
        <p className="smallcaps-ink">Strategien</p>
        <ul className="font-sans text-ink-secondary text-base space-y-1.5 leading-snug list-none">
          <li><strong>Færre slurke</strong> = lavere base, men risiko for at være langt fra gennemsnittet.</li>
          <li><strong>Flere slurke</strong> = sikrere, men højere base-score.</li>
          <li><strong>Sweet spot</strong>: gæt hvad de andre vælger, og gå <em>lige under</em>.</li>
        </ul>
      </section>

      {/* Section 5 — Honor system */}
      <section className="space-y-2">
        <p className="smallcaps-ink">Drak du den faktisk?</p>
        <p className="font-sans text-ink-secondary text-base leading-snug">
          Efter alle har drukket, vælger hver spiller én af to:
        </p>
        <ul className="font-sans text-ink-secondary text-base space-y-1 leading-snug list-none ml-1">
          <li><span className="font-mono text-olive font-semibold">✓</span> Klarede det — ingen straf</li>
          <li><span className="font-mono text-wine font-semibold">✗</span> Fejlede — <strong>+III strafpoint</strong></li>
        </ul>
        <p className="font-serif italic text-ink-muted text-base mt-1">
          Æressystem. Gruppen holder dig ansvarlig.
        </p>
      </section>

      {/* Section 6 — Penalty shots */}
      <section className="space-y-2">
        <p className="smallcaps-ink">Straf-shots (drikke, ikke point)</p>
        <p className="font-sans text-ink-secondary text-base leading-snug">
          Disse koster ikke point — kun smerte. Drikkes inden gruppen går videre.
        </p>
        <ul className="font-sans text-ink-secondary text-base space-y-1.5 leading-snug list-none">
          <li>
            <strong>Du committer max</strong> (fx VIII på øl, III på shot) — straf-shot.<br />
            <em className="font-serif text-ink-muted text-sm">
              Stop med bare at bunke. Max ændres per stop — så det er altid det største mulige tal.
            </em>
          </li>
          <li>
            <strong>Du committer I</strong> (kun ét lille nip) — straf-shot.<br />
            <em className="font-serif text-ink-muted text-sm">
              Stop med bare at nippe. Ingen low-effort taktik.
            </em>
          </li>
          <li>
            <strong>Du committer samme tal som forrige stop</strong> — straf-shot.<br />
            <em className="font-serif text-ink-muted text-sm">
              For at tvinge variation. Gælder fra Stop III.
            </em>
          </li>
        </ul>
        <p className="font-sans text-ink-secondary text-base leading-snug mt-3 pt-2 border-t border-rule">
          <strong>Reglerne stables.</strong> Hvis du committer I to gange i streg, får du <strong>2 straf-shots</strong> — én for at vælge I, én for samme tal som sidst. Tilsvarende hvis du committer max-tallet to gange i streg.
        </p>
      </section>

      {/* Section 7 — Late-game multiplier */}
      <section className="space-y-2">
        <p className="smallcaps-ink">Sluttiden tæller mere</p>
        <p className="font-sans text-ink-secondary text-base leading-snug">
          De sidste tre stop har en score-multiplikator. Senlige fejl koster mere — sjusk ikke når der er meget på spil.
        </p>
        <div className="border border-rule mt-2">
          <div className="grid grid-cols-3 bg-parchment-dark/50 border-b border-rule">
            <p className="smallcaps px-3 py-2">Stop</p>
            <p className="smallcaps px-3 py-2 text-center">Multiplier</p>
            <p className="smallcaps px-3 py-2 text-right">Eksempel</p>
          </div>
          {[
            { stop: 'X', mult: '× 1.5', example: 'Score 4 → 6' },
            { stop: 'XI', mult: '× 2.0', example: 'Score 4 → 8' },
            { stop: 'XII', mult: '× 2.5', example: 'Score 4 → 10' },
          ].map((row, i, arr) => (
            <div key={i} className={`grid grid-cols-3 ${i < arr.length - 1 ? 'border-b border-rule' : ''}`}>
              <p className="font-mono text-ink text-base font-semibold px-3 py-2">{row.stop}</p>
              <p className="font-mono text-gold text-base font-semibold text-center px-3 py-2">{row.mult}</p>
              <p className="font-serif italic text-ink-muted text-base text-right px-3 py-2">{row.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 8 — Winner */}
      <section className="space-y-2">
        <p className="smallcaps-ink">Vinderen</p>
        <p className="font-sans text-ink-secondary text-base leading-snug">
          Laveste totalscore efter Stop {toRoman(12)} vinder. Som rigtig golf — det handler om at score lavt.
        </p>
      </section>
    </div>
  )
}
