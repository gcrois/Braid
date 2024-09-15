import { ComponentProps } from "preact";

export const Button = (props: ComponentProps<"button">) => {
	return <button {...props} />;
};
