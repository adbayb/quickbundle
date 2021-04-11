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

type Color = "green" | "grey";

// @todo: move to @adbayb/terminal-kit
export const coloredText = (text: string, color: Color) => {
	const mappingColor: Record<Color, number> = {
		green: 32,
		grey: 90,
	};

	return `\x1b[${mappingColor[color]}m${text}\x1b[0m`;
};
