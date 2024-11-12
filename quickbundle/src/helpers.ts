import { finished } from "node:stream/promises";
import { Readable } from "node:stream";
import process from "node:process";
import { dirname, join, resolve } from "node:path";
import {
	copyFile as fsCopyFile,
	readFile as fsReadFile,
	writeFile as fsWriteFile,
	mkdir,
	rename,
	rm,
} from "node:fs/promises";
import { createWriteStream } from "node:fs";

import type { Termost } from "termost";
import decompress from "decompress";

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

export const createDirectory = async (path: string) => {
	await mkdir(path, {
		recursive: true,
	});
};

export const copyFile = async (fromPath: string, toPath: string) => {
	await createDirectory(dirname(toPath));
	await fsCopyFile(fromPath, toPath);
};

export const removePath = async (path: string) => {
	await rm(path, {
		force: true,
		recursive: true,
	});
};

export const readFile = async (filePath: string) => {
	return fsReadFile(filePath);
};

export const writeFile = async (filePath: string, content: string) => {
	await createDirectory(dirname(filePath));
	await fsWriteFile(filePath, content, "utf8");
};

export const download = async (url: string, filePath: string) => {
	await createDirectory(dirname(filePath));

	const { body, ok, status, statusText } = await fetch(url);

	if (!ok) {
		throw new Error(
			`An error ocurred while downloading \`${url}\`. Received \`${status}\` status code with the following message \`${statusText}\`.`,
		);
	}

	if (!body) {
		throw new Error(`Empty body received while downloading \`${url}\`.`);
	}

	await finished(Readable.fromWeb(body).pipe(createWriteStream(filePath)));
};

export const unzip = async (
	input: {
		path: string;
		targetedArchivePath: string;
	},
	output: {
		directoryPath: string;
		filename: string;
	},
) => {
	const { targetedArchivePath } = input;
	const { directoryPath } = output;

	await decompress(input.path, directoryPath, {
		filter(file) {
			return file.path === targetedArchivePath;
		},
	});

	await rename(
		join(directoryPath, targetedArchivePath),
		join(directoryPath, output.filename),
	);
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
