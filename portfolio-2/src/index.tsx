import "./index.css";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { TrustBank } from "./TrustBank";
import { GameCove } from "./GameCove";
import { ProjectsPage, AboutPage } from "./Pages";
import { useScreenInit } from "./useScreenInit.js";

// Hash routes: "#/projects" and "#/about" are landing pages, "#/trust-bank" and "#/gamecove" open the case studies;
// any other hash (#projects, #skills…) is a section of the main page.
function Root() {
  const screen = useScreenInit() as { page?: string } | undefined;
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const is = (route: string, page: string) => hash.startsWith(route) || (!hash.startsWith("#/") && screen?.page === page);
  const isTB = is("#/trust-bank", "trust-bank");
  const isGC = is("#/gamecove", "gamecove");
  const isPJ = is("#/projects", "projects");
  const isAB = is("#/about", "about");
  const page = isTB ? "tb" : isGC ? "gc" : isPJ ? "pj" : isAB ? "ab" : "main";

  useEffect(() => {
    if (page !== "main") {
      window.scrollTo(0, 0);
      // Trust Bank's "Next case study" card points at the other portfolio's GameCove; keep it on this site
      if (page === "tb") {
        const raf = requestAnimationFrame(() => {
          document.querySelectorAll<HTMLAnchorElement>('a[href$="magicpatterns.app/#/gamecove"]').forEach(a => a.setAttribute("href", "#/gamecove"));
        });
        return () => cancelAnimationFrame(raf);
      }
      return;
    }
    // coming back to a section of the main page: jump to that section (top for #top / no hash)
    const id = window.location.hash.slice(1);
    if (!id || id.startsWith("/") || id === "top") { window.scrollTo(0, 0); return; }
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: "instant" as ScrollBehavior });
    });
    return () => cancelAnimationFrame(raf);
  }, [page, hash]);

  if (page === "tb") return <TrustBank key="tb" />;
  if (page === "gc") return <GameCove key="gc" />;
  if (page === "pj") return <ProjectsPage key="pj" />;
  if (page === "ab") return <AboutPage key="ab" />;
  return <App key="main" />;
}

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<Root />);
}
