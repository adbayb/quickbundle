import process from "node:process";
import { join } from "node:path";

import { useCallback, useState } from "react";

import imageWebp from "./assets/image.webp";
import imageSvg from "./assets/image.svg";
import imagePng from "./assets/image.png";
import imageJpg from "./assets/image.jpg";
import imageJpeg from "./assets/image.jpeg";
import imageGif from "./assets/image.gif";

export const App = (props) => {
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

const Image = ({ src }) => {
	return (
		<img
			alt="test"
			src={src}
			width="100"
		/>
	);
};
