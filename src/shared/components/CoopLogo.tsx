import './CoopLogo.css'

interface CoopLogoProps {
  size?: number
}

export function CoopLogo({ size = 96 }: CoopLogoProps) {
  return (
    <div
      className="coop-logo"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
      >
        <rect width="96" height="96" rx="20" fill="#FFFFFF" />
        <path
          d="M48 18L72 32V58L48 72L24 58V32L48 18Z"
          stroke="#17324D"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M48 28L62 37V55L48 64L34 55V37L48 28Z"
          fill="#0F766E"
          fillOpacity="0.15"
        />
        <path
          d="M48 34L56 39V51L48 56L40 51V39L48 34Z"
          fill="#0F766E"
        />
        <circle cx="48" cy="45" r="4" fill="#17324D" />
      </svg>
    </div>
  )
}
