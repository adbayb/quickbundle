import { join } from "node:path";

import { useCallback, useState } from "react";
import type { ReactNode } from "react";

import imageWebp from "./assets/image.webp";
import imageSvg from "./assets/image.svg";
import imagePng from "./assets/image.png";
import imageJpg from "./assets/image.jpg";
import imageJpeg from "./assets/image.jpeg";
import imageGif from "./assets/image.gif";

type AppProps = {
	readonly children?: ReactNode;
};

export const App = (props: AppProps) => {
	const [counter, setCounter] = useState(0);

	const handleClick = useCallback(() => {
		setCounter(counter + 1);
	}, [counter]);

	// eslint-disable-next-line n/no-process-env
	console.log(props, process.env.TZ, join("./", "test"));

	return (
		<>
			<button
				onClick={handleClick}
				type="button"
			>
				Increment
			</button>
			<div>{counter}</div>
			<Image src={imageGif} />
			<Image src={imageJpg} />
			<Image src={imageJpeg} />
			<Image src={imagePng} />
			<Image src={imageSvg} />
			<Image src={imageWebp} />
		</>
	);
};

type ImageProps = {
	readonly src: string;
};

const Image = ({ src }: ImageProps) => {
	return (
		<img
			alt="test"
			src={src}
			width="100"
		/>
	);
};
