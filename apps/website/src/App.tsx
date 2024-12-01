import { useEffect, useState } from "preact/hooks";
import { ChangeEvent } from "preact/compat";
import { initCore } from "@braid/c_example";

// const init = initCore();
// let core: Awaited<typeof init>;

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
		setN(e.target?.value);
	};

	useEffect(() => {
		initCore().then((core) => {
			console.log(core);
			core._main(0, 0);
		});
	});

	return (
		<div>
			<input type="text" value={nums.a} onChange={handleNumChange("a")} />
			<input type="text" value={nums.b} onChange={handleNumChange("b")} />
		</div>
	);
}
