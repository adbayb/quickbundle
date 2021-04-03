import { useState } from "preact/hooks";

export const App = () => {
	const [counter, setCounter] = useState(0);

	return (
		<>
			<button onClick={() => setCounter(counter + 1)}>Increment</button>
			<div>{counter}</div>
		</>
	);
};
