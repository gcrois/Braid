use wasm_bindgen::prelude::*;
use ncollide2d::shape::{Ball, ConvexPolygon, ShapeHandle};
use ncollide2d::pipeline::object::{CollisionGroups, GeometricQueryType};
use ncollide2d::world::CollisionWorld;
use ncollide2d::bounding_volume::AABB;
use ncollide2d::query::PointQuery;
use nalgebra::{Isometry2, Point2};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use ncollide2d::pipeline::CollisionObjectSlabHandle;
use js_sys::{Array, Reflect, Object};
use serde_wasm_bindgen::from_value;
use web_sys::console;

pub type ShapeId = i32;

#[wasm_bindgen]
#[derive(Clone, Copy, Serialize, Deserialize)]
pub struct Point {
    pub x: f32,
    pub y: f32,
}

impl Into<Point2<f32>> for Point {
    fn into(self) -> Point2<f32> {
        Point2::new(self.x, self.y)
    }
}

#[derive(Clone, Copy, Serialize, Deserialize)]
pub struct ShapeUpdate {
    pub shape_id: ShapeId,
    pub x: f32,
    pub y: f32,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct CollisionPair {
    pub id1: ShapeId,
    pub id2: ShapeId,
}

#[wasm_bindgen]
pub struct CollisionManager {
    world: Mutex<CollisionWorld<f32, ShapeId>>,
    next_id: Mutex<i32>,
    handles: Mutex<HashMap<ShapeId, CollisionObjectSlabHandle>>,
}

#[wasm_bindgen]
impl CollisionManager {
    #[wasm_bindgen(constructor)]
    pub fn new() -> CollisionManager {
        CollisionManager {
            world: Mutex::new(CollisionWorld::new(0.02)),
            next_id: Mutex::new(0),
            handles: Mutex::new(HashMap::new()),
        }
    }

    #[wasm_bindgen]
    pub fn insert_ball(&self, x: f32, y: f32, radius: f32) -> i32 {
        let mut world = self.world.lock().unwrap();
        let mut next_id = self.next_id.lock().unwrap();
        let mut handles = self.handles.lock().unwrap();

        let id = *next_id;
        *next_id += 1;

        let shape_id = id;

        let position = Isometry2::translation(x, y);
        let shape = ShapeHandle::new(Ball::new(radius));

        let (handle, _) = world.add(
            position,
            shape,
            CollisionGroups::default(),
            GeometricQueryType::Contacts(0.0, 0.0),
            shape_id,
        );

        handles.insert(shape_id, handle);

        shape_id
    }

    #[wasm_bindgen]
    pub fn insert_polygon(&self, points: JsValue) -> Result<i32, JsValue> {
        let points: Vec<Point> = from_value(points).map_err(|e| JsValue::from_str(&e.to_string()))?;
        let points: Vec<Point2<f32>> = points.into_iter().map(|p| p.into()).collect();    

        let convex_polygon = ConvexPolygon::try_from_points(&points)
            .ok_or_else(|| JsValue::from_str("Invalid convex polygon"))?;

        let mut world = self.world.lock().unwrap();
        let mut next_id = self.next_id.lock().unwrap();
        let mut handles = self.handles.lock().unwrap();

        let id = *next_id;
        *next_id += 1;
        let shape_id = id;

        let position = Isometry2::identity();
        let shape = ShapeHandle::new(convex_polygon);

        let (handle, _) = world.add(
            position,
            shape,
            CollisionGroups::default(),
            GeometricQueryType::Contacts(0.0, 0.0),
            shape_id,
        );

        handles.insert(shape_id, handle);

        Ok(shape_id)
    }

    #[wasm_bindgen]
    pub fn insert_polygons(&self, polygons: JsValue) -> Result<js_sys::Array, JsValue> {
        let polygons: Vec<Vec<Point>> = from_value(polygons).map_err(|e| JsValue::from_str(&e.to_string()))?;
        
        let mut world = self.world.lock().unwrap();
        let mut next_id = self.next_id.lock().unwrap();
        let mut handles = self.handles.lock().unwrap();

        let ids = js_sys::Array::new();

        for points in polygons {
            let points: Vec<Point2<f32>> = points.into_iter().map(|p| p.into()).collect();

            let convex_polygon = ConvexPolygon::try_from_points(&points)
                .ok_or_else(|| JsValue::from_str("Invalid convex polygon"))?;

            let id = *next_id;
            *next_id += 1;

            let shape_id = id;

            let position = Isometry2::identity();
            let shape = ShapeHandle::new(convex_polygon);

            let (handle, _) = world.add(
                position,
                shape,
                CollisionGroups::default(),
                GeometricQueryType::Contacts(0.0, 0.0),
                shape_id,
            );

            handles.insert(shape_id, handle);
            ids.push(&JsValue::from(shape_id));
        }

        Ok(ids)
    }

    #[wasm_bindgen]
    pub fn remove_shape(&self, id: i32) {
        let mut world = self.world.lock().unwrap();
        let mut handles = self.handles.lock().unwrap();

        if let Some(handle) = handles.remove(&id) {
            world.remove(&[handle]);
        }
    }

    #[wasm_bindgen]
    pub fn update_position(&self, id: i32, x: f32, y: f32) {
        let mut world = self.world.lock().unwrap();
        let handles = self.handles.lock().unwrap();

        if let Some(handle) = handles.get(&id) {
            if let Some(object) = world.get_mut(*handle) {
                object.set_position(Isometry2::translation(x, y));
            }
        }
    }

    #[wasm_bindgen]
    pub fn query_collisions(&self) -> js_sys::Array {
        let mut world = self.world.lock().unwrap();

        world.update();

        let collisions = js_sys::Array::new();

        for (h1, h2, _, _) in world.contact_pairs(true) {
            let co1 = world.collision_object(h1).unwrap();
            let co2 = world.collision_object(h2).unwrap();
            let id1 = *co1.data();
            let id2 = *co2.data();

            let pair = js_sys::Object::new();
            js_sys::Reflect::set(&pair, &JsValue::from_str("id1"), &JsValue::from(id1)).unwrap();
            js_sys::Reflect::set(&pair, &JsValue::from_str("id2"), &JsValue::from(id2)).unwrap();
            collisions.push(&pair);
        }

        collisions
    }

    #[wasm_bindgen]
    pub fn remove_shapes(&self, ids: js_sys::Array) {
        let mut world = self.world.lock().unwrap();
        let mut handles = self.handles.lock().unwrap();

        let mut to_remove = Vec::new();

        for id_value in ids.iter() {
            let id = id_value.as_f64().unwrap() as i32;
            if let Some(handle) = handles.remove(&id) {
                to_remove.push(handle);
            }
        }

        world.remove(&to_remove);
    }

    #[wasm_bindgen]
    pub fn update_positions(&self, updates: JsValue) {
        let updates: Vec<ShapeUpdate> = from_value(updates).unwrap();
        let mut world = self.world.lock().unwrap();
        let handles = self.handles.lock().unwrap();

        for update in updates {
            if let Some(handle) = handles.get(&update.shape_id) {
                if let Some(object) = world.get_mut(*handle) {
                    object.set_position(Isometry2::translation(update.x, update.y));
                }
            }
        }
    }

    /// Query shapes that fall within a given bounding box.
    #[wasm_bindgen]
    pub fn query_shapes_in_box(&self, min_x: f32, min_y: f32, max_x: f32, max_y: f32) -> js_sys::Array {
        let world = self.world.lock().unwrap();
        let aabb = AABB::new(Point2::new(min_x, min_y), Point2::new(max_x, max_y));
        let shapes_in_box = js_sys::Array::new();
    
        for (_, co) in world.interferences_with_aabb(&aabb, &CollisionGroups::default()) {
            console::log_1(&format!("Shape in box: {:?}", co.data()).into());
            shapes_in_box.push(&JsValue::from(*co.data()));
        }
    
        shapes_in_box
    }    

    /// Find the nearest neighbor to a given point.
    #[wasm_bindgen]
    pub fn find_nearest_neighbor(&self, x: f32, y: f32) -> JsValue {
        let world = self.world.lock().unwrap();
        let point = Point2::new(x, y);

        let mut min_distance = std::f32::MAX;
        let mut nearest_id = None;

        for (_, co) in world.collision_objects() {
            let distance = co.shape().distance_to_point(&co.position(), &point, true);
            if distance < min_distance {
                min_distance = distance;
                nearest_id = Some(*co.data());
            }
        }

        match nearest_id {
            Some(id) => JsValue::from(id),
            None => JsValue::NULL,
        }
    }
}
