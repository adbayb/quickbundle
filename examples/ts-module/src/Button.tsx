interface ButtonProps {
	label: string;
}

/**
 * Button component
 */
export const Button = (props: ButtonProps) => {
	return (
		<>
			<button>{props.label}</button> Plop
		</>
	);
};
