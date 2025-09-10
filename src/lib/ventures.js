// src/lib/ventures.js
import bannerPerspectiv from "../assets/banners/PerspectivBanner.svg";
import bannerGalow      from "../assets/banners/GalowBanner.svg";
import bannerDaniel     from "../assets/banners/DanielCluckinsBanner.svg";

// If you have logo images in /public/assets, keep these paths.
// (Or swap to imports from src/assets exactly like the banners.)
const logoPerspectiv = "/assets/perspectiv.png";
const logoGalow      = "/assets/galow.png";
const logoDaniel     = "/assets/daniel.png";

export const VENTURES = [
  {
    key: "perspectiv",
    name: "Perspectiv",
    source: "perspectiv",
    banner: bannerPerspectiv,
    logo: logoPerspectiv,
    hasDb: true,
  },
  {
    key: "galow",
    name: "Galow",
    source: null,
    banner: bannerGalow,
    logo: logoGalow,
    hasDb: false,
  },
  {
    key: "daniel-cluckins",
    name: "Daniel Cluckins",
    source: "dagalow",
    banner: bannerDaniel,
    logo: logoDaniel,
    hasDb: true,
  },
];

// quick lookups / helpers
export const byKey = Object.fromEntries(VENTURES.map(v => [v.key, v]));
export const getVenture = (slug) => byKey[slug] || null;

// (optional) handy map if you ever need filter->API source
export const SOURCE_FROM_FILTER = {
  all: "all",
  perspectiv: "perspectiv",
  "daniel-cluckins": "dagalow",
  galow: null,
};
