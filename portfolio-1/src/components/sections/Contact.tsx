import React from 'react';
import { EMAIL, INSTAGRAM_URL, BOOK_CALL_URL, PROJECTS } from '../../data/content';
import { DotField } from '../DotField';
import { DARK, extrude } from '../theme';

// footer project list: the case studies plus UTrada (the third project in the Projects section)
// each goes straight to its case page
const CASE_HREF: Record<string, string> = { 'Trust Bank': '#/trust-bank', GameCove: '#/gamecove', UTrada: '#/utrada' };
const FOOTER_PROJECTS = [...PROJECTS.map((p) => p.name), 'UTrada'];
const FIELD_H = 260; // the dot ground along the bottom
const LINKEDIN_URL = '[URL]'; // TODO: Harbor's LinkedIn profile URL
const LINK = 'text-lg text-white/85 hover:text-[#9DB0FF] transition-colors duration-150';

/** Footer on the hero's blue-dark tone: navy deepening to the hero's edge colour, white type, lavender labels. */
export function Contact() {
  return (
    <footer
      id="contact"
      data-tone="dark"
      className="relative overflow-hidden pt-24 text-white"
      style={{ background: `linear-gradient(180deg, #080D44 0%, ${DARK.deep} 100%)` }}
    >
      {/* the dot harbour fills the whole footer: still ground at the bottom, lighthouse beam sweeps behind the text */}
      <DotField height={FIELD_H} className="absolute inset-0 z-0" />

      <div className="relative z-10 max-w-[1800px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-14">
          <div className="md:col-span-2 flex flex-col gap-10">
            <p className="font-inter-tight font-bold tracking-[-0.03em] text-[32px] leading-[1.1] max-w-md">
              Hiring, building something, or just want to say hi?{' '}
              <a
                href={`mailto:${EMAIL}?subject=${encodeURIComponent("Hi Harbor — let's talk")}`}
                className="group inline-flex items-baseline gap-[6px] transition-colors duration-150 hover:text-[#9DB0FF]"
                style={{ textShadow: extrude(3) }}
              >
                Let's talk
                <span aria-hidden className="inline-block transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1">
                  ↗
                </span>
              </a>
            </p>
            <div>
              <p className="mono-label mb-3" style={{ color: DARK.lav }}>
                Contact
              </p>
              <a href={`mailto:${EMAIL}`} className="font-inter-tight display-tight text-2xl md:text-4xl hover:text-[#9DB0FF] transition-colors duration-150 break-all">
                {EMAIL}
              </a>
            </div>
            <p className="mono-label" style={{ color: DARK.lav }}>
              © 2026 Harbor (Jihyun) Kim
            </p>
          </div>

          <div>
            <p className="mono-label mb-4" style={{ color: DARK.lav }}>
              Projects
            </p>
            <ul className="space-y-2">
              {FOOTER_PROJECTS.map((name) => (
                <li key={name}>
                  <a href={CASE_HREF[name] ?? '#/work'} className={LINK}>
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mono-label mb-4" style={{ color: DARK.lav }}>
              Elsewhere
            </p>
            <ul className="space-y-2">
              <li>
                <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                  Instagram
                </a>
              </li>
              <li>
                <a href={BOOK_CALL_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
                  Book a call
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ height: FIELD_H }} aria-hidden="true" />
    </footer>
  );
}
