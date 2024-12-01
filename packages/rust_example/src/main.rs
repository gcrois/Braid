use std::env;

fn fib(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fib(n - 1) + fib(n - 2),
    }
}

fn main() {
    let platform = if cfg!(target_arch = "wasm32") {
        "WebAssembly".to_string()
    } else {
        "Native".to_string()
    };

    println!("Message from Rust: core module loaded on {}", platform);
    println!("Fibonacci numbers: {}", (0..10).map(fib).map(|x| x.to_string()).collect::<Vec<_>>().join(", "));
}
