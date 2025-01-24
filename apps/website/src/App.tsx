import { useEffect, useState } from "preact/hooks";
import { ChangeEvent } from "preact/compat";
import { initCore as initCoreC } from "@braid/c_example";
import { initCoreWasm as initCoreRust } from "@braid/rust_example";

export function App() {
	const [nums, setNums] = useState({
		a: "",
		b: "",
	});

	const [n, setN] = useState("");

	const handleNumChange =
		(key: keyof typeof nums) => (e: ChangeEvent<HTMLInputElement>) => {
			setNums((prevNums) => ({
				...prevNums,
				[key]: (e.target as any).value,
			}));
		};

	const handleNChange = (e: ChangeEvent<HTMLInputElement>) => {
		setN((e.target as HTMLInputElement).value);
	};

	useEffect(() => {
        console.log("Initializing C");
		initCoreC().then((core) => {
            console.log("C initialized");
			console.log(core);
			core._main(0, 0);
		});

        console.log("Initializing Rust");
        initCoreRust().then((rust_core) =>{
            console.log("Rust initialized");
            console.log(rust_core);
            rust_core.main();
        });
	});

	return (
		<div>
			<input type="text" value={nums.a} onChange={handleNumChange("a")} />
			<input type="text" value={nums.b} onChange={handleNumChange("b")} />
		</div>
	);
}
