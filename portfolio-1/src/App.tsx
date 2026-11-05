import React, { useCallback, useEffect, useState } from 'react';
import { ObjectsHero } from './components/sections/ObjectsHero';
import { HomeDock } from './components/HomeDock';
import { Work } from './components/sections/Work';
import { Experience } from './components/sections/Experience';
import { WhatIDo } from './components/sections/WhatIDo';
import { Contact } from './components/sections/Contact';
import { TrustBankCase } from './components/case/TrustBankCase';
import { GameCoveCase } from './components/case/GameCoveCase';
import { PlaceholderCase } from './components/case/PlaceholderCase';
import { CaseReveal } from './components/case/CaseReveal';
import { ImageLightbox } from './components/case/ImageLightbox';
import { CursorTrail } from './components/CursorTrail';
import { AboutPage } from './components/about/AboutPage';

const CASE_ROUTES = ['#/trust-bank', '#/gamecove', '#/utrada', '#/about'];

function readRoute() {
  if (typeof window === 'undefined') return '';
  return CASE_ROUTES.includes(window.location.hash) ? window.location.hash : '';
}

// Not rendered on the home page: FixedNav (replaced by the hero's own header + HomeDock, like agentcard.com),
// DotIntro, IntroHero, Manifesto, ToolsDomains, RolesHero and MorphIntro.
// The intro (flat type -> 3D -> hero) is now played by ObjectsHero itself, on its own 3D headline,
// so the last frame of the intro IS the hero headline.
export function App() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // closing a case study returns to the Projects section of the home page
  const closeCase = useCallback(() => {
    window.location.hash = '#work';
    setRoute('');
    requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById('work')?.scrollIntoView({ block: 'start' })));
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
          <ImageLightbox>
            <CaseReveal>
              {route === '#/trust-bank' && <TrustBankCase onClose={closeCase} />}
              {route === '#/gamecove' && <GameCoveCase onClose={closeCase} />}
              {route === '#/utrada' && (
                <PlaceholderCase name="UTrada" accent="#8301D5" onClose={closeCase} nextName="Trust Bank" nextHref="#/trust-bank" />
              )}
            </CaseReveal>
          </ImageLightbox>
        </div>
      ) : (
        // home-min16: page content never goes below 16px (see index.css)
        <div className="home-min16 relative w-full min-h-screen bg-white text-[#0A0A0A] font-inter-tight overflow-x-clip">
          <div className="fixed inset-0 dot-grid-bg pointer-events-none z-0" />

          <main className="relative z-10">
            <ObjectsHero />
            <Work />
            <Experience />
            <WhatIDo />
            <Contact />
          </main>

          <HomeDock />
        </div>
      )}
    </>
  );
}
