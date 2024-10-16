import { join } from "node:path";
import { useState } from "react";

import imageGif from "./assets/image.gif";
import imageJpeg from "./assets/image.jpeg";
import imageJpg from "./assets/image.jpg";
import imagePng from "./assets/image.png";
import imageSvg from "./assets/image.svg";
import imageWebp from "./assets/image.webp";

export const App = (props) => {
	const [counter, setCounter] = useState(0);

	console.log(props, process.env.TZ, join("./", "test"));

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

const Image = (props) => {
	return (
		<img
			src={props.src}
			width="100"
		/>
	);
};
