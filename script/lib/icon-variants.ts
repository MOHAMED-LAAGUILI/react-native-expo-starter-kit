/// <reference types="node" />
/**
 * Every raster icon the app ships, derived from one vector source
 * (`assets/brand/icon.svg`) by `pnpm run icons` (script/render-icons.ts).
 * Ported from clocknet's tools/brand/render_icons.py, in Node with sharp.
 *
 * The source has two parts a variant can restyle with CSS: `.field` (the round
 * badge) and `.mark` (the chevron). Geometry is never restated here, only
 * hidden, recoloured, scaled or padded — so no variant can drift from the
 * source.
 */

export type IconVariant = {
  /** Output path, relative to the repository root. */
  file: string
  /** Square size in px. */
  size: number
  /** What uses it (shown by --list and in docs). */
  usedBy: string
  /** Painted behind the badge; omitted = transparent. */
  background?: string
  /** Badge diameter as a share of `size` (1 = edge to edge). */
  scale: number
  /** Extra CSS for the source's `.field` / `.mark`. */
  css?: string
  /** Crop to the mark and fit it with this padding (notification icon). */
  trimToMark?: { padding: number }
  /** Must the output have no transparent pixel (iOS icon)? */
  opaque?: boolean
}

export const ICON_SOURCE = 'assets/brand/icon.svg'

// Android adaptive icons are 108dp with a 66dp circle every launcher mask
// keeps visible: fit the round badge inside that circle.
const ADAPTIVE_SAFE = 66 / 108

export const ICON_VARIANTS: IconVariant[] = [
  {
    file: 'assets/images/icon.png',
    size: 1024,
    usedBy: 'app icon (iOS, Android legacy) — app.config.ts `icon`',
    // The badge's field colour bled to the corners: iOS rounds the corners itself.
    background: '#000000',
    scale: 1,
    css: '.field{display:none}',
    opaque: true,
  },
  {
    file: 'assets/images/adaptive-icon.png',
    size: 1024,
    usedBy: 'Android adaptive icon foreground — android.adaptiveIcon.foregroundImage',
    scale: ADAPTIVE_SAFE,
  },
  {
    file: 'assets/images/splash-icon.png',
    size: 1024,
    usedBy: 'splash screen, light — expo-splash-screen `image`',
    scale: 0.8,
  },
  {
    file: 'assets/images/splash-icon-dark.png',
    size: 1024,
    usedBy: 'splash screen, dark — expo-splash-screen `dark.image`',
    scale: 0.8,
    css: '.field{fill:#ffffff;stroke:#a3a3a3;stroke-width:8px}.mark{fill:#000000;stroke:#000000}',
  },
  {
    file: 'assets/images/favicon.png',
    size: 48,
    usedBy: 'web favicon — web.favicon',
    scale: 1,
  },
  {
    file: 'assets/images/notification-icon.png',
    size: 96,
    usedBy: 'Android notification icon (alpha only) — expo-notifications `icon`',
    scale: 1,
    css: '.field{display:none}.mark{fill:#ffffff;stroke:#ffffff}',
    trimToMark: { padding: 8 },
  },
]

/** The source's inner markup (between the outer <svg> tags), comments removed. */
export function sourceBody(svg: string): string {
  const open = svg.indexOf('>', svg.indexOf('<svg'))
  const close = svg.lastIndexOf('</svg>')
  if (open < 0 || close < 0)
    throw new Error('icon source is not an <svg> document')
  return svg.slice(open + 1, close).replace(/<!--[\s\S]*?-->/g, '').trim()
}

/** The SVG that renders one variant at its final size. */
export function variantSvg(source: string, variant: IconVariant): string {
  const { size, scale } = variant
  const inner = Math.round(size * scale)
  const offset = Math.round((size - inner) / 2)
  const background = variant.background ? `<rect width="${size}" height="${size}" fill="${variant.background}"/>` : ''
  const style = variant.css ? `<style>${variant.css}</style>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${style}${background}`
    + `<svg x="${offset}" y="${offset}" width="${inner}" height="${inner}" viewBox="0 0 1024 1024">${sourceBody(source)}</svg></svg>`
}
