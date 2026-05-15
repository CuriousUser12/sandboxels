// Procedural World Generator - Auto-generates worlds on game start
// Author: CuriousUser12
// Description: Automatically generates procedural worlds using Perlin noise and fractals

(() => {
  const procVersion = "1.1.0";
  let worldGenerated = false;

  // Perlin Noise implementation for smooth terrain generation
  class PerlinNoise {
    constructor(seed = 0) {
      this.permutation = this.generatePermutation(seed);
      this.p = [...this.permutation, ...this.permutation];
    }

    generatePermutation(seed) {
      const p = Array.from({length: 256}, (_, i) => i);
      // Fisher-Yates shuffle with seed
      for (let i = 255; i > 0; i--) {
        const j = Math.floor((Math.sin(seed + i) * 10000 % 1) * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
      }
      return p;
    }

    fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
      return a + t * (b - a);
    }

    grad(hash, x, y) {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 8 ? y : x;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y) {
      const xi = Math.floor(x) & 255;
      const yi = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = this.fade(xf);
      const v = this.fade(yf);

      const aa = this.p[this.p[xi] + yi];
      const ab = this.p[this.p[xi] + yi + 1];
      const ba = this.p[this.p[xi + 1] + yi];
      const bb = this.p[this.p[xi + 1] + yi + 1];

      const x1 = this.lerp(u, this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf));
      const x2 = this.lerp(u, this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1));
      return this.lerp(v, x1, x2);
    }
  }

  // Fractal Brownian Motion for multi-octave noise
  function fbm(x, y, octaves, persistence, scale, seed) {
    const perlin = new PerlinNoise(seed);
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += amplitude * perlin.noise(x * frequency / scale, y * frequency / scale);
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return value / maxValue;
  }

  // Function to generate the entire world procedurally
  function generateProceduralWorld() {
    if (worldGenerated) return;
    
    console.log(`[Procedural World Generator v${procVersion}] Starting world generation...`);
    
    try {
      const seed = Math.floor(Math.random() * 100000);
      const octaves = 4;
      const scale = 80;
      const persistence = 0.55;

      // Check if we have access to game variables
      if (typeof pixelMap === 'undefined' || typeof width === 'undefined' || typeof height === 'undefined') {
        console.warn('[Procedural World Generator] Game variables not ready, retrying...');
        setTimeout(generateProceduralWorld, 500);
        return;
      }

      console.log(`[Procedural World Generator] Generating world: ${width}x${height} with seed ${seed}`);

      // Generate terrain across entire world
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // Skip if cell already has content
          if (pixelMap[y] && pixelMap[y][x] !== null) {
            continue;
          }

          // Calculate noise value
          const noiseValue = fbm(x, y, octaves, persistence, scale, seed);
          const normalized = (noiseValue + 1) / 2;

          let element = null;

          // Assign elements based on noise (with layers)
          if (normalized < 0.2) {
            element = "water";
          } else if (normalized < 0.35) {
            element = "sand";
          } else if (normalized < 0.5) {
            element = "dirt";
          } else if (normalized < 0.65) {
            element = "grass";
          } else if (normalized < 0.75) {
            element = "stone";
          } else if (normalized < 0.88) {
            element = "rock";
          } else {
            element = "obsidian";
          }

          // Place pixel if valid
          if (element && pixelMap[y]) {
            try {
              tryPlacePixel(element, x, y);
            } catch (e) {
              // Silently skip if element doesn't exist
            }
          }
        }

        // Log progress every 10% of height
        if (y % Math.floor(height / 10) === 0) {
          console.log(`[Procedural World Generator] Progress: ${Math.floor(y / height * 100)}%`);
        }
      }

      worldGenerated = true;
      console.log(`[Procedural World Generator v${procVersion}] World generation complete!`);
    } catch (error) {
      console.error('[Procedural World Generator] Error during generation:', error);
    }
  }

  // Hook into game initialization
  const originalUpdatePixels = (typeof updatePixels !== 'undefined') ? updatePixels : null;

  // Try multiple methods to hook into the game loop
  if (typeof onLoad !== 'undefined') {
    // If game provides onLoad hook
    const originalOnLoad = onLoad || (() => {});
    window.onLoad = function() {
      if (typeof originalOnLoad === 'function') originalOnLoad();
      setTimeout(generateProceduralWorld, 100);
    };
  }

  // Alternative: Hook into update loop with a one-time check
  if (typeof updatePixels !== 'undefined') {
    window.updatePixels = function() {
      if (!worldGenerated) {
        generateProceduralWorld();
      }
      if (originalUpdatePixels) {
        return originalUpdatePixels.apply(this, arguments);
      }
    };
  }

  // Fallback: Generate after a delay (for slower loading)
  setTimeout(() => {
    if (!worldGenerated) {
      console.log('[Procedural World Generator] Using fallback initialization...');
      generateProceduralWorld();
    }
  }, 1000);

  console.log(`[Procedural World Generator v${procVersion}] Loaded successfully!`);
})();
