import { Spinner } from "picospinner";

console.info("Hello world\n");

console.debug(
	"Debug information",
	JSON.stringify(
		{
			embeddedNodeVersion: process.version,
		},
		undefined,
		2,
	),
);

const spinner = new Spinner("Fake processing");

spinner.start();

const sleep = async (duration = 3000) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};

// oxlint-disable-next-line node/no-top-level-await
await sleep();
spinner.succeed("Finished.");
