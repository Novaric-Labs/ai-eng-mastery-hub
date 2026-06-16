import { Config } from "@remotion/cli/config";

// Studio/CLI config. Programmatic renders (scripts/render.mjs) set their own
// options via @remotion/renderer and don't read this file.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setEntryPoint("./src/index.ts");
