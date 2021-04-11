import { promisify } from "util";
import { readFile as fsReadFile } from "fs";

export const readFile = promisify(fsReadFile);
