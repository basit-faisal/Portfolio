import { ICONS, type PixelIconName } from './pixelIconData';

export type { PixelIconName };

type PixelIconProps = {
  name: PixelIconName;
  size?: number;
  className?: string;
};

/** Renders a 16x16 pixel-art icon as crisp SVG rects. */
const PixelIcon = ({ name, size = 16, className = '' }: PixelIconProps) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    shapeRendering="crispEdges"
    aria-hidden="true"
    focusable="false"
    className={`shrink-0 ${className}`}
    style={{ imageRendering: 'pixelated' }}
  >
    {ICONS[name].map(([x, y, w, h, fill], index) => (
      <rect key={index} x={x} y={y} width={w} height={h} fill={fill} />
    ))}
  </svg>
);

export default PixelIcon;
