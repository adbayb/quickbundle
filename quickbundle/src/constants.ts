import { fileURLToPath } from "node:url";

export const CWD = process.cwd();

export const BUNDLER_OPTIONS = [
	"--config",
	fileURLToPath(new URL("../config/bundler.ts", import.meta.url)),
	"--configPlugin",
	"rollup-plugin-swc3",
];
