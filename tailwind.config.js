/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 深空背景色系
        space: {
          deepest: "#050816",
          dark: "#0a0e27",
          mid: "#131838",
          light: "#1a1f3a",
        },
        // 暖金色强调色
        gold: {
          DEFAULT: "#f5b942",
          light: "#ffd700",
          soft: "#fce8a8",
        },
        // 电光蓝 CTA 色
        electric: {
          DEFAULT: "#0a84ff",
          dark: "#0071e3",
        },
        // 文字色
        ink: {
          primary: "#f5f5f7",
          secondary: "#a1a1aa",
          muted: "#71717a",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 1.2s ease-out forwards",
        "fade-in-up": "fadeInUp 1s ease-out forwards",
        "fade-in-delay": "fadeInUp 1s ease-out 0.3s forwards",
        "fade-in-delay-2": "fadeInUp 1s ease-out 0.6s forwards",
        "fade-in-delay-3": "fadeInUp 1s ease-out 0.9s forwards",
        "float-slow": "float 6s ease-in-out infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
