import { h, render } from "preact";
import { useState } from "preact/hooks";
import { initCoreWasm } from "@braid/rust_example";

function CounterApp(): h.JSX.Element {
    const [count, setCount] = useState<number>(0);
    const [fibVal, setFibVal] = useState<number | null>(null);

    async function handleClick() {
        setCount(count + 1);

        const rustModule = await initCoreWasm();
        const val = rustModule.fib(count + 1);
        setFibVal(val);
    }

    return (
        <div style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
            <p>Count: {count}</p>
            <button onClick={handleClick}>Increment + fib</button>
            {fibVal !== null && <p>fib({count + 1}) = {fibVal}</p>}
        </div>
    );
}

// The custom element definition
export class MyCounterElement extends HTMLElement {
    private root: ShadowRoot;

    constructor() {
        super();
        this.root = this.attachShadow({ mode: "open" });
    }

    connectedCallback(): void {
        render(<CounterApp />, this.root);
    }

    disconnectedCallback(): void {
        render(null, this.root);
    }
}
