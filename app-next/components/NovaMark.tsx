// Novacademy brand mark — a four-point "nova" star. Inherits color via
// currentColor (containers/.brand-mark tint it with --accent).
export default function NovaMark({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 1.5C12.9 8 16 11.1 22.5 12C16 12.9 12.9 16 12 22.5C11.1 16 8 12.9 1.5 12C8 11.1 11.1 8 12 1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
