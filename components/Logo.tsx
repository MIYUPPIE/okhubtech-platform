import Image from "next/image";
import Link from "next/link";

import { LOGO, LOGO_ALT } from "@/lib/media";

type LogoVariant = "wordmark" | "mark";

type LogoProps = {
  readonly variant?: LogoVariant;
  /** Rendered height in px. Width follows the asset's real aspect ratio. */
  readonly height?: number;
  readonly priority?: boolean;
  readonly className?: string;
};

const SOURCES = {
  wordmark: { light: LOGO.light, dark: LOGO.dark },
  mark: { light: LOGO.markLight, dark: LOGO.markDark },
} as const satisfies Record<LogoVariant, { light: typeof LOGO.light; dark: typeof LOGO.dark }>;

/**
 * The wordmark is black ink plus gold, so it disappears on the dark theme. Both
 * variants are rendered and swapped with CSS rather than by reading the theme in
 * JS: next-themes resolves after hydration, and a JS swap would flash the wrong
 * logo on first paint.
 */
export function Logo({
  variant = "wordmark",
  height = 30,
  priority = false,
  className = "",
}: LogoProps) {
  const { light, dark } = SOURCES[variant];
  const width = Math.round((light.width / light.height) * height);

  return (
    <span className={`inline-flex items-center ${className}`} style={{ height }}>
      <Image
        src={light.src}
        alt={LOGO_ALT}
        width={width}
        height={height}
        priority={priority}
        className="block h-full w-auto dark:hidden"
      />
      <Image
        src={dark.src}
        alt=""
        aria-hidden
        width={width}
        height={height}
        priority={priority}
        className="hidden h-full w-auto dark:block"
      />
    </span>
  );
}

/** The logo as a link home. Used in the header and footer. */
export function LogoLink({
  variant = "wordmark",
  height = 30,
  priority = false,
  className = "",
}: LogoProps) {
  return (
    <Link href="/" aria-label={`${LOGO_ALT} home`} className={className}>
      <Logo variant={variant} height={height} priority={priority} />
    </Link>
  );
}

export default Logo;
