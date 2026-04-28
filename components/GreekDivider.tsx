interface Props {
  label?: string
  variant?: 'blue' | 'gold'
}

export default function GreekDivider({ label, variant = 'blue' }: Props) {
  const meanderClass = variant === 'gold' ? 'greek-meander-gold' : 'greek-meander'
  if (!label) {
    return <div className={`${meanderClass} my-3`} />
  }
  return (
    <div className="flex items-center gap-3 my-4">
      <div className={`${meanderClass} flex-1`} />
      <span className="font-sans text-text-muted text-base uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className={`${meanderClass} flex-1`} />
    </div>
  )
}
