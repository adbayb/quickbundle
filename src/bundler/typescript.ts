import { resolve } from "path";
import ts from "typescript";
import { generateDtsBundle } from "dts-bundle-generator";
import { CWD } from "../constants";

export type TypeScriptConfiguration = {
	target: string;
	jsxImportSource: string | undefined;
	hasJsxRuntime: boolean;
};

export const getTypeScriptConfiguration =
	async (): Promise<TypeScriptConfiguration | null> => {
		try {
			const { jsx, jsxImportSource, target } =
				ts.parseJsonConfigFileContent(
					// eslint-disable-next-line @typescript-eslint/no-var-requires
					require(resolve(CWD, "tsconfig.json")),
					ts.sys,
					CWD
				).options;

			// @note: convert ts target value to esbuild ones (latest value is not supported)
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
		const content = generateDtsBundle([
			{
				filePath: source,
				output: {
					noBanner: true,
				},
			},
		])[0] as string;

		ts.sys.writeFile(destination, content);

		// @todo: see https://github.com/timocov/dts-bundle-generator/blob/5bafb9a0ed97588a2885ce235e2b1b59c7d3bb7b/src/bin/dts-bundle-generator.ts#L264

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
