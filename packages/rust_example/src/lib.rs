use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fib(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fib(n - 1) + fib(n - 2),
    }
}

#[wasm_bindgen]
pub fn detect_platform() -> String {
    let global = js_sys::global();

    match js_sys::Reflect::get(&global, &"process".into()) {
        Ok(_) => "NodeJS".to_string(),
        Err(_) => "Web".to_string(),
    }
}
