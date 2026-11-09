import React, { useEffect } from 'react';
import { CaseHeader, NextProjectCard } from './CaseChrome';
import { GameCoveV4Body } from './GameCoveV4';

/**
 * GameCove case study — the body (hero → reflection) is GameCoveV4.tsx, built from Figma
 * "GameCove_v.4 · GameCove colors" (node 1270:562, file 44기 김지현 4차 랜딩페이지) in GameCove's own dark palette,
 * with the Trust Bank page's scroll interactions (reveal, count-up, HMW pop, bouncing cards, pinned 3-feature
 * showcase, Before → After flip cards, magnifier on dense boards).
 * Same chrome as the Trust Bank page: floating header (× · Next UTrada; it turns light-on-dark over the dark
 * body via data-tone) and the next-project card at the end (CaseChrome).
 */

// the UTrada card at the end opens the next case study (hash route on this site)
const NEXT_HREF = '#/utrada';

export function GameCoveCase({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#111114]">
      <CaseHeader onClose={onClose} nextName="UTrada" />
      <main>
        <GameCoveV4Body />
      </main>
      <NextProjectCard name="UTrada" href={NEXT_HREF} />
    </div>
  );
}
