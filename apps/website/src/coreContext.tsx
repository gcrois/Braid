import React, { createContext, useContext, useState, ReactNode } from "react";

import type { initCoreWorker as CreateCCoreWorker } from "@braid/c_example/wasm-worker";
import type { initCoreWorker as CreateRustCoreWorker } from "@braid/rust_example/wasm-worker";
import type { initCoreWorker as CreatePythonCoreWorker } from "@braid/py_example";

export type CCoreWorker = ReturnType<typeof CreateCCoreWorker>;
export type RustCoreWorker = ReturnType<typeof CreateRustCoreWorker>;
export type PyWorker = ReturnType<typeof CreatePythonCoreWorker>;

type CoreModule = CCoreWorker | RustCoreWorker | PyWorker;

export interface CoreData {
	name: string;
	module: CoreModule | null;
	loadInWorker: boolean;
	setLoadInWorker: (value: boolean) => void;
	load: () => Promise<void>;
	unload: () => void;
}

interface CoreContextType {
	cores: CoreData[];
}

const CoreContext = createContext<CoreContextType | undefined>(undefined);

export function useCoreContext(): CoreContextType {
	const context = useContext(CoreContext);
	if (!context) {
		throw new Error("useCoreContext must be used within a CoreProvider");
	}
	return context;
}

export function CoreProvider({ children }: { children: ReactNode }) {
	// --- C Core state ---
	const [cModule, setCModule] = useState<CCoreWorker | null>(null);
	const [cInWorker, setCInWorker] = useState<boolean>(true);

	async function loadCCore(): Promise<void> {
		if (cModule) cModule.terminate();

		console.log("Loading C Core");
		const { initCoreWorker } = await import("@braid/c_example/wasm-worker");
		const core = initCoreWorker();
		await core.ready();
		console.log("C Core loaded");

		setCModule(core);
	}
	function unloadCCore(): void {
		if (cModule) cModule.terminate();
		setCModule(null);
	}

	// --- Rust Core state ---
	const [rustModule, setRustModule] = useState<RustCoreWorker | null>(null);
	const [rustInWorker, setRustInWorker] = useState<boolean>(true);

	async function loadRustCore(): Promise<void> {
		if (rustModule) rustModule.terminate();

		console.log("Loading Rust Core");
		const { initCoreWorker } = await import(
			"@braid/rust_example/wasm-worker"
		);
		const core = initCoreWorker();
		await core.ready();
		console.log("Rust Core loaded");

		setRustModule(core);
	}
	function unloadRustCore(): void {
		if (rustModule) rustModule.terminate();
		setRustModule(null);
	}

	// --- Pyodide Core state ---
	const [pyModule, setPyModule] = useState<PyWorker | null>(null);
	const [pyInWorker, setPyInWorker] = useState<boolean>(true);

	async function loadPyCore(): Promise<void> {
		if (pyModule) pyModule.terminate();

		console.log("Loading Pyodide Core");
		const { initCoreWorker } = await import("@braid/py_example");
		const core = initCoreWorker();
		await core.ready();
		console.log("Pyodide Core loaded");

		setPyModule(core);
	}
	function unloadPyCore(): void {
		if (pyModule) pyModule.terminate();
		setPyModule(null);
	}

	const cores: CoreData[] = [
		{
			name: "C Core",
			module: cModule,
			loadInWorker: cInWorker,
			setLoadInWorker: setCInWorker,
			load: loadCCore,
			unload: unloadCCore,
		},
		{
			name: "Rust Core",
			module: rustModule,
			loadInWorker: rustInWorker,
			setLoadInWorker: setRustInWorker,
			load: loadRustCore,
			unload: unloadRustCore,
		},
		{
			name: "Pyodide Core",
			module: pyModule,
			loadInWorker: pyInWorker,
			setLoadInWorker: setPyInWorker,
			load: loadPyCore,
			unload: unloadPyCore,
		},
	];

	return (
		<CoreContext.Provider value={{ cores }}>
			{children}
		</CoreContext.Provider>
	);
}
