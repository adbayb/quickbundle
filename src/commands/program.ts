import { termost } from "termost";
import { BuildContext, WatchContext } from "./types";

export const program = termost<BuildContext & WatchContext>(
	"The zero-configuration bundler powered by ESBuild"
);
