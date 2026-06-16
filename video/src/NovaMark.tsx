// Novacademy brand mark — four-point "nova" star. Mirrors
// app-next/components/NovaMark.tsx. Inherits color via currentColor.
export function NovaMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 1.5C12.9 8 16 11.1 22.5 12C16 12.9 12.9 16 12 22.5C11.1 16 8 12.9 1.5 12C8 11.1 11.1 8 12 1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
