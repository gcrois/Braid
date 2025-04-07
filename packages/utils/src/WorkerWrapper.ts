interface WorkerRequest {
	id: number;
	method: string;
	args: unknown[];
}

interface WorkerResponse {
	id: number;
	result: unknown;
}

/**
 * A generic wrapper for a Worker whose exported API is described by type T.
 */
export class WorkerWrapper<T extends object> {
	private worker: Worker;
	private requestId = 0;
	private pending = new Map<number, (result: unknown) => void>();
	private _readyPromise: Promise<void>;
	private _resolveReady!: () => void;

	constructor(worker: { url: string | URL } | { raw: string }) {
		console.log("WorkerWrapper constructor", worker);
		let workerScriptUrl: string;
		if ("url" in worker) {
			workerScriptUrl = worker.url.toString();
		} else {
			console.log("Creating worker with raw script", worker.raw);
			workerScriptUrl = URL.createObjectURL(
				new Blob([worker.raw], { type: "application/javascript" }),
			);
		}

		// Pass in the URL to the worker script.
		console.log("Creating worker with URL", workerScriptUrl);
		this.worker = new Worker(workerScriptUrl, { type: "module" });
		this._readyPromise = new Promise<void>((resolve) => {
			this._resolveReady = resolve;
		});
		this.worker.onmessage = (
			e: MessageEvent<WorkerResponse | { ready: true }>,
		) => {
			const data = e.data;
			if ("ready" in data && data.ready) {
				this._resolveReady();
				return;
			}
			const { id, result } = data as WorkerResponse;
			const resolve = this.pending.get(id);
			if (resolve) {
				resolve(result);
				this.pending.delete(id);
			}
		};
		this.worker.onerror = (e) => {
			console.error("Worker error", e);
		};
	}

	/**
	 * Returns a promise that resolves when the worker signals it is ready.
	 */
	public ready(): Promise<void> {
		return this._readyPromise;
	}

	/**
	 * Calls a method on the worker.
	 *
	 * @param method - The key of a function exported by the worker.
	 * @param args - The arguments for that function.
	 * @returns A promise that resolves to the function’s return type.
	 */
	public call<K extends keyof T>(
		method: K,
		...args: any
	): T[K] extends (...args: any[]) => any
		? Promise<ReturnType<T[K]>>
		: never {
		const id = this.requestId++;
		const request: WorkerRequest = { id, method: method as string, args };
		return new Promise((resolve) => {
			this.pending.set(id, resolve);
			this.worker.postMessage(request);
		}) as any;
	}

	/**
	 * Terminates the worker.
	 */
	public terminate(): void {
		this.worker.terminate();
	}
}
