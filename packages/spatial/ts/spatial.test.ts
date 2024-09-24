// spatialHash.test.ts
import { test, expect, beforeAll } from "vitest";
import { initSpatial } from "./index";
import { vector } from "../build/interface";
import { vector_to_array } from "./util";

const init = initSpatial();
let Spatial: Awaited<typeof init>;

beforeAll(async () => {
	Spatial = await init;
});

test("Insert a box", () => {
	const spatialHash = new Spatial.SpatialHash(10.0);

	const box = new Spatial.Box(1, 0, 0, 5, 5);
	spatialHash.insertBox(box);
	const retrieved = spatialHash.getBox(1);
	expect(retrieved).toEqual(box);
});

test("Insert a box with a different id", () => {
	const spatialHash = new Spatial.SpatialHash(10.0);

	const box = new Spatial.Box(1, 0, 0, 5, 5);
	spatialHash.insertBox(box);
	expect(() => spatialHash.getBox(2)).toThrow();
});

test("SpatialHash operations", () => {
	const spatialHash = new Spatial.SpatialHash(10.0);

	const box1 = new Spatial.Box(1, 0, 0, 5, 5);
	const box2 = new Spatial.Box(2, 5, 5, 15, 15);
	const box3 = new Spatial.Box(3, 10, 10, 20, 20);

	spatialHash.insertBox(box1);
	spatialHash.insertBox(box2);
	spatialHash.insertBox(box3);

	// Query a box that should intersect with box2 and box3
	const queryBox = new Spatial.Box(0, 6, 6, 12, 12);
	const result = vector_to_array(spatialHash.queryBox(queryBox));

	expect(result).toContain(2);
	expect(result).toContain(3);
	expect(result).not.toContain(1);

	// Update box1 to a new position overlapping with queryBox
	const newBox1 = new Spatial.Box(1, 8, 8, 14, 14);
	spatialHash.updateBox(newBox1);

	const updatedResult = vector_to_array(spatialHash.queryBox(queryBox));

	expect(updatedResult).toContain(1);
	expect(updatedResult).toContain(2);
	expect(updatedResult).toContain(3);

	// Remove box2
	spatialHash.removeBox(2);

	const finalResult = vector_to_array(spatialHash.queryBox(queryBox));

	expect(finalResult).toContain(1);
	expect(finalResult).not.toContain(2);
	expect(finalResult).toContain(3);
});
