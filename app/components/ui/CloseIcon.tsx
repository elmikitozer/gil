export default function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      {/* Contour blanc (dessous) */}
      <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Trait principal (au-dessus) */}
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
