import CloseIcon from "./CloseIcon";

type Props = {
  onClick: (e: React.MouseEvent) => void;
  ariaLabel?: string;
  size?: "sm" | "lg"; // lg pour la vidéo
};

export default function LightboxClose({ onClick, ariaLabel = "Fermer", size = "sm" }: Props) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      className={`lb-close ${size === "lg" ? "lb-close--lg" : ""}`}
    >
      <CloseIcon className={`lb-close__icon`} />
      <span className="sr-only">{ariaLabel}</span>
    </button>
  );
}
