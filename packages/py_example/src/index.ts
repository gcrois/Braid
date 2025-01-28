
import fibPyCode from "./fib.py?raw"; 

export interface PyodideApi {
    pyFib: (n: number) => number;
}

// Global type for the `loadPyodide` function. 
// (If you're using @types/pyodide, you can skip these declarations.)
declare global {
    interface Window {
        loadPyodide?: (opts: { indexURL: string }) => Promise<any>;
    }
}

/**
 * Dynamically load Pyodide from the official CDN, then load fib.py code.
 */
export async function initPyodide(): Promise<PyodideApi> {
    if (!window.loadPyodide) {
        // Insert a <script> tag pointing to the pyodide CDN
        await loadPyodideScript();
    }
    // Now we should have window.loadPyodide
    const pyodide = await window.loadPyodide!({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
    });

    // Load our fib.py code into pyodide
    pyodide.runPython(fibPyCode);

    // We can create a small JS wrapper around the python function.
    // We'll store a reference to the python function so we can call it from JS easily.
    const fibFn = pyodide.globals.get("fib");

    function pyFib(n: number): number {
        // Just call the Python function. .callKwargs() is typical in Pyodide.
        return fibFn(n) as number;
    }

    return { pyFib };
}

/**
 * Utility: Insert the <script> tag to load pyodide.js from CDN if not present.
 */
async function loadPyodideScript(): Promise<void> {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
    script.async = false;
    return new Promise((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
    });
}
