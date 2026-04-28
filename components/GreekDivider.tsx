export default function GreekDivider({ label }: { label?: string }) {
  return (
    <div className="greek-divider">
      {label && (
        <span className="font-sans text-text-muted text-base uppercase tracking-widest whitespace-nowrap px-2">
          {label}
        </span>
      )}
    </div>
  )
}
