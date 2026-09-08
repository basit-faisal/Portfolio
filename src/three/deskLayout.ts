/**
 * The desk the computer stands on, and the clutter on top of it.
 *
 * Kept free of JSX for the same reason pixelIconData is: a preview script can
 * build the identical geometry without a WebGL context, so the layout is
 * checked by rendering it rather than by guessing at coordinates.
 *
 * World units, with the desk's top surface at y = 0 — the plane the .glb
 * already stands on. Every prop is modelled around its own origin and dropped
 * into place with `position` / `rotationY`, so nudging one across the desk
 * never means re-deriving the parts inside it.
 *
 * Scale: the model's glass is 0.519 units across and a 15" CRT of this vintage
 * shows ~28cm, so one unit is ~0.54m. Sizes below are real measurements
 * converted at that rate — a 3.5" floppy is 0.165, a mug is 0.135 tall.
 *
 * Placement was fitted around the hardware's measured footprint, so nothing
 * intersects it:
 *   speakers  x +-0.519..0.789   z -0.095..0.149
 *   keyboard  x -0.437..0.451    z  0.324..0.667
 *   mouse     x  0.597..0.802    z  0.344..0.632
 *   case      x -0.337..0.351    z -0.285..0.309
 */

export type Shape =
  | { kind: 'box'; size: [number, number, number] }
  /** `top` of 0 makes a cone, pointed at its +Y end. */
  | { kind: 'cylinder'; top: number; bottom: number; height: number; sides?: number }
  | { kind: 'sphere'; radius: number; sides?: number }
  | { kind: 'ring'; radius: number; tube: number; sides?: number };

export type Part = {
  shape: Shape;
  position: [number, number, number];
  /** Euler XYZ, radians. */
  rotation?: [number, number, number];
  /** Applied before the rotation, which is how the ellipsoids are squashed. */
  scale?: [number, number, number];
  colour: string;
  roughness?: number;
  metalness?: number;
  /** Only the lamp bulb sets these, so it reads as the thing lighting the desk. */
  emissive?: string;
  emissiveIntensity?: number;
};

export type Prop = {
  id: string;
  /** Where the prop stands on the desk top. */
  position: [number, number, number];
  rotationY?: number;
  parts: Part[];
};

// --- palette -----------------------------------------------------------------

const C = {
  wood: '#5c4231',
  woodEdge: '#3b291d',
  floor: '#171319',
  metalDark: '#32353d',
  metalMid: '#4a4e57',
  /** Lighter than the arm, so the shade still reads as a shape when unlit. */
  lampShade: '#454a54',
  metalLight: '#9aa0a8',
  black: '#1a1b1f',
  paper: '#e9e3d2',
  paperEdge: '#cfc7b2',
  ceramic: '#e6e2d8',
  navy: '#1d2f6b',
  coffee: '#2c1a10',
  duck: '#ffcf1f',
  beak: '#ff8c1a',
  terracotta: '#a85c38',
  terracottaDark: '#8c4a2c',
  soil: '#241811',
  leaf: '#3d7a3a',
  leafDark: '#2e6130',
  bulb: '#ffe6b8',
  stickyYellow: '#f2d24b',
  stickyPink: '#ee8fae',
  stickyCyan: '#8fd3d8'
} as const;

// --- helpers -----------------------------------------------------------------

/**
 * Euler for a shape leaning `tilt` radians off vertical, in the compass
 * direction `azimuth`. With the default XYZ order this sends the shape's own
 * +Y axis to `leanDirection(tilt, azimuth)`.
 */
const leaning = (tilt: number, azimuth: number): [number, number, number] => [0, azimuth, tilt];

const leanDirection = (tilt: number, azimuth: number): [number, number, number] => [
  -Math.sin(tilt) * Math.cos(azimuth),
  Math.cos(tilt),
  Math.sin(tilt) * Math.sin(azimuth)
];

/** Centre of a shape of `length` rooted at `base` and leaning as above. */
const leaningCentre = (
  base: [number, number, number],
  tilt: number,
  azimuth: number,
  length: number
): [number, number, number] => {
  const d = leanDirection(tilt, azimuth);
  return [
    base[0] + (d[0] * length) / 2,
    base[1] + (d[1] * length) / 2,
    base[2] + (d[2] * length) / 2
  ];
};

/** Lays a cylinder flat on the desk, pointing along `azimuth`. */
const lying = (azimuth: number): [number, number, number] => [0, azimuth, Math.PI / 2];

/**
 * A strut between two points in the prop's local x/y plane. Keeping the
 * lamp's arms planar means a single Z rotation aims each one, and the prop as
 * a whole is then swung to face the monitor with `rotationY`.
 */
const strut = (
  from: [number, number],
  to: [number, number],
  radius: number,
  colour: string
): Part => {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  return {
    shape: { kind: 'cylinder', top: radius, bottom: radius, height: Math.hypot(dx, dy), sides: 8 },
    position: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0],
    rotation: [0, 0, -Math.atan2(dx, dy)],
    colour,
    roughness: 0.5,
    metalness: 0.35
  };
};

// --- the desk ----------------------------------------------------------------

export const DESK = {
  width: 3.4,
  depth: 1.6,
  /** Nudged forward of the model so the keyboard is not at the very edge. */
  centreZ: 0.16,
  topThickness: 0.075,
  /** Drop from the top surface to the floor. */
  height: 1.35,
  legThickness: 0.11,
  legInset: 0.16
} as const;

export const FLOOR_Y = -DESK.height;

const legX = DESK.width / 2 - DESK.legInset - DESK.legThickness / 2;
const legZ = DESK.depth / 2 - DESK.legInset - DESK.legThickness / 2;
const legHeight = DESK.height - DESK.topThickness;
const legCentreY = -(DESK.topThickness + legHeight / 2);

export const DESK_PARTS: Part[] = [
  {
    shape: { kind: 'box', size: [DESK.width, DESK.topThickness, DESK.depth] },
    position: [0, -DESK.topThickness / 2, DESK.centreZ],
    colour: C.wood,
    roughness: 0.68
  },
  // Laminate edge banding: a hair proud of the top so it reads as a dark lip
  // around the desk rather than a painted-on stripe.
  {
    shape: { kind: 'box', size: [DESK.width + 0.012, 0.022, DESK.depth + 0.012] },
    position: [0, -0.05, DESK.centreZ],
    colour: C.woodEdge,
    roughness: 0.6
  },
  ...([
    [-legX, DESK.centreZ - legZ],
    [legX, DESK.centreZ - legZ],
    [-legX, DESK.centreZ + legZ],
    [legX, DESK.centreZ + legZ]
  ] as const).map(
    ([x, z]): Part => ({
      shape: { kind: 'box', size: [DESK.legThickness, legHeight, DESK.legThickness] },
      position: [x, legCentreY, z],
      colour: C.metalDark,
      roughness: 0.55,
      metalness: 0.3
    })
  ),
  // Modesty panel across the back, which is what stops the underside reading
  // as four sticks in the pulled-back portrait view.
  {
    shape: { kind: 'box', size: [legX * 2, 0.34, 0.04] },
    position: [0, -0.28, DESK.centreZ - legZ],
    colour: C.woodEdge,
    roughness: 0.7
  }
];

// --- props -------------------------------------------------------------------

/** Architect lamp. Arms live in the local x/y plane and reach toward +X. */
const lamp = (): Prop => {
  const elbow: [number, number] = [0.22, 0.47];
  const head: [number, number] = [0.54, 0.605];

  // The shade points down and forward, out over the desk.
  const aim = Math.hypot(0.52, -0.855);
  const dir: [number, number] = [0.52 / aim, -0.855 / aim];
  const along = (distance: number): [number, number, number] => [
    head[0] + dir[0] * distance,
    head[1] + dir[1] * distance,
    0
  ];

  return {
    id: 'lamp',
    // Swung out to the back-left corner: reaching any further across the desk
    // put the shade in front of the monitor, where it read as a dark blob on
    // the one bright thing in the scene.
    position: [-1.4, 0, -0.42],
    rotationY: -0.62,
    parts: [
      {
        shape: { kind: 'cylinder', top: 0.15, bottom: 0.165, height: 0.026, sides: 14 },
        position: [0, 0.013, 0],
        colour: C.metalDark,
        roughness: 0.5,
        metalness: 0.4
      },
      {
        shape: { kind: 'cylinder', top: 0.055, bottom: 0.075, height: 0.05, sides: 10 },
        position: [0, 0.048, 0],
        colour: C.metalMid,
        roughness: 0.45,
        metalness: 0.45
      },
      strut([0, 0.06], elbow, 0.017, C.metalMid),
      {
        shape: { kind: 'sphere', radius: 0.033, sides: 10 },
        position: [elbow[0], elbow[1], 0],
        colour: C.metalDark,
        roughness: 0.45,
        metalness: 0.45
      },
      strut(elbow, head, 0.016, C.metalMid),
      {
        shape: { kind: 'sphere', radius: 0.03, sides: 10 },
        position: [head[0], head[1], 0],
        colour: C.metalDark,
        roughness: 0.45,
        metalness: 0.45
      },
      {
        // Wide end at +Y, which the rotation sends down-forward.
        shape: { kind: 'cylinder', top: 0.135, bottom: 0.05, height: 0.16, sides: 12 },
        position: along(0.08),
        rotation: [0, 0, -Math.atan2(dir[0], dir[1])],
        colour: C.lampShade,
        roughness: 0.4,
        metalness: 0.5
      },
      {
        shape: { kind: 'sphere', radius: 0.05, sides: 8 },
        position: along(0.135),
        colour: C.bulb,
        emissive: C.bulb,
        emissiveIntensity: 2.4,
        roughness: 1
      }
    ]
  };
};

/** Pen pot, leaning a handful of pens at different angles. */
const penPot = (): Prop => {
  const pens: Array<[number, number, string]> = [
    [0.1, 0.4, '#1b2a4a'],
    [0.16, 2.3, '#7d2b2b'],
    [0.07, 3.9, '#22523a'],
    [0.19, 5.3, C.metalLight]
  ];

  return {
    id: 'pen-pot',
    position: [-0.95, 0, -0.48],
    rotationY: 0.2,
    parts: [
      {
        shape: { kind: 'cylinder', top: 0.066, bottom: 0.056, height: 0.135, sides: 12 },
        position: [0, 0.0675, 0],
        colour: C.metalDark,
        roughness: 0.6
      },
      {
        shape: { kind: 'cylinder', top: 0.058, bottom: 0.058, height: 0.006, sides: 12 },
        position: [0, 0.132, 0],
        colour: C.black,
        roughness: 0.9
      },
      ...pens.map(([tilt, azimuth, colour]): Part => {
        const length = 0.26;
        return {
          shape: { kind: 'cylinder', top: 0.01, bottom: 0.011, height: length, sides: 6 },
          position: leaningCentre([0, 0.06, 0], tilt, azimuth, length),
          rotation: leaning(tilt, azimuth),
          colour,
          roughness: 0.5
        };
      })
    ]
  };
};

/**
 * Stack of manuals. Each book is a coloured board plus a slightly longer,
 * thinner cream block, so the pages show past the cover on the open edges
 * while the spine and boards stay coloured.
 */
const books = (): Prop => {
  const spines = [
    { colour: '#7d2b2b', lift: 0.025, turn: 0.11 },
    { colour: '#22406e', lift: 0.077, turn: -0.09 },
    { colour: '#6d5a24', lift: 0.126, turn: 0.05 }
  ];

  return {
    id: 'books',
    position: [-1.25, 0, 0.28],
    rotationY: 0.22,
    parts: spines.flatMap(({ colour, lift, turn }): Part[] => [
      {
        shape: { kind: 'box', size: [0.34, 0.048, 0.24] },
        position: [0, lift, 0],
        rotation: [0, turn, 0],
        colour,
        roughness: 0.8
      },
      {
        shape: { kind: 'box', size: [0.332, 0.03, 0.248] },
        position: [0.004, lift, 0],
        rotation: [0, turn, 0],
        colour: C.paper,
        roughness: 0.95
      }
    ])
  };
};

/** Spiral notepad with a pen laid across it. */
const notepad = (): Prop => {
  const penAzimuth = 0.9;
  const penCentre: [number, number, number] = [0.02, 0.036, 0.03];
  const penDir = [-Math.cos(penAzimuth), 0, Math.sin(penAzimuth)];

  return {
    id: 'notepad',
    position: [-0.92, 0, 0.72],
    rotationY: -0.28,
    parts: [
      {
        shape: { kind: 'box', size: [0.3, 0.022, 0.34] },
        position: [0, 0.011, 0],
        colour: C.paperEdge,
        roughness: 0.95
      },
      {
        shape: { kind: 'box', size: [0.292, 0.006, 0.332] },
        position: [0, 0.025, 0.002],
        colour: C.paper,
        roughness: 0.95
      },
      // Wire spiral along the top edge.
      ...[-0.105, -0.035, 0.035, 0.105].map(
        (x): Part => ({
          shape: { kind: 'ring', radius: 0.016, tube: 0.004, sides: 5 },
          position: [x, 0.026, -0.163],
          rotation: [0, Math.PI / 2, 0],
          colour: C.metalLight,
          roughness: 0.35,
          metalness: 0.6
        })
      ),
      {
        shape: { kind: 'cylinder', top: 0.01, bottom: 0.011, height: 0.24, sides: 6 },
        position: penCentre,
        rotation: lying(penAzimuth),
        colour: '#1b2a4a',
        roughness: 0.5
      },
      {
        shape: { kind: 'cylinder', top: 0.0118, bottom: 0.0118, height: 0.026, sides: 6 },
        position: [
          penCentre[0] + penDir[0] * 0.075,
          penCentre[1],
          penCentre[2] + penDir[2] * 0.075
        ],
        rotation: lying(penAzimuth),
        colour: C.metalLight,
        roughness: 0.35,
        metalness: 0.6
      }
    ]
  };
};

/** Loose stack of 3.5" floppies, top one labelled. */
const floppies = (): Prop => {
  const disks = [
    { colour: '#23252b', lift: 0.007, turn: 0.1 },
    { colour: '#1e3f7a', lift: 0.021, turn: -0.15 },
    { colour: '#6e1f1f', lift: 0.035, turn: 0.06 }
  ];
  const top = disks[disks.length - 1];

  return {
    id: 'floppies',
    position: [-0.35, 0, 0.8],
    rotationY: 0.18,
    parts: [
      ...disks.map(
        ({ colour, lift, turn }): Part => ({
          shape: { kind: 'box', size: [0.165, 0.014, 0.165] },
          position: [0, lift, 0],
          rotation: [0, turn, 0],
          colour,
          roughness: 0.75
        })
      ),
      {
        shape: { kind: 'box', size: [0.062, 0.003, 0.05] },
        position: [0, top.lift + 0.008, -0.056],
        rotation: [0, top.turn, 0],
        colour: C.metalLight,
        roughness: 0.35,
        metalness: 0.65
      },
      {
        shape: { kind: 'box', size: [0.115, 0.003, 0.06] },
        position: [0, top.lift + 0.008, 0.032],
        rotation: [0, top.turn, 0],
        colour: C.paper,
        roughness: 0.95
      }
    ]
  };
};

/** Mousepad, sized to sit under the model's own mouse. */
const mousepad = (): Prop => ({
  id: 'mousepad',
  position: [0.7, 0, 0.49],
  rotationY: 0.05,
  parts: [
    {
      shape: { kind: 'box', size: [0.44, 0.008, 0.4] },
      position: [0, 0.004, 0],
      colour: '#242832',
      roughness: 0.95
    },
    {
      shape: { kind: 'box', size: [0.44, 0.009, 0.03] },
      position: [0, 0.0045, -0.17],
      colour: '#1d5257',
      roughness: 0.95
    }
  ]
});

/** Coffee mug, handle turned toward the viewer. */
const mug = (): Prop => ({
  id: 'mug',
  position: [1.02, 0, 0.42],
  rotationY: 0.5,
  parts: [
    {
      shape: { kind: 'cylinder', top: 0.078, bottom: 0.066, height: 0.135, sides: 16 },
      position: [0, 0.0675, 0],
      colour: C.ceramic,
      roughness: 0.4
    },
    {
      shape: { kind: 'cylinder', top: 0.0805, bottom: 0.0755, height: 0.036, sides: 16 },
      position: [0, 0.045, 0],
      colour: C.navy,
      roughness: 0.4
    },
    {
      shape: { kind: 'cylinder', top: 0.07, bottom: 0.07, height: 0.004, sides: 16 },
      position: [0, 0.127, 0],
      colour: C.coffee,
      roughness: 0.25
    },
    {
      // Torus sits in the XY plane, so its hole already faces sideways.
      shape: { kind: 'ring', radius: 0.045, tube: 0.013, sides: 6 },
      position: [0.082, 0.072, 0],
      colour: C.ceramic,
      roughness: 0.4
    }
  ]
});

/** Debugging duck. */
const duck = (): Prop => ({
  id: 'duck',
  position: [1.24, 0, 0.24],
  rotationY: -0.6,
  parts: [
    {
      shape: { kind: 'sphere', radius: 0.058, sides: 12 },
      position: [0, 0.049, 0],
      scale: [1.15, 0.85, 0.95],
      colour: C.duck,
      roughness: 0.55
    },
    {
      shape: { kind: 'cylinder', top: 0, bottom: 0.034, height: 0.075, sides: 6 },
      position: [-0.062, 0.062, 0],
      rotation: [0, 0, 0.95],
      colour: C.duck,
      roughness: 0.55
    },
    {
      shape: { kind: 'sphere', radius: 0.034, sides: 12 },
      position: [0.045, 0.105, 0],
      colour: C.duck,
      roughness: 0.55
    },
    {
      shape: { kind: 'cylinder', top: 0, bottom: 0.018, height: 0.034, sides: 6 },
      position: [0.083, 0.098, 0],
      rotation: [0, 0, -Math.PI / 2],
      colour: C.beak,
      roughness: 0.6
    },
    ...[0.022, -0.022].map(
      (z): Part => ({
        shape: { kind: 'sphere', radius: 0.0065, sides: 6 },
        position: [0.062, 0.117, z],
        colour: C.black,
        roughness: 0.4
      })
    )
  ]
});

/** Snake plant, the one a desk can survive on. */
const plant = (): Prop => {
  const soilY = 0.172;
  const blades: Array<[number, number, number, string]> = [
    [0.07, 0.2, 0.44, C.leaf],
    [0.15, 1.5, 0.36, C.leafDark],
    [0.05, 2.7, 0.48, C.leaf],
    [0.18, 3.9, 0.32, C.leafDark],
    [0.1, 5.1, 0.4, C.leaf]
  ];

  return {
    id: 'plant',
    position: [1.2, 0, -0.42],
    rotationY: 0.3,
    parts: [
      {
        shape: { kind: 'cylinder', top: 0.115, bottom: 0.085, height: 0.17, sides: 12 },
        position: [0, 0.085, 0],
        colour: C.terracotta,
        roughness: 0.85
      },
      {
        shape: { kind: 'cylinder', top: 0.125, bottom: 0.118, height: 0.028, sides: 12 },
        position: [0, 0.166, 0],
        colour: C.terracottaDark,
        roughness: 0.85
      },
      {
        shape: { kind: 'cylinder', top: 0.106, bottom: 0.106, height: 0.012, sides: 12 },
        position: [0, soilY, 0],
        colour: C.soil,
        roughness: 1
      },
      ...blades.map(
        ([tilt, azimuth, height, colour]): Part => ({
          shape: { kind: 'cylinder', top: 0.004, bottom: 0.032, height, sides: 4 },
          position: leaningCentre([0, soilY, 0], tilt, azimuth, height),
          rotation: leaning(tilt, azimuth),
          scale: [1, 1, 0.42],
          colour,
          roughness: 0.8
        })
      )
    ]
  };
};

export const PROPS: Prop[] = [
  lamp(),
  penPot(),
  books(),
  notepad(),
  floppies(),
  mousepad(),
  mug(),
  duck(),
  plant()
];

/**
 * Where the lamp's bulb ends up once the prop is placed and turned, so the
 * light source can sit inside the shade instead of being positioned twice.
 */
export const LAMP_BULB: [number, number, number] = (() => {
  const prop = PROPS.find((p) => p.id === 'lamp')!;
  const bulb = prop.parts[prop.parts.length - 1].position;
  const turn = prop.rotationY ?? 0;
  return [
    prop.position[0] + bulb[0] * Math.cos(turn) + bulb[2] * Math.sin(turn),
    prop.position[1] + bulb[1],
    prop.position[2] - bulb[0] * Math.sin(turn) + bulb[2] * Math.cos(turn)
  ];
})();

// --- notes stuck to the monitor ----------------------------------------------

/**
 * Sticky notes on the bezel, in the screen's own tilted frame: x/y across the
 * glass, z out of it.
 *
 * Measured room to work with, relative to the glass centre: the opening the
 * glass sits in reaches x +-0.299 and y +-0.24, and the case front reaches
 * x +-0.384 and y +-0.36. That leaves 0.085 of bezel down each side and 0.12
 * across the top, which is why the notes are small and why two of them sit up
 * top rather than all three down the side.
 */
export type BezelNote = {
  /** Local x/y on the bezel face. */
  offset: [number, number];
  size: number;
  /** Radians of roll, so they are not all stuck on square. */
  roll: number;
  colour: string;
};

/** The case front stands this far ahead of the glass plane. */
export const BEZEL_FRONT = 0.0228;

export const BEZEL_NOTES: BezelNote[] = [
  { offset: [0.185, 0.298], size: 0.096, roll: -0.09, colour: C.stickyYellow },
  { offset: [-0.15, 0.301], size: 0.084, roll: 0.13, colour: C.stickyCyan },
  { offset: [0.341, 0.03], size: 0.074, roll: 0.06, colour: C.stickyPink }
];
