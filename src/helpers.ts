import { promisify } from "util";
import { readFile as fsReadFile } from "fs";

export const readFile = promisify(fsReadFile);

type Color = "green";

export const coloredText = (text: string, color: Color) => {
	const mappingColor: Record<Color, number> = {
		green: 32,
	};

	return `\x1b[${mappingColor[color]}m${text}\x1b[0m`;
};
