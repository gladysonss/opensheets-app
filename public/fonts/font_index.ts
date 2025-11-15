import { Inter, Outfit } from "next/font/google";
import localFont from "next/font/local";

// const aeonik = localFont({
//   src: [
//     {
//       path: "../fonts/aeonik-regular.otf",
//       weight: "400",
//       style: "normal",
//     },
//   ],
// });

const anthropic_sans = localFont({
  src: [
    {
      path: "../fonts/anthropic-sans.woff2",
      weight: "400",
      style: "normal",
    },
  ],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const main_font = anthropic_sans;
const money_font = outfit;
const title_font = inter;

export { main_font, money_font, title_font };
