import type { ReadableStream } from "node:stream/web";
import type { Termost } from "termost";

import decompress from "decompress";
import { createWriteStream } from "node:fs";
import {
	copyFile as fsCopyFile,
	readFile as fsReadFile,
	writeFile as fsWriteFile,
	mkdir,
	rename,
	rm,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

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

	await finished(
		Readable.fromWeb(body as ReadableStream).pipe(
			createWriteStream(filePath),
		),
	);
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
