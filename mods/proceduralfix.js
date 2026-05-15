// Procedural World Generator - Creates worlds using mathematical algorithms
// Author: CuriousUser12
// Description: A machine that generates procedural worlds using Perlin noise and fractals

(() => {
  const procVersion = "1.0.0";

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

  // Register the World Generator machine
  Elements.worldGenerator = {
    name: "world generator",
    category: "machines",
    color: [80, 120, 200],
    behavior: behaviors.SOLID,
    density: 500,
    tempHigh: 3000,
    stateHigh: "lava",
    hardness: 0.8,
    
    onActivate: function(pixel) {
      if (!pixel.worldGenActive) {
        pixel.worldGenActive = true;
        pixel.seed = Math.floor(Math.random() * 10000);
        pixel.scale = 100;
        pixel.octaves = 5;
      }
    },

    onProcess: function(pixel) {
      if (!pixel.worldGenActive) return;

      // Generate terrain around the machine
      const x = pixel.x || 0;
      const y = pixel.y || 0;
      const radius = 30; // Generation radius
      const seed = pixel.seed || 0;

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (Math.random() > 0.3) continue; // Don't generate everywhere

          // Use FBM to determine terrain type
          const noiseValue = fbm(nx, ny, pixel.octaves || 5, 0.5, pixel.scale || 100, seed);
          const normalized = (noiseValue + 1) / 2; // Normalize to 0-1

          // Choose element based on noise value
          let element = null;
          if (normalized < 0.3) {
            element = "water";
          } else if (normalized < 0.5) {
            element = "sand";
          } else if (normalized < 0.7) {
            element = "dirt";
          } else if (normalized < 0.85) {
            element = "stone";
          } else {
            element = "rock";
          }

          // Place element if pixel is empty
          if (pixelMap[ny] && pixelMap[ny][nx] === null) {
            tryPlacePixel(element, nx, ny);
          }
        }
      }
    },

    behavior: [
      [100, 100, () => {
        // Allow activation and processing
      }]
    ]
  };

  // Add to element list
  if (!elementLists.machines) {
    elementLists.machines = [];
  }
  elementLists.machines.push(Elements.worldGenerator);

  console.log(`[Procedural World Generator v${procVersion}] Loaded successfully!`);
  console.log("- Features: FBM terrain generation, Perlin noise, configurable parameters");
  console.log("- Use: Place 'world generator' and activate to generate procedural terrain");
})();
