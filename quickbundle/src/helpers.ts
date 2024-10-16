import { existsSync } from "node:fs";
import {
	readFile as fsReadFile,
	writeFile as fsWriteFile,
	mkdir,
} from "node:fs/promises";
import { dirname } from "node:path";

import { CWD } from "./constants";

// TS assertion not working properly with arrow function
// @see: https://github.com/microsoft/TypeScript/issues/34523
export function assert(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

export const readFile = fsReadFile;

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
		await mkdir(dir, { recursive: true });
	}

	await fsWriteFile(filePath, content, "utf8");
};
