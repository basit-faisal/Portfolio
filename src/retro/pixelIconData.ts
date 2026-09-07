/**
 * Icon geometry for {@link PixelIcon}, kept free of JSX so build tooling and
 * the preview renderer in scripts/ can both consume it.
 *
 * Every icon is a 16x16 grid of rects using the classic 16-colour VGA palette.
 * Generic capabilities get a period-correct metaphor rather than a logo. Named
 * products are drawn as simplified pixel renditions of their mark, redrawn on
 * this grid and palette so they sit in the Win95 look rather than importing
 * brand artwork.
 */

export const PALETTE = {
  black: '#000000',
  white: '#ffffff',
  silver: '#c0c0c0',
  gray: '#808080',
  navy: '#000080',
  teal: '#008080',
  cyan: '#00ffff',
  green: '#008000',
  lime: '#00ff00',
  olive: '#808000',
  yellow: '#ffff00',
  maroon: '#800000',
  red: '#ff0000',
  purple: '#800080',
  magenta: '#ff00ff',
  // Outside the strict 16, but a stock VGA 256 entry. Needed because no
  // 16-colour slot is close to the orange several of these marks rely on.
  orange: '#ff8000'
} as const;

const P = PALETTE;

export type Rect = readonly [x: number, y: number, w: number, h: number, fill: string];

/** A filled rect with a 1px black outline, the standard Win95 icon treatment. */
const box = (x: number, y: number, w: number, h: number, fill: string): Rect[] => [
  [x, y, w, h, P.black],
  [x + 1, y + 1, w - 2, h - 2, fill]
];

export const ICONS = {
  // Rack-mounted server: FastAPI
  server: [
    ...box(2, 2, 12, 5, P.silver),
    ...box(2, 9, 12, 5, P.silver),
    [4, 4, 2, 1, P.lime],
    [4, 11, 2, 1, P.lime],
    [8, 4, 4, 1, P.gray],
    [8, 11, 4, 1, P.gray]
  ],

  // Distributed compute nodes: PySpark
  cluster: [
    [4, 7, 3, 2, P.gray],
    [9, 7, 3, 2, P.gray],
    [7, 4, 2, 3, P.gray],
    [7, 9, 2, 3, P.gray],
    ...box(1, 1, 4, 4, P.olive),
    ...box(11, 1, 4, 4, P.olive),
    ...box(1, 11, 4, 4, P.olive),
    ...box(11, 11, 4, 4, P.olive),
    ...box(6, 6, 4, 4, P.yellow)
  ],

  // Directed acyclic graph: Airflow. Nodes leave gaps so the links show.
  flow: [
    [4, 7, 2, 2, P.gray],
    [10, 7, 2, 2, P.gray],
    ...box(0, 5, 4, 6, P.teal),
    ...box(6, 5, 4, 6, P.teal),
    ...box(12, 5, 4, 6, P.teal)
  ],

  // Monitor showing a metrics line: Grafana / Prometheus
  gauge: [
    ...box(1, 2, 14, 10, P.silver),
    [3, 4, 10, 6, P.navy],
    [3, 8, 1, 1, P.lime],
    [4, 7, 1, 1, P.lime],
    [5, 6, 1, 1, P.lime],
    [6, 7, 1, 1, P.lime],
    [7, 5, 1, 1, P.lime],
    [8, 6, 1, 1, P.lime],
    [9, 5, 1, 1, P.lime],
    [10, 4, 1, 1, P.lime],
    [11, 5, 1, 1, P.lime],
    [6, 12, 4, 1, P.gray],
    [4, 13, 8, 1, P.gray]
  ],

  // Neural network: Machine Learning
  network: [
    [4, 3, 4, 1, P.gray],
    [4, 8, 4, 1, P.gray],
    [4, 12, 4, 1, P.gray],
    [10, 5, 3, 1, P.gray],
    [10, 8, 3, 1, P.gray],
    [10, 10, 3, 1, P.gray],
    ...box(1, 1, 4, 4, P.purple),
    ...box(1, 6, 4, 4, P.purple),
    ...box(1, 10, 4, 4, P.purple),
    ...box(7, 3, 4, 4, P.magenta),
    ...box(7, 9, 4, 4, P.magenta),
    ...box(12, 6, 4, 4, P.purple)
  ],

  // Stacked layers: Deep Learning
  layers: [
    ...box(2, 2, 12, 4, P.purple),
    ...box(2, 6, 12, 4, P.magenta),
    ...box(2, 10, 12, 4, P.purple)
  ],

  // Speech bubble: LLMs
  chat: [
    ...box(1, 2, 14, 9, P.white),
    [3, 11, 3, 1, P.black],
    [3, 12, 2, 1, P.black],
    [4, 11, 1, 1, P.white],
    [4, 6, 2, 2, P.navy],
    [7, 6, 2, 2, P.navy],
    [10, 6, 2, 2, P.navy]
  ],

  // Text document: NLP
  document: [
    ...box(3, 1, 10, 14, P.white),
    [5, 4, 6, 1, P.gray],
    [5, 6, 6, 1, P.gray],
    [5, 8, 6, 1, P.gray],
    [5, 10, 4, 1, P.gray]
  ],

  // Rising line chart: Quantitative Analysis
  chartLine: [
    [2, 2, 1, 12, P.gray],
    [2, 13, 12, 1, P.gray],
    [4, 10, 2, 1, P.red],
    [6, 8, 2, 1, P.red],
    [8, 9, 2, 1, P.red],
    [10, 6, 2, 1, P.red],
    [12, 3, 2, 1, P.red],
    [5, 8, 1, 2, P.red],
    [7, 8, 1, 1, P.red],
    [9, 6, 1, 3, P.red],
    [11, 3, 1, 3, P.red]
  ],

  // Shield: Risk Management. Black silhouette first, then a maroon inset, so
  // the taper keeps a clean 1px outline instead of stacking box borders.
  shield: [
    [3, 1, 10, 9, P.black],
    [4, 10, 8, 1, P.black],
    [5, 11, 6, 1, P.black],
    [6, 12, 4, 1, P.black],
    [7, 13, 2, 1, P.black],
    [4, 2, 8, 8, P.maroon],
    [5, 10, 6, 1, P.maroon],
    [6, 11, 4, 1, P.maroon],
    [7, 12, 2, 1, P.maroon],
    [7, 3, 2, 6, P.white],
    [5, 5, 6, 2, P.white]
  ],

  // Pie chart: Portfolio Theory
  pie: [
    [5, 1, 6, 1, P.black],
    [3, 2, 10, 1, P.black],
    [2, 3, 12, 1, P.black],
    [1, 4, 14, 8, P.black],
    [2, 12, 12, 1, P.black],
    [3, 13, 10, 1, P.black],
    [5, 14, 6, 1, P.black],
    [5, 2, 6, 1, P.olive],
    [3, 3, 10, 1, P.olive],
    [2, 4, 12, 8, P.olive],
    [3, 12, 10, 1, P.olive],
    [5, 13, 6, 1, P.olive],
    [8, 3, 5, 1, P.yellow],
    [8, 4, 6, 4, P.yellow]
  ],

  // Calculator: Financial Modeling
  calculator: [
    ...box(3, 1, 10, 14, P.silver),
    [5, 3, 6, 2, P.black],
    [6, 3, 4, 1, P.lime],
    [5, 7, 2, 2, P.gray],
    [8, 7, 2, 2, P.gray],
    [11, 7, 1, 2, P.gray],
    [5, 10, 2, 2, P.gray],
    [8, 10, 2, 2, P.gray],
    [11, 10, 1, 2, P.navy]
  ],

  // Stacked database platters: SQL
  database: [
    ...box(1, 2, 14, 4, P.teal),
    ...box(1, 6, 14, 4, P.teal),
    ...box(1, 10, 14, 4, P.teal),
    [3, 3, 4, 1, P.cyan],
    [3, 7, 4, 1, P.cyan],
    [3, 11, 4, 1, P.cyan]
  ],

  // Six-pointed flake: Snowflake. One vertical arm plus two diagonals gives
  // the six points. Teal rather than the brand's pale blue, which would wash
  // out against the white window background.
  snowflake: [
    [7, 2, 2, 12, P.teal],
    [2, 2, 2, 2, P.teal],
    [4, 4, 2, 2, P.teal],
    [6, 6, 2, 2, P.teal],
    [8, 8, 2, 2, P.teal],
    [10, 10, 2, 2, P.teal],
    [12, 12, 2, 2, P.teal],
    [12, 2, 2, 2, P.teal],
    [10, 4, 2, 2, P.teal],
    [8, 6, 2, 2, P.teal],
    [6, 8, 2, 2, P.teal],
    [4, 10, 2, 2, P.teal],
    [2, 12, 2, 2, P.teal],
    [6, 6, 4, 4, P.cyan],
    [7, 7, 2, 2, P.white]
  ],

  // Orange disc with the slanted bars: dbt. Silhouette-then-fill keeps the
  // circle's edge clean, the same trick the pie and shield icons use.
  dbt: [
    [5, 1, 6, 1, P.black],
    [3, 2, 10, 1, P.black],
    [2, 3, 12, 1, P.black],
    [1, 4, 14, 8, P.black],
    [2, 12, 12, 1, P.black],
    [3, 13, 10, 1, P.black],
    [5, 14, 6, 1, P.black],
    [5, 2, 6, 1, P.orange],
    [3, 3, 10, 1, P.orange],
    [2, 4, 12, 8, P.orange],
    [3, 12, 10, 1, P.orange],
    [5, 13, 6, 1, P.orange],
    // Narrow enough to stay clear of the curve, else the disc reads as a box.
    [3, 4, 6, 2, P.white],
    [5, 7, 6, 2, P.white],
    [7, 10, 6, 2, P.white]
  ],

  // Hexagon: Hex. Pointy top and bottom over long vertical sides. Stepping the
  // diagonals two pixels per row keeps the corners sharp; a one-pixel step
  // spreads the taper over too many rows and the shape reads as an oval.
  hex: [
    [7, 1, 2, 1, P.black],
    [5, 2, 6, 1, P.black],
    [3, 3, 10, 1, P.black],
    [2, 4, 12, 8, P.black],
    [3, 12, 10, 1, P.black],
    [5, 13, 6, 1, P.black],
    [7, 14, 2, 1, P.black],
    [7, 2, 2, 1, P.purple],
    [5, 3, 6, 1, P.purple],
    [3, 4, 10, 8, P.purple],
    [5, 12, 6, 1, P.purple],
    [7, 13, 2, 1, P.purple],
    [6, 6, 4, 1, P.magenta],
    [5, 7, 6, 2, P.magenta],
    [6, 9, 4, 1, P.magenta]
  ],

  // Crossed bars: Tableau. A tall orange vertical and wide navy horizontal
  // with two shorter verticals flanking, which is the essence of the mark.
  tableau: [
    [7, 1, 2, 14, P.orange],
    [1, 7, 14, 2, P.navy],
    [3, 4, 2, 8, P.teal],
    [11, 4, 2, 8, P.teal]
  ],

  // Ascending amber bars: Power BI. Bars alone, with no drawn axis.
  powerBi: [
    ...box(1, 9, 5, 6, P.yellow),
    [4, 10, 1, 4, P.olive],
    ...box(6, 5, 5, 10, P.yellow),
    [9, 6, 1, 8, P.olive],
    ...box(11, 1, 5, 14, P.yellow),
    [14, 2, 1, 12, P.olive]
  ],

  // Four-blade pinwheel: Looker. Each blade butts against the next around the
  // centre; detached blades just read as four loose squares. The box outlines
  // meeting in the middle are what separate one blade from the next.
  looker: [
    ...box(1, 3, 7, 5, P.cyan),
    ...box(8, 1, 5, 7, P.navy),
    ...box(8, 8, 7, 5, P.teal),
    ...box(3, 8, 5, 7, P.purple)
  ]
} satisfies Record<string, Rect[]>;

export type PixelIconName = keyof typeof ICONS;
