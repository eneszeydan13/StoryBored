import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        postit: {
          yellow: "#FEF08A",
          yellowDark: "#FDE047",
          pink: "#FBCFE8",
          pinkDark: "#F9A8D4",
          cyan: "#BAE6FD",
          cyanDark: "#7DD3FC",
          green: "#BBF7D0",
          greenDark: "#86EFAC",
          purple: "#DDD6FE",
          purpleDark: "#C4B5FD",
          orange: "#FED7AA",
          orangeDark: "#FDBA74",
        },
      },
      boxShadow: {
        postit: "0 10px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.08), 2px 3px 6px rgba(0,0,0,0.15)",
        "postit-hover": "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1), 4px 6px 12px rgba(0,0,0,0.22)",
        "postit-dark": "0 10px 20px -2px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
