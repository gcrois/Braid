import { initPyCore, PyCore } from "./py_core";

export type PyWorkerRequest<T extends keyof PyCore> = {
	id: number;
	method: T;
	args: Parameters<PyCore[T]>;
};

export type PyWorkerResponse<T extends keyof PyCore = keyof PyCore> = {
	id: number;
	result: ReturnType<PyCore[T]>;
};

export type CallablePyCoreKeys = {
	[K in keyof PyCore]: PyCore[K] extends (...args: any[]) => any ? K : never;
}[keyof PyCore];

function spawnPyWorker() {
	const url = new URL("./py_worker.js", import.meta.url);
	console.log("spawnPyWorker", url);
	return new Worker(url, {
		type: "module",
	});
}

export class PyWorkerWrapper {
	private worker: Worker;
	private requestId: number = 0;
	private pending = new Map<number, (result: any) => void>();
	private paused = false;
	private queue: Array<{
		request: PyWorkerRequest<keyof PyCore>;
		resolve: (value: any) => void;
	}> = [];
	private _readyPromise: Promise<void>;
	private _resolveReady!: () => void;

	constructor() {
		this.worker = spawnPyWorker();
		this._readyPromise = new Promise((resolve) => {
			this._resolveReady = resolve;
		});
		this.worker.onmessage = (e: MessageEvent<any>) => {
			console.log("onmessage", e);
			if (e.data && e.data.ready) {
				this._resolveReady();
				return;
			}
			const { id, result } = e.data;
			const resolver = this.pending.get(id);
			if (resolver) {
				resolver(result);
				this.pending.delete(id);
			}
		};
	}

	/** Returns a promise that resolves once the worker signals it is ready. */
	ready(): Promise<void> {
		return this._readyPromise;
	}

	/**
	 * Call a method on the worker's core.
	 * @param method The name of the method to call.
	 * @param args Arguments to pass to the method.
	 */
	call<T extends CallablePyCoreKeys>(
		method: T,
		...args: Parameters<PyCore[T]>
	): Promise<ReturnType<PyCore[T]>> {
		const id = this.requestId++;
		const request: PyWorkerRequest<T> = { id, method, args };
		return new Promise((resolve) => {
			const sendRequest = () => {
				this.pending.set(id, resolve);
				this.worker.postMessage(request);
			};
			if (this.paused) {
				this.queue.push({ request, resolve });
			} else {
				sendRequest();
			}
		});
	}

	/** Pause sending further messages; calls made while paused are queued. */
	pause(): void {
		this.paused = true;
	}

	/** Resume sending queued messages. */
	resume(): void {
		this.paused = false;
		for (const { request, resolve } of this.queue) {
			this.pending.set(request.id, resolve);
			this.worker.postMessage(request);
		}
		this.queue = [];
	}

	/** Terminate the worker. */
	kill(): void {
		this.worker.terminate();
	}
}

type ProxiedPyCore = {
	[K in keyof PyCore]: PyCore[K] extends (...args: any[]) => any
		? (...args: Parameters<PyCore[K]>) => Promise<ReturnType<PyCore[K]>>
		: never;
};

export type PyWorker = PyWorkerWrapper & ProxiedPyCore;

/**
 * Creates a proxy that allows direct method calls (e.g. pyWorker.fib(10))
 * while preserving the PyWorkerWrapper’s own methods (pause, resume, kill).
 * The returned promise resolves once the worker is ready.
 */
export function createPyWorker(): PyWorker {
	const instance = new PyWorkerWrapper();
	return new Proxy(instance, {
		get(target, prop, receiver) {
			// If the property exists on the instance (pause, resume, kill, etc.), return it.
			if (prop in target) {
				return Reflect.get(target, prop, receiver);
			}
			// Otherwise, assume it is a key of PyCore.
			return (...args: unknown[]) =>
				// @ts-ignore - We know that args are spreadable.
				target.call(prop as keyof PyCore, ...args);
		},
	}) as PyWorker;
}
