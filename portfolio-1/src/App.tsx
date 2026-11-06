import React, { useCallback, useEffect, useState } from 'react';
import { ObjectsHero } from './components/sections/ObjectsHero';
import { HomeDock } from './components/HomeDock';
import { Contact } from './components/sections/Contact';
import { TrustBankCase } from './components/case/TrustBankCase';
import { GameCoveCase } from './components/case/GameCoveCase';
import { PlaceholderCase } from './components/case/PlaceholderCase';
import { CaseReveal } from './components/case/CaseReveal';
import { CaseEnterFade } from './components/case/CaseChrome';
import { ImageLightbox } from './components/case/ImageLightbox';
import { CursorTrail } from './components/CursorTrail';
import { AboutPage } from './components/about/AboutPage';

const CASE_ROUTES = ['#/trust-bank', '#/gamecove', '#/utrada', '#/about'];

function readRoute() {
  if (typeof window === 'undefined') return '';
  return CASE_ROUTES.includes(window.location.hash) ? window.location.hash : '';
}

// Home page: the hero (intro -> 3D headline -> scroll into the desk scene) and the footer (Contact).
// Taken off the home page at Harbor's request (files kept): the Experience coin section (sections/Work.tsx),
// the Projects book (sections/Experience.tsx; the case studies are in the header's Work menu), and the
// About me + Kim LLM section (sections/WhatIDo.tsx).
// Header menu: Work (a dropdown with the three case studies) and About me (#/about).
// Case studies: scrolling past the end opens the next one (CaseChrome's NextProjectCard), which fades in.
export function App() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    // an old #/work link lands on the home page
    if (window.location.hash === '#/work') window.location.hash = '';
    const onHash = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // closing a case study returns to the top of the home page
  const closeCase = useCallback(() => {
    window.location.hash = '';
    setRoute('');
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  // closing About returns to the top of the home page
  const closeAbout = useCallback(() => {
    window.location.hash = '';
    setRoute('');
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  return (
    <>
      {/* dot-trail cursor on every page */}
      <CursorTrail />

      {route === '#/about' ? (
        <AboutPage onClose={closeAbout} />
      ) : route ? (
        <div className="case-grid" key={route}>
          <CaseEnterFade>
            <ImageLightbox>
              <CaseReveal>
                {route === '#/trust-bank' && <TrustBankCase onClose={closeCase} />}
                {route === '#/gamecove' && <GameCoveCase onClose={closeCase} />}
                {route === '#/utrada' && (
                  <PlaceholderCase name="UTrada" accent="#8301D5" onClose={closeCase} nextName="Trust Bank" nextHref="#/trust-bank" />
                )}
              </CaseReveal>
            </ImageLightbox>
          </CaseEnterFade>
        </div>
      ) : (
        // home-min16: page content never goes below 16px (see index.css)
        <div className="home-min16 relative w-full min-h-screen bg-white text-[#0A0A0A] font-inter-tight overflow-x-clip">
          <div className="fixed inset-0 dot-grid-bg pointer-events-none z-0" />

          <main className="relative z-10">
            <ObjectsHero />
            <Contact />
          </main>

          <HomeDock />
        </div>
      )}
    </>
  );
}
