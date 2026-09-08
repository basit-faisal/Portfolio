/**
 * Geometry for the CRT landing scene.
 *
 * The raw figures were measured off the .glb with `scripts/inspect-glb.mjs`
 * rather than eyeballed, so the screen overlay and the camera fly-in agree on
 * exactly where the glass is. Re-measure if the model is ever swapped.
 */

export const MODEL_URL = `${import.meta.env.BASE_URL}models/computer-90s.glb`;

/** The model ships at desk-toy scale (~11cm wide); this brings it to ~1.6 units. */
export const MODEL_SCALE = 14;

const RAW_SCREEN_CENTER = [-0.001, 0.0512, 0.0171] as const;
const RAW_SCREEN_WIDTH = 0.0371;
const RAW_SCREEN_HEIGHT = 0.0291;
/** Measured face normal: the monitor leans back a little. */
const RAW_SCREEN_NORMAL = [0, 0.1352, 0.9908] as const;

export const SCREEN_CENTER: [number, number, number] = [
  RAW_SCREEN_CENTER[0] * MODEL_SCALE,
  RAW_SCREEN_CENTER[1] * MODEL_SCALE,
  RAW_SCREEN_CENTER[2] * MODEL_SCALE
];

export const SCREEN_WIDTH = RAW_SCREEN_WIDTH * MODEL_SCALE;
export const SCREEN_HEIGHT = RAW_SCREEN_HEIGHT * MODEL_SCALE;
export const SCREEN_NORMAL = RAW_SCREEN_NORMAL;

/**
 * Rotation about X that points a plane's +Z face along the screen normal.
 * Rx(theta) maps +Z to (0, -sin, cos), hence the negation.
 */
export const SCREEN_TILT = -Math.asin(RAW_SCREEN_NORMAL[1]);

/**
 * Nudge the overlay off the original glass plane. The model's own screen mesh
 * is hidden, so this only needs to beat depth precision, not clear geometry.
 */
export const SCREEN_OFFSET = 0.002;

/**
 * How far the centre of the tube bulges toward the viewer.
 *
 * Budgeted against the bezel: the case front sits 0.0228 ahead of the glass
 * plane, so offset + bulge must stay under that or the screen looks like a
 * bubble stuck on the front. Verify with `node scripts/verify-screen-fit.mjs`
 * after changing either value. At ~3.4% of screen height this still matches
 * the curvature of a real tube.
 */
export const SCREEN_BULGE = 0.014;

/** Materials in the .glb that our own screen overlay replaces. */
export const SCREEN_MATERIALS = ['M_screen_brightblue', 'M_screen_whitetext'];

/**
 * How often the screen texture is redrawn and re-uploaded to the GPU.
 *
 * Repainting a 1024x768 canvas every frame is wasteful for content that is
 * only a blinking cursor and a slow roll, and the upload cost lands hardest
 * on phones. A real tube refresh is visible anyway, so throttling suits it.
 */
export const SCREEN_REFRESH_HZ = 20;

/**
 * Resting camera: a three-quarter view of the whole desk.
 *
 * Sat further back and a little higher than the bare model needed. At the
 * previous distance the desk surface left the bottom of a 16:9 frame at
 * z = 0.58, which cropped the mouse and everything else in front of the
 * keyboard — fine when the desk was an empty plane, not once there is clutter
 * on it worth seeing.
 */
export const IDLE_CAMERA: [number, number, number] = [1.0, 1.26, 2.82];
export const IDLE_TARGET: [number, number, number] = [0, 0.56, 0.14];

export const CAMERA_FOV = 35;

const HALF_FOV = ((CAMERA_FOV * Math.PI) / 180) / 2;

/**
 * Distance at which the glass just overfills the viewport, so the cross-fade
 * to the DOM layer has no visible seam.
 *
 * fov is vertical, so on a wide viewport the limiting dimension is width and
 * the camera has to come closer. Deriving this from the live aspect keeps the
 * handoff seamless on ultrawide monitors and portrait phones alike.
 */
export const flyInDistanceFor = (aspect: number) => {
  const limitByHeight = SCREEN_HEIGHT / (2 * Math.tan(HALF_FOV));
  const limitByWidth = SCREEN_WIDTH / (2 * Math.tan(HALF_FOV) * aspect);
  // 0.92 leaves a margin so rounding can never reveal the bezel mid-fade.
  return Math.min(limitByHeight, limitByWidth) * 0.92;
};

/**
 * How much further back the resting camera sits on narrow viewports, where a
 * vertical fov would otherwise crop the desk horizontally.
 */
export const idleDistanceScaleFor = (aspect: number) =>
  aspect < 1.2 ? Math.min(2.2, 1.2 / aspect) : 1;

export const FLY_IN_TARGET = SCREEN_CENTER;

/** Seconds the fly-in takes. */
export const FLY_IN_DURATION = 1.9;
