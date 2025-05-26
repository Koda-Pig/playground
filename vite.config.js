import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        wakeUp: "wake-up.html",
        matrixRain: "matrix-rain.html",
        reactCheatsheet: "react-cheatsheet.html",
        audioVisualiser: "audio-visualiser/index.html",
        whenPigsFly: "when-pigs-fly/index.html",
        trappedPig: "trappedPig/trapped-pig.html",
        mobileSidescroller: "mobile-sidescroller/index.html",
        knightOfCups: "knight-of-cups/index.html",
        gameStateManagement: "game-state-management/index.html",
      },
    },
    // Ensure source maps are generated for debugging
    sourcemap: true,
    // Clean the output directory before each build
    emptyOutDir: true,
  },
})
