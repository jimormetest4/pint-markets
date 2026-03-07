import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ceefax: {
          cyan: "#00ffff",
          yellow: "#ffff00",
          magenta: "#ff00ff",
          green: "#00ff00",
          red: "#ff0000",
          blue: "#0000ff",
          white: "#ffffff",
        },
      },
      fontFamily: {
        teletext: ['"VT323"', "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
