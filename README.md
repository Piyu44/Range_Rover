# Range Rover Cinematic Scroll Animation

A fullscreen, scroll-controlled image-sequence animation built with Next.js App Router, TypeScript, GSAP ScrollTrigger, Lenis smooth scrolling, and HTML Canvas.

## Features

- **5 Sequential Frame Folders**: Seamless transition across folders `/1` through `/5` (4,800 frames total).
- **High-Performance Canvas Rendering**: Renders frames dynamically using HTML5 Canvas and `requestAnimationFrame`.
- **Lenis Smooth Scrolling**: Momentum-based inertial scrolling integrated with GSAP's ticker.
- **Direction-Aware Lookahead Preloader**: Actively predicts scroll direction and buffers upcoming frames in memory.
- **Zero-Flicker Fallback Engine**: Nearest-frame recovery algorithm ensures the canvas never stalls or flashes blank during rapid scrubs.
- **Git LFS Enabled**: High-resolution image assets tracked via Git Large File Storage.

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **GSAP & ScrollTrigger**
- **Lenis**
- **HTML Canvas 2D**

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Pull Git LFS Assets** (if cloned):
   ```bash
   git lfs pull
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
