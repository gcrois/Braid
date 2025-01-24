cmake_minimum_required(VERSION 3.24)

project(core LANGUAGES CXX VERSION 1.0)

# Set C++ Standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Source files
file(GLOB_RECURSE CORE_SOURCES src/*.cpp)

if (DEFINED EMSCRIPTEN AND BUILD_WASM)
    # WebAssembly build
    set(CMAKE_BINARY_DIR ${CMAKE_BINARY_DIR}/wasm)
    add_executable(core ${CORE_SOURCES})

    # JavaScript + WebAssembly Output
    set(CMAKE_EXECUTABLE_SUFFIX ".js")
    set_target_properties(core PROPERTIES
        COMPILE_FLAGS "-Os"
        LINK_FLAGS "-Os -s WASM=1 -s INVOKE_RUN=0 -s MODULARIZE=1 -s EXPORT_ES6=1 -lembind --emit-tsd=core.d.ts"
    )
elseif(DEFINED EMSCRIPTEN AND BUILD_JS)
    # JavaScript build
    set(CMAKE_BINARY_DIR ${CMAKE_BINARY_DIR}/js)
    add_executable(core ${CORE_SOURCES})

    # JavaScript Output
    set(CMAKE_EXECUTABLE_SUFFIX ".mjs")
    set_target_properties(core PROPERTIES
        COMPILE_FLAGS "-Os"
        LINK_FLAGS "-Os -s -s WASM=0 -s ENVIRONMENT='web' -s INVOKE_RUN=0 -s MODULARIZE=1 -s USE_ES6_IMPORT_META=0 -s EXPORT_ES6=0 -lembind --emit-tsd=core.d.mts"
    )
else()
    # Native build
    set(CMAKE_BINARY_DIR ${CMAKE_BINARY_DIR}/bin)
    add_executable(core ${CORE_SOURCES})
    target_compile_options(core PRIVATE -Wall -Wextra -O2 -pthread)
    target_link_libraries(core PRIVATE pthread)
endif()
