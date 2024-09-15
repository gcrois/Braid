// import { useState } from 'preact/hooks'
// import preactLogo from './assets/preact.svg'
// import viteLogo from '/vite.svg'
// import './app.css'

// export function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vitejs.dev" target="_blank">
//           <img src={viteLogo} class="logo" alt="Vite logo" />
//         </a>
//         <a href="https://preactjs.com" target="_blank">
//           <img src={preactLogo} class="logo preact" alt="Preact logo" />
//         </a>
//       </div>
//       <h1>Vite + Preact</h1>
//       <div class="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/app.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p>
//         Check out{' '}
//         <a
//           href="https://preactjs.com/guide/v10/getting-started#create-a-vite-powered-preact-app"
//           target="_blank"
//         >
//           create-preact
//         </a>
//         , the official Preact + Vite starter
//       </p>
//       <p class="read-the-docs">
//         Click on the Vite and Preact logos to learn more
//       </p>
//     </>
//   )
// }

// import { ChangeEvent, useState } from 'preact'

import { useState } from "preact/hooks";
import { ChangeEvent } from "preact/compat";

import { Button } from "@braid/ui";
import { add } from "@braid/utils";

export function App() {
	const [nums, setNums] = useState({
		a: "",
		b: "",
	});

	const handleNumChange =
		(key: keyof typeof nums) => (e: ChangeEvent<HTMLInputElement>) => {
			setNums((prevNums) => ({
				...prevNums,
				[key]: e.target.value,
			}));
		};

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
		</div>
	);
}
