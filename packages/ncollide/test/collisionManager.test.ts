// collisionManager.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { CollisionManager } from '../pkg/ncollide_wasm';

describe('CollisionManager with Broad Phase', () => {
  let manager: CollisionManager;

  beforeAll(async () => {
    manager = new CollisionManager();
  });

  it('should insert shapes and query shapes in a bounding box', () => {
    const ballId = manager.insert_polygon([0, 0, 1, 0, 1, 1, 0, 1]);
    const ballId2 = manager.insert_ball(5, 5, 1);

    const shapesInBox = manager.query_shapes_in_box(-100, -100, 100, 100) as number[];
    console.log(shapesInBox);

    expect(shapesInBox).toContain(ballId);
    expect(shapesInBox).not.toContain(ballId2);
  });

  it('should find the nearest neighbor to a point', () => {
    const ballId = manager.insert_ball(0, 0, 1);
    const ballId2 = manager.insert_ball(5, 5, 1);

    const nearest = manager.find_nearest_neighbor(0.5, 0.5) as number;
    expect(nearest).toEqual(ballId);

    const nearestFar = manager.find_nearest_neighbor(6, 6) as number;
    expect(nearestFar).toEqual(ballId2);
  });

  it('should return null if no shapes exist when finding nearest neighbor', () => {
    const emptyManager = new CollisionManager();
    const nearestValue = emptyManager.find_nearest_neighbor(0, 0);
    expect(nearestValue).toBeNull();
  });

  it('should detect collisions correctly', () => {
    const ballId1 = manager.insert_ball(0, 0, 1);
    const ballId2 = manager.insert_ball(0.5, 0, 1);

    const collisions = manager.query_collisions() as { id1: number; id2: number }[];

    expect(collisions).toContainEqual({ id1: ballId1, id2: ballId2 });
  });
});
