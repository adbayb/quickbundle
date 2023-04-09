import { resolve } from "path";
import ts from "typescript";
import { CWD } from "../../constants";

export type TSConfig = {
	target: string;
	jsxImportSource: string | undefined;
	hasJsxRuntime: boolean;
};

const TSCONFIG_PATH = resolve(CWD, "tsconfig.json");

export const getTSConfig =
	async (): Promise<TSConfig | null> => {
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

