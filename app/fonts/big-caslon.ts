import localFont from "next/font/local";

export const bigCaslon = localFont({
  src: [
    // ↙︎ remplace par le vrai nom de ton fichier si différent
    { path: "./fonnts.com-Big_Caslon_CC.otf", weight: "400", style: "normal" },
  ],
  display: "swap",
});
