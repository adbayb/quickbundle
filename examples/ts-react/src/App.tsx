import { useState } from "react";
import type { ReactNode } from "react";

import imageGif from "./assets/image.gif";
import imageJpeg from "./assets/image.jpeg";
import imageJpg from "./assets/image.jpg";
import imagePng from "./assets/image.png";
import imageSvg from "./assets/image.svg";
import imageWebp from "./assets/image.webp";
// eslint-disable-next-line import/no-unassigned-import
import "./types";

type AppProps = {
	children?: ReactNode;
};

export const App = (props: AppProps) => {
	const [counter, setCounter] = useState(0);

	console.log(props);

	return (
		<>
			<button
				onClick={() => {
					setCounter(counter + 1);
				}}
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
	src: string;
};

const Image = (props: ImageProps) => {
	return (
		<img
			src={props.src}
			width="100"
		/>
	);
};
