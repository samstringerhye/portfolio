export default [
  // -- Arrangement --
  { type: 'group', label: 'Arrangement' },
  { type: 'select', key: 'arrangement', label: 'Arrangement', options: ['concentric', 'spiral', 'hexagonal', 'rose'], default: 'concentric', info: 'Pattern used to distribute dots' },
  { key: 'numRays', label: 'Point Count', min: 10, max: 300, step: 1, default: 120, info: 'Points per ring (concentric) or total distribution factor (spiral/rose)', visibleWhen: { key: 'arrangement', values: ['spiral', 'concentric', 'rose'] } },
  { key: 'dotsPerRay', label: 'Density', min: 10, max: 150, step: 1, default: 80, info: 'Number of rings (concentric) or density factor (spiral/hex/rose)' },
  { key: 'spacing', label: 'Spacing', min: 0.1, max: 2.0, step: 0.01, default: 0.6, info: 'Distance between adjacent dots' },
  { key: 'innerRadius', label: 'Inner Radius', min: 0, max: 10, step: 0.1, default: 2, info: 'Starting offset from center', visibleWhen: { key: 'arrangement', values: ['concentric'] } },

  // -- Dot Appearance --
  { type: 'group', label: 'Dot Appearance' },
  { key: 'dotRadius', label: 'Dot Radius', min: 0.02, max: 0.5, step: 0.01, default: 0.15, info: 'Radius of each circle' },
  { key: 'dotSegments', label: 'Dot Segments', min: 3, max: 32, step: 1, default: 8, info: 'Polygon sides (3 = triangle, 8 = octagon, 32 = smooth circle)' },
  { type: 'color', key: 'dotColor', label: 'Dot Color', default: '#000000', info: 'Fill color for all dots' },
  { type: 'color', key: 'bgColor', label: 'Background', default: '#FAFAF9', info: 'Canvas background color' },

  // -- Size Taper --
  { type: 'group', label: 'Size Taper' },
  { key: 'sizeStart', label: 'Size Start', min: 0.1, max: 2.0, step: 0.05, default: 0.3, info: 'Dot scale near center (Bezier start)' },
  { key: 'sizeMid', label: 'Size Mid', min: 0.1, max: 2.0, step: 0.05, default: 1.0, info: 'Dot scale at midpoint (Bezier control)' },
  { key: 'sizeEnd', label: 'Size End', min: 0.1, max: 2.0, step: 0.05, default: 0.3, info: 'Dot scale at outer edge (Bezier end)' },

  // -- Wave / Breathing --
  { type: 'group', label: 'Wave / Breathing' },
  { type: 'toggle', key: 'wavePaused', label: 'Paused', default: false, info: 'Freeze wave, twist, and noise animation' },
  { key: 'waveSpeed', label: 'Wave Speed', min: 0.1, max: 2.0, step: 0.05, default: 1.0, info: 'Time multiplier for wave animation' },
  { key: 'waveFrequency', label: 'Wave Frequency', min: 0.05, max: 1.0, step: 0.01, default: 0.26, info: 'Oscillation rate of the breathing wave' },
  { key: 'waveAmplitude', label: 'Wave Amplitude', min: 0.05, max: 1.0, step: 0.01, default: 0.4, info: 'Strength of wave displacement' },
  { key: 'waveSharpness', label: 'Wave Sharpness', min: 0.01, max: 1.0, step: 0.01, default: 0.15, info: 'Low = smooth sine, high = sharp square wave' },
  { key: 'propagation', label: 'Propagation', min: 5, max: 100, step: 1, default: 25, info: 'How fast wave travels outward (lower = faster)' },
  { key: 'baseScale', label: 'Base Scale', min: 0.5, max: 3.0, step: 0.05, default: 1.3, info: 'Constant scale added on top of wave' },

  // -- Twist --
  { type: 'group', label: 'Twist' },
  { key: 'twistAmount', label: 'Twist Amount', min: 0, max: 1.0, step: 0.01, default: 0.15, info: 'Rotational displacement from wave' },

  // -- Temporal RGB Split --
  { type: 'group', label: 'Temporal RGB Split' },
  { key: 'rgbDelay', label: 'RGB Delay', min: 0, max: 8, step: 1, default: 3, info: 'Frames between R/G/B channels (0 = off)' },
  { type: 'select', key: 'rgbSplitMode', label: 'Split Mode', options: ['cmy', 'rgb'], default: 'cmy', info: 'CMY = subtractive fringing (light bg), RGB = additive fringing (dark bg)' },

  // -- Title Animation --
  { type: 'group', label: 'Title Animation' },
  { key: 'titleDuration', label: 'Duration', min: 0.3, max: 3.0, step: 0.1, default: 1.4, info: 'Animation duration per line' },
  { key: 'titleStagger', label: 'Stagger', min: 0.02, max: 0.5, step: 0.01, default: 0.15, info: 'Delay between each line' },
  { key: 'titleY', label: 'Y Offset', min: 10, max: 100, step: 5, default: 40, info: 'Starting vertical offset in pixels' },
  { key: 'titleBlur', label: 'Blur', min: 0, max: 30, step: 1, default: 14, info: 'Starting blur amount in pixels' },
  { key: 'titleAberration', label: 'Aberration', min: 0, max: 60, step: 0.5, default: 30, info: 'Chromatic split distance in pixels' },
  { key: 'titleAberrationOpacity', label: 'Aberration Opacity', min: 0, max: 1.0, step: 0.01, default: 0.5, info: 'Opacity of chromatic split shadows' },
  { key: 'titleDelay', label: 'Delay', min: 0, max: 3.0, step: 0.1, default: 0.6, info: 'Wait before animation begins' },
  { type: 'action', key: 'titleReplay', label: 'Replay Animation', info: 'Replay the title entrance' },

  // -- Camera --
  { type: 'group', label: 'Camera' },
  { key: 'zoom', label: 'Zoom', min: 5, max: 80, step: 1, default: 20, info: 'Orthographic camera zoom level' },
]

export const presets = {
  minimal: {
    arrangement: 'concentric', numRays: 120, dotsPerRay: 80, spacing: 0.6, innerRadius: 2,
    dotRadius: 0.15, dotSegments: 8, dotColor: '#000000', bgColor: '#FAFAF9',
    sizeStart: 0.3, sizeMid: 1.0, sizeEnd: 0.3,
    wavePaused: false, waveSpeed: 0.5, waveFrequency: 0.26, waveAmplitude: 0.2, waveSharpness: 0.15,
    propagation: 25, baseScale: 1.3, twistAmount: 0, rgbDelay: 0, rgbSplitMode: 'cmy', zoom: 20,

    titleDuration: 1.4, titleStagger: 0.15, titleY: 40, titleBlur: 14, titleAberration: 30, titleAberrationOpacity: 0.5, titleDelay: 0.6, titleReplay: 0,
  },
  breathing: {
    arrangement: 'concentric', numRays: 120, dotsPerRay: 80, spacing: 0.6, innerRadius: 2,
    dotRadius: 0.15, dotSegments: 8, dotColor: '#000000', bgColor: '#FAFAF9',
    sizeStart: 0.3, sizeMid: 1.0, sizeEnd: 0.3,
    wavePaused: false, waveSpeed: 1.0, waveFrequency: 0.26, waveAmplitude: 0.4, waveSharpness: 0.15,
    propagation: 25, baseScale: 1.3, twistAmount: 0.15, rgbDelay: 3, rgbSplitMode: 'cmy', zoom: 20,

    titleDuration: 1.4, titleStagger: 0.15, titleY: 40, titleBlur: 14, titleAberration: 30, titleAberrationOpacity: 0.5, titleDelay: 0.6, titleReplay: 0,
  },
  psychedelic: {
    arrangement: 'concentric', numRays: 200, dotsPerRay: 100, spacing: 0.5, innerRadius: 1,
    dotRadius: 0.12, dotSegments: 8, dotColor: '#1a0033', bgColor: '#f0e6ff',
    sizeStart: 0.5, sizeMid: 1.5, sizeEnd: 0.2,
    wavePaused: false, waveSpeed: 1.8, waveFrequency: 0.5, waveAmplitude: 0.7, waveSharpness: 0.08,
    propagation: 15, baseScale: 1.5, twistAmount: 0.6, rgbDelay: 6, rgbSplitMode: 'rgb', zoom: 15,

    titleDuration: 1.4, titleStagger: 0.15, titleY: 40, titleBlur: 14, titleAberration: 30, titleAberrationOpacity: 0.5, titleDelay: 0.6, titleReplay: 0,
  },
}
