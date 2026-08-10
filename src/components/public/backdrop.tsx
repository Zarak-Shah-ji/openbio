import {
  backdropDimStyle,
  backdropImageStyle,
  type Effect,
  type Theme,
} from "@/lib/theme";

/** Number of DOM nodes each effect needs; keyframes live in globals.css. */
const EFFECT_PARTS: Record<Effect, number> = {
  none: 0,
  aurora: 3,
  mesh: 0,
  grid: 1,
  orbs: 6,
  scanlines: 0,
  starfield: 3,
};

/**
 * The layer stack behind a bio page: photo → dim scrim → animated
 * atmosphere → grain → vignette.
 *
 * Rendered identically by the public page and the dashboard preview, so what
 * the editor shows is what visitors get. Must be placed inside an element
 * with `.ob-page` (position + overflow) and paired with `.ob-content`.
 */
export function Backdrop({ theme }: { theme: Theme }) {
  const showImage = theme.background === "image" && theme.bgImageUrl;
  const parts = EFFECT_PARTS[theme.effect];

  return (
    <div className="ob-backdrop" aria-hidden="true">
      {showImage && (
        <>
          <div
            className="ob-layer ob-bg-image"
            style={backdropImageStyle(theme)}
          />
          {theme.bgDim > 0 && (
            <div className="ob-layer" style={backdropDimStyle(theme)} />
          )}
        </>
      )}

      {theme.effect !== "none" && (
        <div className={`ob-layer ob-fx-${theme.effect}`}>
          {Array.from({ length: parts }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      )}

      {theme.grain && <div className="ob-layer ob-grain" />}
      {theme.vignette && <div className="ob-layer ob-vignette" />}
    </div>
  );
}
