import { join } from "node:path";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import imageGif from "./assets/image.gif";
import imageJpeg from "./assets/image.jpeg";
import imageJpg from "./assets/image.jpg";
import imagePng from "./assets/image.png";
import imageSvg from "./assets/image.svg";
import imageWebp from "./assets/image.webp";

type AppProps = {
	readonly children?: ReactNode;
};

console.log(process.env.TZ, join("./", "test"));

export const App = (props: AppProps) => {
	const [counter, setCounter] = useState(0);

	const handleClick = useCallback(() => {
		setCounter((state) => {
			return state + 1;
		});
	}, []);

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
			{props.children}
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
