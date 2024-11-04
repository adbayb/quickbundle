import { dirname } from "node:path";
import {
	readFile as fsReadFile,
	writeFile as fsWriteFile,
	mkdir,
} from "node:fs/promises";
import { existsSync } from "node:fs";

import type { Termost } from "termost";

import { CWD } from "./constants";

/**
 * TS assertion not working properly with arrow function.
 * @param condition - The passing condition.
 * @param message - The message to display if error is thrown.
 * @throws
 * @see https://github.com/microsoft/TypeScript/issues/34523
 * @example
 * 	assert(isValidTitle, "The title is not valid. Make sure to...");
 */
export function assert(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

export const readFile = fsReadFile;

export const resolveModulePath = (path: string) => {
	try {
		return Boolean(require.resolve(path, { paths: [CWD] }));
	} catch {
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

export type CreateCommandContext<CustomContext = unknown> = CustomContext & {
	minification: boolean;
	sourceMaps: boolean;
	standalone: boolean;
};

export const createCommand = <CommandContext extends CreateCommandContext>(
	program: Termost,
	input: Parameters<Termost["command"]>[0],
) => {
	return program
		.command<CommandContext>(input)
		.option({
			key: "minification",
			name: "minification",
			description: "Enable minification",
			defaultValue: false,
		})
		.option({
			key: "sourceMaps",
			name: "source-maps",
			description: "Enable source maps generation",
			defaultValue: false,
		});
};
