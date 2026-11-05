import React, { useEffect, useRef, useState } from 'react';

/**
 * Shared building blocks for the GameCove case study (same patterns as the Trust Bank page:
 * 1440 container, eyebrow → title → body stacked 16 apart, Helvetica Neue everywhere).
 */

export const HELV = '"Helvetica Neue", Helvetica, Arial, sans-serif';
export const INK = '#111114';
export const MUTE = '#6e6e76';
export const ASH = '#8e8e95';
export const BLUE = '#2e5bd6';
export const SKY = '#b3d1ff';
export const SAND = '#f2f0ec';
export const DATA = '#3898f8';

export function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`relative mx-auto w-full max-w-[1440px] px-6 min-[1488px]:px-0 ${className}`}>{children}</div>;
}

export function Eyebrow({ label, square = ASH, text = MUTE }: { label: string; square?: string; text?: string }) {
  return (
    <div className="flex items-center gap-[10px]" style={{ fontFamily: HELV }}>
      <span className="block h-4 w-4" style={{ backgroundColor: square }} />
      <span className="text-[17px] leading-[1.4] tracking-[0.5px]" style={{ color: text }}>
        {label}
      </span>
    </div>
  );
}

export function H2({ children, color = INK, className = '' }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <h2 className={`whitespace-pre-line text-[30px] font-bold leading-[1.12] tracking-[-0.01em] md:text-[37px] ${className}`} style={{ fontFamily: HELV, color }}>
      {children}
    </h2>
  );
}

export function H3({ children, color = INK, className = '' }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <h3 className={`text-[23px] font-bold leading-[1.15] ${className}`} style={{ fontFamily: HELV, color }}>
      {children}
    </h3>
  );
}

export function Body({ children, className = '', color = INK }: { children: React.ReactNode; className?: string; color?: string }) {
  return (
    <p className={`whitespace-pre-line text-[17px] leading-[29px] md:text-[18px] ${className}`} style={{ fontFamily: HELV, color }}>
      {children}
    </p>
  );
}

/** heading + body, 16 apart (Figma text stacks) */
export function Lead({ title, body, color = INK, bodyColor, className = '', width = 700 }: { title: string; body: string; color?: string; bodyColor?: string; className?: string; width?: number }) {
  return (
    <div className={className} style={{ maxWidth: width }}>
      <H2 color={color}>{title}</H2>
      <Body className="mt-4" color={bodyColor ?? color}>
        {body}
      </Body>
    </div>
  );
}

/** Image slot from the Figma file — the picture isn't in Figma yet, so the slot shows its label (dashed box) */
export function Slot({ label, ratio, dark = false, className = '' }: { label: string; ratio: string; dark?: boolean; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-[10px] border border-dashed px-6 text-center ${className}`}
      style={{
        aspectRatio: ratio,
        background: dark ? 'transparent' : '#e7e5e0',
        borderColor: dark ? 'rgba(167,169,176,0.5)' : 'rgba(110,110,118,0.5)',
        fontFamily: HELV,
      }}
      role="img"
      aria-label={`${label} (image coming soon)`}
    >
      <span className="text-[16px] leading-[26px]" style={{ color: dark ? SKY : MUTE }}>
        {label}
      </span>
    </div>
  );
}

export function Img({ src, alt, className = '', zoom = false, ratio }: { src: string; alt: string; className?: string; zoom?: boolean; ratio?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      data-zoom={zoom ? 'true' : undefined}
      className={`block h-auto w-full ${className}`}
      style={ratio ? { aspectRatio: ratio, objectFit: 'cover' } : undefined}
    />
  );
}

/** 0 → 1 as the element scrolls from the bottom of the screen up to its middle (same as Trust Bank's count-up) */
export function useCountProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setP(1);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      const t = Math.min(1, Math.max(0, (vh - top) / (vh * 0.5)));
      setP(1 - (1 - t) * (1 - t)); // ease out
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return [ref, p] as const;
}

/** a number that counts up with p (keeps the decimals of the target) */
export function count(target: number, p: number) {
  const dec = (String(target).split('.')[1] || '').length;
  return (target * p).toFixed(dec);
}

/** simple table: header row in muted 16, rows 18, hairlines between */
export function Table({ cols, head, rows, className = '' }: { cols: string; head: React.ReactNode[]; rows: React.ReactNode[][]; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`} style={{ fontFamily: HELV }}>
      <div className="min-w-[640px]">
        <div className="grid gap-5 border-b py-4 text-[16px] leading-[26px]" style={{ gridTemplateColumns: cols, color: MUTE, borderColor: 'rgba(17,17,20,0.1)' }}>
          {head.map((h, i) => (
            <span key={i}>{h}</span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid gap-5 border-b py-4 text-[18px] leading-[29px]" style={{ gridTemplateColumns: cols, color: INK, borderColor: 'rgba(17,17,20,0.1)' }}>
            {r.map((c, j) => (
              <span key={j}>{c}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
