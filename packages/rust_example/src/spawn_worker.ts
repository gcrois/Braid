import initCore from "@braid/rust_example/wasm";

export type Core = Awaited<ReturnType<typeof initCore>>;

export type WorkerRequest<T extends keyof Core> = {
	id: number;
	method: T;
	args: Core[T] extends (...args: any) => any ? Parameters<Core[T]> : never;
};

export type WorkerResponse<T extends keyof Core = keyof Core> = {
	id: number;
	result: Core[T] extends (...args: any) => any
		? ReturnType<Core[T]>
		: Core[T];
};

export type CallableCoreKeys = {
	[K in keyof Core]: Core[K] extends (...args: any[]) => any ? K : never;
}[keyof Core];

export function spawn_worker() {
	return new Worker(new URL("./worker.ts", import.meta.url), {
		type: "module",
	});
}

//
// Wrapper class that provides a typed call interface, plus pause/resume and kill.
// It also awaits a ready signal from the worker.
//
export class CoreWorkerWrapper {
	private worker: Worker;
	private requestId: number = 0;
	private pending = new Map<number, (result: any) => void>();
	private paused = false;
	private queue: Array<{
		request: WorkerRequest<keyof Core>;
		resolve: (value: any) => void;
	}> = [];
	private _readyPromise: Promise<void>;
	private _resolveReady!: () => void;

	constructor() {
		this.worker = spawn_worker();
		this._readyPromise = new Promise((resolve) => {
			this._resolveReady = resolve;
		});
		this.worker.onmessage = (e: MessageEvent<any>) => {
			console.log("onmessage", e.data);

			// If the worker sends a ready message, resolve the promise.
			if (e.data && e.data.ready) {
				this._resolveReady();
				return;
			}
			// Otherwise, process the WorkerResponse.
			const { id, result } = e.data;
			const resolver = this.pending.get(id);
			if (resolver) {
				resolver(result);
				this.pending.delete(id);
			}
		};
	}

	/**
	 * Returns a promise that resolves when the worker signals it is ready.
	 */
	ready(): Promise<void> {
		return this._readyPromise;
	}

	/**
	 * Call a method on the worker's core.
	 * @param method The name of the method to call.
	 * @param args Arguments to pass to the method.
	 * @returns A promise resolving to the return type of the method.
	 */
	call<T extends CallableCoreKeys>(
		method: T,
		...args: Parameters<Core[T]>
	): Promise<ReturnType<Core[T]>> {
		const id = this.requestId++;
		const request: WorkerRequest<T> = {
			id,
			method,
			args,
		} as WorkerRequest<T>;
		return new Promise((resolve) => {
			const sendRequest = () => {
				this.pending.set(id, resolve);
				this.worker.postMessage(request);
			};
			if (this.paused) {
				// Queue the request until resume() is called.
				this.queue.push({ request, resolve });
			} else {
				sendRequest();
			}
		});
	}

	/**
	 * Pause sending further messages. Calls made while paused are queued.
	 */
	pause(): void {
		this.paused = true;
	}

	/**
	 * Resume sending queued messages.
	 */
	resume(): void {
		this.paused = false;
		for (const { request, resolve } of this.queue) {
			this.pending.set(request.id, resolve);
			this.worker.postMessage(request);
		}
		this.queue = [];
	}

	/**
	 * Terminate the worker.
	 */
	kill(): void {
		this.worker.terminate();
	}
}

/**
 * A helper type that maps each key in Core to a function returning a Promise of its return type.
 */
type ProxiedCore = {
	[K in keyof Core]: Core[K] extends (...args: infer A) => any
		? (...args: A) => Promise<ReturnType<Core[K]>>
		: never;
};

export type CoreWorker = CoreWorkerWrapper & ProxiedCore;

/**
 * Creates a proxy that allows direct method calls (e.g. wrapper._main(0, 0))
 * while also preserving the CoreWorkerWrapper's own methods (pause, resume, kill).
 * This function returns a promise that resolves once the worker has loaded the module.
 */
export function createCoreWorker(): CoreWorker {
	const instance = new CoreWorkerWrapper();
	return new Proxy(instance, {
		get(target, prop, receiver) {
			// If the property exists on the instance (e.g. pause, resume, kill, etc.), return it.
			if (prop in target) {
				// @ts-expect-error: TS can't narrow symbol/number keys here, but it's safe.
				return target[prop];
			}
			// Otherwise, assume it is a key of Core.
			// Return a function that calls the worker's "call" method with the given method name.
			return (...args: unknown[]) =>
				// @ts-ignore-error: TS can't infer that args is a tuple here, but it's safe.
				target.call(prop as keyof Core, ...args);
		},
	}) as CoreWorker;
}
