const WAVE_PATHS = [
  "M-80 210 C 80 110 170 270 320 170 S 560 60 720 150 980 300 1280 110",
  "M-90 245 C 70 145 190 300 340 205 S 600 95 760 185 1000 335 1290 150",
  "M-70 285 C 95 180 225 340 380 245 S 630 145 800 225 1030 360 1280 195",
  "M-60 170 C 95 80 210 215 360 128 S 585 32 740 118 985 255 1270 78",
  "M-90 325 C 80 220 235 380 405 282 S 660 185 830 260 1050 390 1300 240",
  "M-70 130 C 100 48 230 178 385 96 S 620 10 790 86 1010 220 1285 45",
  "M-40 365 C 125 265 260 415 430 322 S 690 230 860 300 1080 425 1300 285",
];

export function WaveMeshBackground() {
  return (
    <div className="landing-wave-mesh absolute inset-0" aria-hidden="true">
      <svg
        className="landing-wave-mesh-svg"
        viewBox="0 0 1200 420"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="landing-wave-mesh-stroke" x1="0%" y1="45%" x2="100%" y2="55%">
            <stop offset="0%" stopColor="#0b5cff" stopOpacity="0" />
            <stop offset="18%" stopColor="#10bfa8" stopOpacity="0.37" />
            <stop offset="52%" stopColor="#002b36" stopOpacity="0.32" />
            <stop offset="78%" stopColor="#0b5cff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="landing-wave-mesh-soft" x1="0%" y1="55%" x2="100%" y2="45%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0" />
            <stop offset="34%" stopColor="#0b5cff" stopOpacity="0.19" />
            <stop offset="68%" stopColor="#10bfa8" stopOpacity="0.23" />
            <stop offset="100%" stopColor="#0b5cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="landing-wave-mesh-field landing-wave-mesh-field-primary">
          {WAVE_PATHS.map((path, index) => (
            <path
              key={`primary-${path}`}
              d={path}
              stroke={index % 2 === 0 ? "url(#landing-wave-mesh-stroke)" : "url(#landing-wave-mesh-soft)"}
              strokeWidth={index === 2 ? 2.55 : 1.9}
              opacity={index === 2 ? 1 : 0.82}
            />
          ))}
        </g>
        <g className="landing-wave-mesh-field landing-wave-mesh-field-secondary">
          {WAVE_PATHS.slice(1, 6).map((path, index) => (
            <path
              key={`secondary-${path}`}
              d={path}
              stroke="url(#landing-wave-mesh-soft)"
              strokeWidth={1.45}
              opacity={0.56 - index * 0.04}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
