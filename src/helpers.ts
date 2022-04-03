import { promisify } from "util";
import { existsSync, readFile as fsReadFile } from "fs";
import { createServer } from "net";
import { spawn } from "child_process";
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

export const getAvailablePortFrom = async (port: number) => {
	return new Promise<number>((resolve) => {
		const server = createServer();

		server.listen(port);
		server.on("listening", () => server.close(() => resolve(port)));
		server.on("error", () => {
			server.listen(++port);
		});
	});
};

export const openBrowser = (filename: string) => {
	const bins = {
		darwin: "open",
		linux: "xdg-open",
	};
	const { platform } = process;

	if (platform !== "darwin" && platform !== "linux") {
		return;
	}

	if (!existsSync(filename)) {
		throw new Error(
			`Unable to find ${filename}.\nPotential solutions:\n1. Create the missing file\n2. Edit the serve entrypoint to match an existing html file`
		);
	}

	spawn(bins[platform], [filename]);
};
