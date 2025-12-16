import localFont from "next/font/local";

const laranjinha = localFont({
  src: [
    {
      path: "./LaranjinhaTextPro_Rg.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./LaranjinhaDisplayPro_Bd.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

const main_font = laranjinha;
const money_font = laranjinha;
const title_font = laranjinha;

export { main_font, money_font, title_font };
