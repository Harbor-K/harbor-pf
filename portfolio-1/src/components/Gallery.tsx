import React from 'react'
import { Placeholder } from './Placeholder'
import { Reveal } from './Reveal'
import { SHOTS } from '../data'

// Image grid with green pill tags + captions — Leonardo's model-showcase grid.
export function Gallery() {
  return (
    <section className="px-5 pb-28 md:px-[52px]">
      <div className="grid gap-x-3.5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {SHOTS.map((s, i) => (
          <Reveal key={i} delay={(i % 3) * 0.08}>
            <figure className="group">
              <div className="relative aspect-[1/0.92] overflow-hidden rounded-[8px]">
                <Placeholder
                  gradient={s.g}
                  className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                >
                  <span className="absolute right-4 top-4 text-[12px] text-white/60">(Image)</span>
                </Placeholder>
                <div className="absolute inset-0 bg-black/25 transition-opacity duration-500 group-hover:opacity-0" />
                <span className="absolute bottom-4 left-4 rounded-full bg-[#16C45A] px-3 py-1 text-[12px] font-medium text-black">
                  {s.tag}
                </span>
              </div>
              <figcaption className="mt-3 text-[13px] leading-snug text-white/55">{s.cap}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      <div className="mt-14 flex justify-center">
        <a href="#work" className="btn-white h-[48px] px-6 text-[16px]">
          See all work
        </a>
      </div>
    </section>
  )
}
