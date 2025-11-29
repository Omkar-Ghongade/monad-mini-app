import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'neo-yellow': '#FFE66D',
        'neo-pink': '#FF6B9D',
        'neo-blue': '#4ECDC4',
        'neo-green': '#95E1D3',
        'neo-orange': '#FFA07A',
        'neo-purple': '#C7CEEA',
        'neo-red': '#FF6B6B',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      },
    },
  },
  plugins: [],
};
export default config;
