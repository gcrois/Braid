import { initPyCore } from "./py_core?inline";
import { type initPyCore as initPyCoreT } from "./py_core";

type Core = Awaited<ReturnType<typeof initPyCoreT>>

type WorkerRequest<T extends keyof Core = keyof Core> = {
    id: number;
    method: T;
    args: Core[T] extends (...args: any[]) => any ? Parameters<Core[T]> : never;
};

try {
    (async () => {
        console.log("Worker started");
        const core = await initPyCore();
        console.log("Core initialized");
        // Signal that the module is ready.
        postMessage({ ready: true });
        addEventListener("message", async (e: any) => {
            const { id, method, args } = e.data as WorkerRequest;
            let result;
            try {
                // if the method is not a function, return the value of the property
                if (typeof core[method] !== "function") {
                    result = core[method];
                }
                // if the method is a function, call it with the arguments
                else {
                    // @ts-ignore-error: TS can't infer that args is a tuple here, but I do. I think...
                    result = await core[method](...(args));
                }
            } catch (error) {
                result = error;
            }
            // Reply with the original id to match the request.
            postMessage({ id, result });
        });
    })();
} catch (error) {
    console.error("Worker error", error);
    postMessage({ error });
}
