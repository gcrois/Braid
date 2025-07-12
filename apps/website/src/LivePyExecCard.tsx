import { useState } from "react";
import { useCoreContext } from "./coreContext";
import { initCoreWorker } from "@braid/py_example";

export function LivePyExecCard() {
	const { cores } = useCoreContext();
	// Find Pyodide Core
	const pyCore = cores.find((core) => core.name === "Pyodide Core") as
		| { module: ReturnType<typeof initCoreWorker> }
		| undefined;
	const [code, setCode] = useState(`"hello world" + "!" * 2 ** 3`);
	const [output, setOutput] = useState<string>("");

	async function runPython() {
		if (!pyCore) {
			setOutput("Pyodide Core not loaded");
			return;
		}
		try {
			const result = await pyCore.module.call("eval", code);
			setOutput(String(result));
		} catch (err) {
			setOutput("Error: " + err);
		}
	}

	return (
		<div className="bg-[var(--color-base02)] rounded-lg p-4 mb-4 shadow-md border border-[var(--color-base01)] border-opacity-30">
			<h2 className="mb-2 text-[var(--typography-headings)]">Live Python Execution</h2>
			<textarea
				value={code}
				onInput={(e) => setCode(e.currentTarget.value)}
				rows={5}
				className="w-full mb-2 bg-[var(--color-base03)] text-[var(--typography-body)] border border-[var(--color-base01)] rounded p-2"
			/>
			<button 
				onClick={runPython}
				className="cursor-pointer bg-[var(--color-blue)] text-[var(--color-base3)] border-none rounded py-1 px-3 transition-colors duration-300 hover:bg-[var(--typography-links)]"
			>
				Run Python Code
			</button>
			<pre className="mt-3 p-3 bg-[var(--color-base01)] bg-opacity-20 rounded overflow-auto text-[var(--typography-body)]">{output}</pre>
		</div>
	);
}
