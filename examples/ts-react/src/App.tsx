import { useState } from "react";

interface AppProps {
	label?: string;
}

export const App = (props: AppProps) => {
	const [counter, setCounter] = useState(0);

	return (
		<>
			<button onClick={() => setCounter(counter + 1)}>Increment</button>
			<div>
				${props.label} {counter} Hello
			</div>
		</>
	);
};
