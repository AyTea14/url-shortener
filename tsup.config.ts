import { defineConfig } from "tsup";

export default defineConfig({
    clean: true,
    dts: false,
    entry: ["src/**/*.ts", "!src/**/*.d.ts"],
    format: ["esm"],
    minify: true,
    skipNodeModulesBundle: true,
    sourcemap: true,
    target: "es2022",
    tsconfig: "src/tsconfig.json",
    bundle: false,
    shims: false,
    keepNames: true,
    splitting: false,
});
