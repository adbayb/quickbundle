import type { Termost } from "termost";

import { readFile as fsReadFile, rm } from "node:fs/promises";
import { resolve } from "node:path";

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

/**
 * Resolve a relative path from the Quickbundle node modules directory.
 * @param paths - Relative paths.
 * @returns The resolved absolute path.
 * @example
 * resolveFromInternalDirectory("dist", "node");
 */
export const resolveFromInternalDirectory = (...paths: string[]) => {
	return resolve(import.meta.dirname, "../", ...paths);
};

/**
 * Resolve a relative path from the current working project directory.
 * @param paths - Relative paths.
 * @returns The resolved absolute path.
 * @example
 * resolveFromExternalDirectory("package.json");
 */
export const resolveFromExternalDirectory = (...paths: string[]) => {
	return resolve(process.cwd(), ...paths);
};

export const createRegExpMatcher = <Keys extends string>(regex: RegExp) => {
	return (value: string) => {
		return regex.exec(value)?.groups as Record<Keys, string> | undefined;
	};
};

export const readFile = async (filePath: string) => {
	return fsReadFile(filePath);
};

export const removePath = async (path: string) => {
	await rm(path, {
		force: true,
		recursive: true,
	});
};

export type CreateCommandContext<CustomContext = unknown> = {
	minification: boolean;
	sourceMaps: boolean;
	standalone: boolean;
} & CustomContext;

export const createCommand = <CommandContext extends CreateCommandContext>(
	program: Termost,
	input: Parameters<Termost["command"]>[0],
) => {
	return program
		.command<CommandContext>(input)
		.option({
			defaultValue: false,
			description: "Enable minification",
			key: "minification",
			name: "minification",
		})
		.option({
			defaultValue: false,
			description: "Enable source maps generation",
			key: "sourceMaps",
			name: "source-maps",
		});
};
