'use client';

import { useEffect, useRef } from 'react';

interface OrbitalNode {
  baseAngle: number;
  orbitX: number;
  orbitY: number;
  speed: number;
  size: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
  accent: boolean;
  ring: number;
}

interface DriftNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface ThemePalette {
  primary: [number, number, number];
  accent: [number, number, number];
  lineAlpha: number;
  ringAlpha: number;
  glowAlpha: number;
  hazeAlpha: number;
  driftAlpha: number;
}

function getThemePalette(): ThemePalette {
  const isDark = document.documentElement.classList.contains('dark');

  if (isDark) {
    return {
      primary: [127, 188, 140],
      accent: [212, 165, 116],
      lineAlpha: 0.1,
      ringAlpha: 0.13,
      glowAlpha: 0.18,
      hazeAlpha: 0.12,
      driftAlpha: 0.1,
    };
  }

  return {
    primary: [80, 96, 54],
    accent: [184, 134, 11],
    lineAlpha: 0.055,
    ringAlpha: 0.075,
    glowAlpha: 0.095,
    hazeAlpha: 0.07,
    driftAlpha: 0.06,
  };
}

function rgba([r, g, b]: [number, number, number], alpha: number) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isInsideEllipse(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
) {
  const dx = x - centerX;
  const dy = y - centerY;

  return (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) < 1;
}

function projectOutsideEllipse(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  padding: number
) {
  const dx = x - centerX;
  const dy = y - centerY;
  const angle = Math.atan2(dy || 0.0001, dx || 0.0001);
  const edgeDistance =
    1 /
    Math.sqrt(
      (Math.cos(angle) * Math.cos(angle)) / (radiusX * radiusX) +
        (Math.sin(angle) * Math.sin(angle)) / (radiusY * radiusY)
    );
  const targetDistance = edgeDistance + padding;

  return {
    x: centerX + Math.cos(angle) * targetDistance,
    y: centerY + Math.sin(angle) * targetDistance,
  };
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let orbitalNodes: OrbitalNode[] = [];
    let driftNodes: DriftNode[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createScene = () => {
      const driftCount = width < 768 ? 5 : 8;
      const ringConfigs =
        width < 768
          ? [
              { count: 5, radiusX: Math.min(width * 0.42, 250), radiusY: Math.min(height * 0.24, 150) },
              { count: 6, radiusX: Math.min(width * 0.54, 335), radiusY: Math.min(height * 0.34, 220) },
              { count: 8, radiusX: Math.min(width * 0.68, 430), radiusY: Math.min(height * 0.44, 290) },
            ]
          : [
              { count: 8, radiusX: Math.min(width * 0.36, 500), radiusY: Math.min(height * 0.2, 255) },
              { count: 9, radiusX: Math.min(width * 0.48, 640), radiusY: Math.min(height * 0.29, 360) },
              { count: 11, radiusX: Math.min(width * 0.6, 820), radiusY: Math.min(height * 0.38, 480) },
            ];

      orbitalNodes = ringConfigs.flatMap((ringConfig, ring) =>
        Array.from({ length: ringConfig.count }, (_, index) => ({
          baseAngle:
            (index / ringConfig.count) * Math.PI * 2 + (Math.random() - 0.5) * (ring === 0 ? 0.12 : 0.18),
          orbitX: ringConfig.radiusX + Math.random() * (ring === 2 ? 28 : 18),
          orbitY: ringConfig.radiusY + Math.random() * (ring === 2 ? 18 : 12),
          speed: 0.00005 + ring * 0.00002 + Math.random() * 0.00008,
          size: (ring === 0 ? 1.85 : ring === 1 ? 1.45 : 1.1) + Math.random() * (ring === 0 ? 1.15 : 0.9),
          opacity:
            ring === 0
              ? 0.68 + Math.random() * 0.22
              : ring === 1
                ? 0.42 + Math.random() * 0.2
                : 0.2 + Math.random() * 0.14,
          wobble: 5 + ring * 3 + Math.random() * 8,
          wobbleSpeed: 0.0003 + Math.random() * 0.00045,
          accent: (index + ring) % 4 === 0,
          ring,
        }))
      );

      driftNodes = Array.from({ length: driftCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.04,
        size: 22 + Math.random() * 42,
        opacity: 0.45 + Math.random() * 0.25,
      }));
    };

    const drawHaze = (palette: ThemePalette, centerX: number, centerY: number) => {
      const mainGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.min(width, height) * 0.42
      );
      mainGlow.addColorStop(0, rgba(palette.primary, palette.hazeAlpha));
      mainGlow.addColorStop(0.32, rgba(palette.accent, palette.hazeAlpha * 0.4));
      mainGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = mainGlow;
      ctx.fillRect(0, 0, width, height);

      driftNodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < -80) node.x = width + 80;
        if (node.x > width + 80) node.x = -80;
        if (node.y < -80) node.y = height + 80;
        if (node.y > height + 80) node.y = -80;

        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size);
        glow.addColorStop(0, rgba(palette.primary, palette.driftAlpha * node.opacity));
        glow.addColorStop(0.55, rgba(palette.accent, palette.driftAlpha * 0.3 * node.opacity));
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(node.x - node.size, node.y - node.size, node.size * 2, node.size * 2);
      });
    };

    const drawRings = (palette: ThemePalette, centerX: number, centerY: number, now: number) => {
      ctx.save();
      ctx.lineWidth = 1;

      const ringSets = [
        { rx: Math.min(width * 0.36, 500), ry: Math.min(height * 0.2, 255), dash: [10, 18], alpha: 1.08 },
        { rx: Math.min(width * 0.48, 640), ry: Math.min(height * 0.29, 360), dash: [4, 16], alpha: 0.62 },
        { rx: Math.min(width * 0.6, 820), ry: Math.min(height * 0.38, 480), dash: [2, 24], alpha: 0.32 },
      ];

      ringSets.forEach((ring, index) => {
        ctx.beginPath();
        ctx.setLineDash(ring.dash);
        ctx.strokeStyle = rgba(palette.primary, palette.ringAlpha * ring.alpha);
        ctx.ellipse(centerX, centerY, ring.rx, ring.ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = rgba(palette.accent, palette.ringAlpha * 0.55 * ring.alpha);
        ctx.lineWidth = 1.1;
        ctx.ellipse(
          centerX,
          centerY,
          ring.rx,
          ring.ry,
          0,
          now * 0.00008 + index * 0.7,
          now * 0.00008 + index * 0.7 + Math.PI / 6
        );
        ctx.stroke();
      });

      ctx.restore();
    };

    const animate = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      const palette = getThemePalette();
      const centerX = width * 0.5;
      const centerY = height * 0.49;
      const safeRadiusX = width < 768 ? Math.min(width * 0.33, 220) : Math.min(width * 0.28, 390);
      const safeRadiusY = width < 768 ? Math.min(height * 0.18, 135) : Math.min(height * 0.19, 280);

      drawHaze(palette, centerX, centerY);
      drawRings(palette, centerX, centerY, now);

      const points = orbitalNodes.map((node) => {
        const angle = node.baseAngle + now * node.speed;
        const wobbleX = Math.cos(now * node.wobbleSpeed + node.baseAngle) * node.wobble;
        const wobbleY = Math.sin(now * node.wobbleSpeed + node.baseAngle) * (node.wobble * 0.5);
        const rawX = centerX + Math.cos(angle) * node.orbitX + wobbleX;
        const rawY = centerY + Math.sin(angle) * node.orbitY + wobbleY;
        const position = isInsideEllipse(rawX, rawY, centerX, centerY, safeRadiusX, safeRadiusY)
          ? projectOutsideEllipse(rawX, rawY, centerX, centerY, safeRadiusX, safeRadiusY, 36 + node.ring * 18)
          : { x: rawX, y: rawY };

        return {
          angle,
          x: position.x,
          y: position.y,
          node,
        };
      });

      const pointsByRing = points.reduce<Map<number, typeof points>>((groups, point) => {
        const ringPoints = groups.get(point.node.ring) ?? [];
        ringPoints.push(point);
        groups.set(point.node.ring, ringPoints);
        return groups;
      }, new Map());

      pointsByRing.forEach((ringPoints, ring) => {
        const orderedPoints = [...ringPoints].sort((left, right) => left.angle - right.angle);

        for (let i = 0; i < orderedPoints.length; i += 1) {
          const current = orderedPoints[i];
          const next = orderedPoints[(i + 1) % orderedPoints.length];
          const midpointX = (current.x + next.x) / 2;
          const midpointY = (current.y + next.y) / 2;

          if (isInsideEllipse(midpointX, midpointY, centerX, centerY, safeRadiusX, safeRadiusY)) {
            continue;
          }

          ctx.beginPath();
          ctx.moveTo(current.x, current.y);
          ctx.lineTo(next.x, next.y);
          ctx.strokeStyle = rgba(
            current.node.accent ? palette.accent : palette.primary,
            palette.lineAlpha * (ring === 0 ? 1.34 : ring === 1 ? 0.72 : 0.36) * current.node.opacity
          );
          ctx.lineWidth = ring === 0 ? 0.92 : ring === 1 ? 0.68 : 0.54;
          ctx.stroke();
        }
      });

      points.forEach(({ x, y, node }) => {
        const fill = node.accent ? palette.accent : palette.primary;

        ctx.save();
        ctx.shadowBlur = node.size * 10;
        ctx.shadowColor = rgba(fill, palette.glowAlpha * node.opacity);
        ctx.beginPath();
        ctx.arc(x, y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(fill, 0.75 * node.opacity);
        ctx.fill();
        ctx.restore();
      });

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, safeRadiusX, safeRadiusY, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.clearRect(centerX - safeRadiusX - 48, centerY - safeRadiusY - 48, safeRadiusX * 2 + 96, safeRadiusY * 2 + 96);
      ctx.restore();

      animationId = window.requestAnimationFrame(animate);
    };

    resize();
    createScene();
    animationId = window.requestAnimationFrame(animate);

    const handleResize = () => {
      resize();
      createScene();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-ambient-glow absolute inset-0" />
      <div className="hero-tech-grid absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="hero-vignette absolute inset-0" />
    </div>
  );
}
