#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#include <emscripten/val.h>
extern "C" {
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

#include <stdio.h>

enum Platform { Native, Web, NodeJS };
Platform platform = Native;

void detectPlatform() {
#ifdef __EMSCRIPTEN__
    emscripten::val global = emscripten::val::global();
    if (global["process"].as<bool>()) {
        platform = NodeJS;
    } else {
        platform = Web;
    }
#else
    platform = Native;
#endif
}

int EMSCRIPTEN_KEEPALIVE fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }

int main() {
    detectPlatform();
    if (platform == Web) {
        printf("Message from C++: core module loaded in the browser\n");
    } else if (platform == NodeJS) {
        printf("Message from C++: core module loaded in Node.js\n");
    } else {
        printf("Message from C++: core module loaded natively\n");
    }

    // print the first 10 Fibonacci numbers
    printf("Fibonacci numbers: ");
    for (int i = 0; i < 10; i++) {
        printf("%d ", fib(i));
    }
    printf("\n");
    return 0;
}

#ifdef __EMSCRIPTEN__
}
#endif