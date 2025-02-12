import { useState } from "preact/hooks";
import { useCoreContext } from "./coreContext";
import { initCoreWorker } from "@braid/py_example";

export function LivePyExecCard() {
	const { cores } = useCoreContext();
	// Find Pyodide Core
	const pyCore = cores.find((core) => core.name === "Pyodide Core") as { module: Awaited<ReturnType<typeof initCoreWorker>> } | undefined;
	const [code, setCode] = useState("print('Hello from Python')");
	const [output, setOutput] = useState<string>("");

	async function runPython() {
		if (!pyCore) {
			setOutput("Pyodide Core not loaded");
			return;
		}
		try {
            console.log("Calling eval", pyCore);
			const result = await pyCore.module.call("eval", code);
			setOutput(String(result));
		} catch (err) {
			setOutput("Error: " + err);
		}
	}

	return (
		<div className="card">
			<h2>Live Python Execution</h2>
			<textarea
				value={code}
				onInput={(e) => setCode(e.currentTarget.value)}
				rows={5}
				style={{ width: "100%", marginBottom: "0.5rem" }}
			/>
			<button onClick={runPython}>Run Python Code</button>
			<pre className="python-output">{output}</pre>
		</div>
	);
}
