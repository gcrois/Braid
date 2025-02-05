use std::env;
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
use web_sys::console;

macro_rules! println {
    ($($t:tt)*) => {{
        #[cfg(target_arch = "wasm32")]
        {
            console::log_1(&format!($($t)*).into());
        }

        #[cfg(not(target_arch = "wasm32"))]
        {
            std::println!($($t)*);
        }
    }};
}

#[wasm_bindgen]
pub fn main() {
    let platform = if cfg!(target_arch = "wasm32") {
        "WebAssembly".to_string()
    } else {
        "Native".to_string()
    };

    println!("Message from Rust: core module loaded on {}", platform);
    println!("Fibonacci numbers: {}", (0..10).map(fib).map(|x| x.to_string()).collect::<Vec<_>>().join(", "));
}

#[wasm_bindgen]
pub fn fib(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fib(n - 1) + fib(n - 2),
    }
}

#[wasm_bindgen]
pub fn is_prime(n: u32) -> bool {
    if n <= 1 {
        return false;
    }

    for i in 2..n {
        if n % i == 0 {
            return false;
        }
    }

    true
}

#[wasm_bindgen]
pub fn double_string(s: &str) -> String {
    format!("{}{}", s, s)
}

#[wasm_bindgen]
pub fn detect_platform() -> String {
    let global = js_sys::global();

    match js_sys::Reflect::get(&global, &"process".into()) {
        Ok(_) => "NodeJS".to_string(),
        Err(_) => "Web".to_string(),
    }
}
