import { h, render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { initCoreWasm } from "@braid/rust_example";

interface FibAppProps {
	n: number;
}

function FibApp({ n }: FibAppProps): h.JSX.Element {
	const [fibVal, setFibVal] = useState<number | null>(null);

	useEffect(() => {
		let canceled = false;
		(async () => {
			const rustModule = await initCoreWasm();
			if (!canceled) {
				const val = rustModule.fib(n);
				setFibVal(val);
			}
		})();
		return () => {
			canceled = true;
		};
	}, [n]);

	return (
		<div style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
			{fibVal === null ? (
				<p>Calculating...</p>
			) : (
				<p>
					fib({n}) = {fibVal}
				</p>
			)}
		</div>
	);
}

export class MyFibElement extends HTMLElement {
	static get observedAttributes(): string[] {
		return ["n"];
	}

	private root: ShadowRoot;

	constructor() {
		super();
		this.root = this.attachShadow({ mode: "open" });
	}

	connectedCallback(): void {
		this.render();
	}

	attributeChangedCallback(
		name: string,
		_oldValue: string | null,
		_newValue: string | null,
	): void {
		if (name === "n") {
			this.render();
		}
	}

	private render(): void {
		const n: number = parseInt(this.getAttribute("n") || "0", 10);
		render(<FibApp n={n} />, this.root);
	}

	disconnectedCallback(): void {
		render(null, this.root);
	}
}
