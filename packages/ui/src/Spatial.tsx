import { useEffect, useState, useRef } from "preact/hooks";
import { initSpatial } from "../../spatial/ts";
import { vector_to_array } from "../../spatial/ts/util";

interface BoxProps {
	id: number;
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
}

const BoxComponent = ({ x, y, width, height, color }: BoxProps) => {
	return (
		<div
			style={{
				position: "absolute",
				left: x,
				top: y,
				width: width,
				height: height,
				backgroundColor: color,
				opacity: 0.5,
			}}
		/>
	);
};

export const SpatialHashVisualizer = () => {
	const [Spatial, setSpatial] = useState<any>(null);
	const [spatialHash, setSpatialHash] = useState<any>(null);
	const [boxes, setBoxes] = useState<BoxProps[]>([]);

	const boxesRef = useRef<BoxProps[]>(boxes);

	useEffect(() => {
		boxesRef.current = boxes;
	}, [boxes]);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			const SpatialModule = await initSpatial();
			if (!isMounted) return;
			setSpatial(SpatialModule);

			const spatialHashInstance = new SpatialModule.SpatialHash(50.0); // Cell size of 50
			setSpatialHash(spatialHashInstance);

			// Generate random boxes
			const initialBoxes: BoxProps[] = [];
			for (let i = 0; i < 100; i++) {
				const box: BoxProps = {
					id: i + 1,
					x: Math.random() * 750, // Assuming canvas width is 800
					y: Math.random() * 550, // Assuming canvas height is 600
					width: 50,
					height: 50,
					color: "blue",
				};
				initialBoxes.push(box);

				const spatialBox = new SpatialModule.Box(
					box.id,
					box.x,
					box.y,
					box.x + box.width,
					box.y + box.height,
				);
				spatialHashInstance.insertBox(spatialBox);
			}
			setBoxes(initialBoxes);
		})();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (!Spatial || !spatialHash) {
			return;
		}

		let animationFrame: number;

		const animate = () => {
			// Update positions
			const newBoxes = boxesRef.current.map((box) => {
				// Random movement
				const dx = (Math.random() - 0.5) * 5;
				const dy = (Math.random() - 0.5) * 5;
				let newX = box.x + dx;
				let newY = box.y + dy;

				// Keep within bounds
				if (newX < 0) newX = 0;
				if (newX + box.width > 800) newX = 800 - box.width;
				if (newY < 0) newY = 0;
				if (newY + box.height > 600) newY = 600 - box.height;

				// Update in spatial hash
				const spatialBox = new Spatial.Box(
					box.id,
					newX,
					newY,
					newX + box.width,
					newY + box.height,
				);
				spatialHash.updateBox(spatialBox);

				return { ...box, x: newX, y: newY };
			});

			// Detect collisions
			const updatedBoxes = newBoxes.map((box) => {
				const queryBox = new Spatial.Box(
					0,
					box.x,
					box.y,
					box.x + box.width,
					box.y + box.height,
				);

				const resultVector = spatialHash.queryBox(queryBox);
				const resultArray = vector_to_array(resultVector);

				// Remove self from results
				const collidingIds = resultArray.filter(
					(id: number) => id !== box.id,
				);

				if (collidingIds.length > 0) {
					return { ...box, color: "red" }; // Colliding boxes are red
				} else {
					return { ...box, color: "blue" }; // Non-colliding boxes are blue
				}
			});

			boxesRef.current = updatedBoxes;
			setBoxes(updatedBoxes);

			animationFrame = requestAnimationFrame(animate);
		};

		animationFrame = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(animationFrame);
		};
	}, [Spatial, spatialHash]);

	return (
		<div
			style={{
				position: "relative",
				width: 800,
				height: 600,
				border: "1px solid black",
				overflow: "hidden",
			}}
		>
			{boxes.map((box) => (
				<BoxComponent key={box.id} {...box} />
			))}
		</div>
	);
};
