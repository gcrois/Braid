import { useState } from "preact/hooks";
import { ChangeEvent } from "preact/compat";

import { Button } from "@braid/ui";
import { add } from "@braid/utils";
import { initCore } from "@braid/core";

const init = initCore({ assetUrl: "/Braid/core.wasm" });
let core: Awaited<typeof init>;

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
	}

	return (
		<div>
			<input type="text" value={nums.a} onChange={handleNumChange("a")} />
			<input type="text" value={nums.b} onChange={handleNumChange("b")} />
			<Button
				onClick={() => {
					alert(add(Number(nums.a), Number(nums.b)));
				}}
			>
				Add
			</Button>

			<div>
				<input type="text" value={n} onChange={handleNChange} />
				<Button
					onClick={async () => {
						core = await init;
						const result = core._generatePrime(Number(n));
						alert(result);
					}}
				>
					Generate Prime
				</Button>
			</div>
		</div>
	);
}
