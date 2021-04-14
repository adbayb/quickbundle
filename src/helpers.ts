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

// @note: TS assertion not working properly with arrow function
// @see: https://github.com/microsoft/TypeScript/issues/34523
export function assert(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

// @todo: move to @adbayb/terminal-kit
type TextStyleOptions = {
	color: "green" | "grey";
	modifier?: "bold";
};

export const text = (text: string, { color, modifier }: TextStyleOptions) => {
	const mappingColor: Record<TextStyleOptions["color"], number> = {
		green: 32,
		grey: 90,
	};

	const mappingModifier: Record<
		NonNullable<TextStyleOptions["modifier"]>,
		number
	> = {
		bold: 1,
	};

	return `\x1b[${modifier ? mappingModifier[modifier] + ";" : ""}${
		mappingColor[color]
	}m${text}\x1b[0m`;
};
