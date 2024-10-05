import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const PACKAGE_DIRECTORY = join(
	dirname(fileURLToPath(import.meta.url)),
	"../",
);

export const CWD = process.cwd();

export const BUNDLER_OPTIONS = [
	"--config",
	join(PACKAGE_DIRECTORY, "./config/bundler.ts"),
	"--configPlugin",
	"rollup-plugin-swc3",
];
