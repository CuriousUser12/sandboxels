// Procedural World Generator Machine for Sandboxels
// Place the machine and it generates a small 2D world around itself

elements.world_generator = {
    color: ["#3b3b3b", "#555555", "#222222"],
    category: "machines",
    state: "solid",
    density: 9999,
    behavior: behaviors.WALL,
    desc: "A machine that procedurally generates a small world.",

    tick: function(pixel) {
        // Prevent generating forever every tick
        if (pixel.generated) { return; }

        pixel.generated = true;

        var width = 90;      // world width
        var height = 55;     // underground depth
        var startX = pixel.x - Math.floor(width / 2);
        var baseY = pixel.y + 4;

        // Simple random seed
        var seed = Math.random() * 10000;

        function noise(x) {
            return Math.sin((x + seed) * 0.17) * 6 +
                   Math.sin((x + seed) * 0.07) * 10 +
                   Math.sin((x + seed) * 0.31) * 3;
        }

        for (var x = startX; x < startX + width; x++) {
            var surface = Math.floor(baseY + noise(x));

            for (var y = surface; y < surface + height; y++) {
                if (x < 1 || x >= widthPixels - 1 || y < 1 || y >= heightPixels - 1) {
                    continue;
                }

                // Do not replace the machine
                if (x === pixel.x && y === pixel.y) {
                    continue;
                }

                // Only generate in empty space
                if (!isEmpty(x, y, true)) {
                    continue;
                }

                var depth = y - surface;
                var elem = "stone";

                // Terrain layers
                if (depth === 0) {
                    elem = "grass";
                }
                else if (depth < 5) {
                    elem = "dirt";
                }
                else if (depth < 20) {
                    elem = Math.random() < 0.25 ? "gravel" : "stone";
                }
                else {
                    elem = "basalt";
                }

                // Caves
                var caveNoise =
                    Math.sin((x + seed) * 0.21 + y * 0.11) +
                    Math.sin((x + seed) * 0.09 + y * 0.27);

                if (depth > 8 && caveNoise > 1.35) {
                    continue;
                }

                // Ores
                if (depth > 10 && Math.random() < 0.015) {
                    elem = "coal";
                }

                if (depth > 18 && Math.random() < 0.01) {
                    elem = "iron";
                }

                if (depth > 30 && Math.random() < 0.006) {
                    elem = "gold";
                }

                // Deep magma
                if (depth > 42 && Math.random() < 0.015) {
                    elem = "magma";
                }

                createPixel(elem, x, y);
            }

            // Water in lower areas
            if (surface > baseY + 4 && Math.random() < 0.45) {
                for (var wy = surface - 1; wy < surface + 2; wy++) {
                    if (x > 1 && x < widthPixels - 1 && wy > 1 && wy < heightPixels - 1) {
                        if (isEmpty(x, wy, true)) {
                            createPixel("water", x, wy);
                        }
                    }
                }
            }

            // Trees
            if (Math.random() < 0.08) {
                generateTree(x, surface - 1);
            }
        }

        // Visual sign that the machine finished generating
        pixel.color = "#00aa66";
    }
};

function generateTree(x, y) {
    if (x < 4 || x > widthPixels - 5 || y < 6 || y > heightPixels - 10) {
        return;
    }

    // Check vertical space
    for (var i = 0; i < 5; i++) {
        if (!isEmpty(x, y - i, true)) {
            return;
        }
    }

    // Trunk
    for (var t = 0; t < 5; t++) {
        createPixel("wood", x, y - t);
    }

    // Leaves
    for (var dx = -2; dx <= 2; dx++) {
        for (var dy = -6; dy <= -3; dy++) {
            if (Math.abs(dx) + Math.abs(dy + 4) < 4) {
                var lx = x + dx;
                var ly = y + dy;

                if (lx > 1 && lx < widthPixels - 1 && ly > 1 && ly < heightPixels - 1) {
                    if (isEmpty(lx, ly, true)) {
                        createPixel("plant", lx, ly);
                    }
                }
            }
        }
    }
}
