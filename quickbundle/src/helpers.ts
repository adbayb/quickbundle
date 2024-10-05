import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { dirname, join } from "node:path";

import { CWD, PACKAGE_DIRECTORY } from "./constants";

// TS assertion not working properly with arrow function
// @see: https://github.com/microsoft/TypeScript/issues/34523
export function assert(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

export const readFile = fs.readFile;

export const resolveModulePath = (path: string) => {
	try {
		return Boolean(require.resolve(path, { paths: [CWD] }));
	} catch (error) {
		return false;
	}
};

export const writeFile = async (filePath: string, content: string) => {
	const dir = dirname(filePath);

	if (!existsSync(dir)) {
		await fs.mkdir(dir, { recursive: true });
	}

	await fs.writeFile(filePath, content, "utf8");
};

export const createBundlerCommand = (options: string[]) => {
	const bundlerBinary = join(PACKAGE_DIRECTORY, "./node_modules/.bin/rollup");

	return `${bundlerBinary} ${options.join(" ")}`;
};
