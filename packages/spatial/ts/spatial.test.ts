// spatialHash.test.ts
import { test, expect, beforeAll } from "vitest";
import { initSpatial } from "./index";

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

