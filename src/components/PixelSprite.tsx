import type { CSSProperties } from 'react';

type PixelSpriteProps = {
  pixels: readonly string[];
  palette: Record<string, string>;
  label: string;
  pixelSize?: number;
};

const EMPTY = '.';

function PixelSprite({
  pixels,
  palette,
  label,
  pixelSize = 10,
}: PixelSpriteProps) {
  const columns = pixels[0]?.length ?? 0;
  const flatPixels = pixels.flatMap((row) => row.split(''));

  return (
    <div
      aria-label={label}
      className="pixel-sprite"
      role="img"
      style={
        {
          gridTemplateColumns: `repeat(${columns}, ${pixelSize}px)`,
          gridAutoRows: `${pixelSize}px`,
        } as CSSProperties
      }
    >
      {flatPixels.map((key, index) => (
        <span
          className="pixel"
          key={`${label}-${index}`}
          style={{
            background:
              key === EMPTY ? 'transparent' : palette[key] ?? 'transparent',
            boxShadow:
              key === EMPTY ? 'none' : 'inset 0 0 0 1px rgba(10, 16, 28, 0.18)',
          }}
        />
      ))}
    </div>
  );
}

export default PixelSprite;
