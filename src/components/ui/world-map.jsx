import { useMemo } from 'react';
import { motion } from 'framer-motion';
import DottedMap from 'dotted-map';
import { cn } from '../../lib/utils';

// Equirectangular projection onto the 800x400 viewBox the dotted map uses.
function projectPoint(lat, lng) {
  const x = (lng + 180) * (800 / 360);
  const y = (90 - lat) * (400 / 180);
  return { x, y };
}

function curvedPath(start, end) {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 50;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
}

/**
 * Aceternity WorldMap — a dotted world with animated connection arcs.
 * - `dots`: [{ start:{lat,lng}, end:{lat,lng} }] → animated arcs + pulsing endpoints
 * - `points`: [{ lat, lng, color }]            → pulsing report markers
 */
export function WorldMap({ dots = [], points = [], lineColor = '#3b82f6', className }) {
  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: 'diagonal' });
    return map.getSVG({
      radius: 0.22,
      color: '#3b82f655',
      shape: 'circle',
      backgroundColor: '#05070d',
    });
  }, []);

  return (
    <div className={cn('relative aspect-[2/1] w-full rounded-2xl bg-paper font-sans', className)}>
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        alt="World map"
        className="pointer-events-none h-full w-full select-none [mask-image:linear-gradient(to_bottom,transparent,white_12%,white_88%,transparent)]"
        draggable={false}
      />
      <svg
        viewBox="0 0 800 400"
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wm-path" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => {
          const s = projectPoint(dot.start.lat, dot.start.lng);
          const e = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <motion.path
              key={`arc-${i}`}
              d={curvedPath(s, e)}
              fill="none"
              stroke="url(#wm-path)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, delay: 0.25 * i, ease: 'easeOut' }}
            />
          );
        })}

        {dots.flatMap((dot, i) =>
          [dot.start, dot.end].map((p, j) => {
            const pp = projectPoint(p.lat, p.lng);
            return (
              <g key={`end-${i}-${j}`}>
                <circle cx={pp.x} cy={pp.y} r="2" fill={lineColor} />
                <circle cx={pp.x} cy={pp.y} r="2" fill={lineColor} opacity="0.5">
                  <animate attributeName="r" from="2" to="8" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </g>
            );
          })
        )}

        {points.map((p, i) => {
          const pp = projectPoint(p.lat, p.lng);
          const color = p.color || lineColor;
          const begin = `${(i % 6) * 0.3}s`;
          return (
            <g key={`pt-${i}`}>
              <circle cx={pp.x} cy={pp.y} r="2.4" fill={color} />
              <circle cx={pp.x} cy={pp.y} r="2.4" fill={color} opacity="0.6">
                <animate attributeName="r" from="2.4" to="9" dur="2s" begin={begin} repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="2s" begin={begin} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default WorldMap;
