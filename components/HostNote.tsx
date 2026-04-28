interface Props {
  text: string | null | undefined
  /** Only renders if currentPlayerName === 'Lukas' */
  currentPlayerName: string
}

export default function HostNote({ text, currentPlayerName }: Props) {
  if (!text) return null
  if (currentPlayerName !== 'Lukas') return null

  return (
    <div className="mt-3 border-l-2 border-gold pl-4 py-1 bg-gold/5 -ml-1 pr-3">
      <p className="smallcaps-gold mb-1.5">Til Lukas — værts-noter</p>
      <p className="font-serif italic text-ink-secondary text-sm leading-relaxed whitespace-pre-line">
        {text}
      </p>
    </div>
  )
}
