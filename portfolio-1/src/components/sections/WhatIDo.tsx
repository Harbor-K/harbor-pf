import React from 'react';
import { motion } from 'framer-motion';
import { KimLLM } from '../KimLLM';
import { EMAIL } from '../../data/content';
import { CV_URL, CV_LABEL } from '../../data/links';
import { DARK, extrude } from '../theme';

/**
 * About me section (file name kept for history; was "What I do").
 * On the navy the UTrada page fades into, so Projects flows straight into it, then deepens toward the footer.
 * White type with the hero's cobalt extrusion on the heading; the Kim LLM box stays a white card.
 * Layout from Harbor's sketch: a wide photo across the whole left column with the text right under it,
 * same width, and a short gutter before the Kim LLM box on the right.
 * Under the bio: LinkedIn and Email as outline keys, CV as the header's white 3D key.
 */
const ABOUT_PHOTO = 'https://raw.githubusercontent.com/Harbor-K/harbor-pf/main/assets/main-v2/about-photo.webp';
const BIO = "I'm an AI-native product designer who owns the work end to end, from finding the problem to shipping the fix.";
const LINKEDIN_URL = '[URL]'; // TODO: Harbor's LinkedIn profile URL

const BTN = 'inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[17px] font-bold tracking-tight transition-all duration-150';
const OUTLINE = `${BTN} border border-white/35 text-white hover:bg-white/10 hover:border-white/60`;

export function WhatIDo() {
  return (
    <section
      id="about"
      data-tone="dark"
      className="relative px-6 py-24 text-white"
      style={{ background: `linear-gradient(180deg, ${DARK.navy} 0%, #0A1050 55%, #080D44 100%)` }}
    >
      <div className="relative max-w-[1800px] mx-auto">
        <h2 className="font-inter-tight font-bold tracking-[-0.03em] uppercase text-3xl md:text-5xl mb-10" style={{ textShadow: extrude(4) }}>
          About me
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          <motion.div
            className="md:col-span-4 flex flex-col"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[24px]" style={{ background: DARK.mid, boxShadow: `0 6px 0 ${DARK.side}, 0 24px 50px rgba(5,8,38,0.45)` }}>
              <img
                src={ABOUT_PHOTO}
                alt="Harbor Kim sorting sticky notes on a research wall"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: '38% 40%' }}
              />
            </div>
            <p className="font-inter-tight font-bold tracking-[-0.02em] text-[24px] md:text-[28px] leading-tight mt-6">Harbor Kim</p>
            <p className="text-[18px] mt-1" style={{ color: DARK.lav }}>
              I Design Magic.
            </p>
            <p className="text-[18px] leading-relaxed mt-4" style={{ textWrap: 'balance', color: DARK.mute } as React.CSSProperties}>
              {BIO}
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={OUTLINE}>
                LinkedIn
              </a>
              <a href={`mailto:${EMAIL}`} className={OUTLINE}>
                Email
              </a>
              <a
                href={CV_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open CV in a new tab"
                className={`${BTN} bg-white hover:-translate-y-[1px]`}
                style={{ color: DARK.cobalt, boxShadow: `0 4px 0 ${DARK.side}, 0 10px 18px rgba(5,8,38,0.3)` }}
              >
                {CV_LABEL}
              </a>
            </div>
          </motion.div>

          <motion.div
            className="md:col-span-8 text-[#0A0A0A]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            <KimLLM />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
