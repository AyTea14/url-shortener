const { rm, cp } = require("fs/promises");

(async () => {
    await rm("dist/config", { recursive: true, force: true });
    await cp("src/config", "dist/config", { recursive: true });
})();
