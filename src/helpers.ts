import { promisify } from "util";
import { readFile as fsReadFile } from "fs";
import { CWD } from "./constants";

export const readFile = promisify(fsReadFile);

export const resolveModulePath = (path: string) => {
	try {
		return Boolean(require.resolve(path, { paths: [CWD] }));
	} catch (error) {
		return false;
	}
};

// TS assertion not working properly with arrow function
// @see: https://github.com/microsoft/TypeScript/issues/34523
export function assert(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}
