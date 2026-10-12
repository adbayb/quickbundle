import { readFile as fsReadFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import type { Termost } from "termost";

/**
 * Resolve a relative path from the Quickbundle node modules directory.
 *
 * @example
 * 	resolveFromInternalDirectory("dist", "node");
 *
 * @param paths - Relative paths.
 * @returns The resolved absolute path.
 */
export const resolveFromInternalDirectory = (...paths: string[]) => {
	return resolve(import.meta.dirname, "../", ...paths);
};

/**
 * Resolve a relative path from the current working project directory.
 *
 * @example
 * 	resolveFromExternalDirectory("package.json");
 *
 * @param paths - Relative paths.
 * @returns The resolved absolute path.
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

/**
 * Resolve the TypeScript compiler version installed in the external project.
 *
 * @returns The version (for example `7.0.2`), or nothing when TypeScript is not installed.
 */
export const getTypeScriptVersion = () => {
	try {
		const externalRequire = createRequire(resolveFromExternalDirectory("package.json"));
		const { version } = externalRequire("typescript/package.json") as { version: string };

		return version;
	} catch {
		return undefined;
	}
};

export const removePath = async (path: string) => {
	await rm(path, {
		force: true,
		recursive: true,
	});
};

export type CreateCommandContext<CustomContext = unknown> = CustomContext & {
	minification: boolean;
	sourceMaps: boolean;
	standalone: boolean;
};

export const createBuildLikeCommand = <CommandContext extends CreateCommandContext>(
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
