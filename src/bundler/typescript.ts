import { resolve } from "path";
import ts from "typescript";
import { Thread, Worker, spawn } from "threads";
import { CWD } from "../constants";

export type TypeScriptConfiguration = {
	target: string;
	jsxImportSource: string | undefined;
	hasJsxRuntime: boolean;
};

const TSCONFIG_PATH = resolve(CWD, "tsconfig.json");

export const getTypeScriptConfiguration =
	async (): Promise<TypeScriptConfiguration | null> => {
		try {
			const { jsx, jsxImportSource, target } =
				ts.parseJsonConfigFileContent(
					// eslint-disable-next-line @typescript-eslint/no-var-requires
					require(TSCONFIG_PATH),
					ts.sys,
					CWD
				).options;

			// Convert ts target value to esbuild ones (latest value is not supported)
			const esbuildTarget =
				!target ||
				[ts.ScriptTarget.ESNext, ts.ScriptTarget.Latest].includes(
					target
				)
					? "esnext"
					: ts.ScriptTarget[target]?.toLowerCase();

			const hasJsxRuntime =
				jsx !== undefined &&
				[ts.JsxEmit["ReactJSX"], ts.JsxEmit["ReactJSXDev"]].includes(
					jsx
				);

			return {
				target: esbuildTarget,
				jsxImportSource,
				hasJsxRuntime,
			};
		} catch (error) {
			return null;
		}
	};

export const generateTypeScriptDeclaration = async ({
	source,
	destination,
}: {
	source: string;
	destination: string;
}) => {
	try {
		const worker = await spawn(new Worker("./workers/dts"));
		const dtsContent = await worker(source);

		ts.sys.writeFile(destination, dtsContent);

		await Thread.terminate(worker);

		return destination;
	} catch (error) {
		throw new Error(`Type generation failed:\n${error}`);
	}
};

export const hasTypeScript = (
	tsConfig: TypeScriptConfiguration | null
): tsConfig is TypeScriptConfiguration => {
	return Boolean(tsConfig);
};
