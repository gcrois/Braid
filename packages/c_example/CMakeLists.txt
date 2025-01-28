cmake_minimum_required(VERSION 3.22)

project(core LANGUAGES CXX VERSION 1.0)

# Set C++ Standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ---------------------------------------
# Locate OpenGL, GLFW, GLEW if building native
# ---------------------------------------
if(NOT DEFINED EMSCRIPTEN)
    # For GLFW
    find_package(glfw3 3.3 REQUIRED)
    find_package(GLEW REQUIRED)
    # For OpenGL on desktop
    find_package(OpenGL REQUIRED)
endif()

# --------------------------------------
# Gather source files
# ---------------------------------------
file(GLOB_RECURSE CORE_SOURCES        src/core.cpp)
file(GLOB_RECURSE OPENGL_SOURCES      src/opengl_example.cpp)

# ---------------------------------------
# Emscripten / Native build logic
# ---------------------------------------
if(DEFINED EMSCRIPTEN AND BUILD_WASM)
    # ======================
    # WebAssembly build
    # ======================
    set(CMAKE_BINARY_DIR ${CMAKE_BINARY_DIR}/wasm)

    add_executable(core ${CORE_SOURCES})
    set(CMAKE_EXECUTABLE_SUFFIX ".js")
    set_target_properties(core PROPERTIES
        COMPILE_FLAGS "-Os"
        LINK_FLAGS
          "-Os -sWASM=1 -sINVOKE_RUN=0 -sMODULARIZE=1 -sEXPORT_ES6=1 -lembind --emit-tsd=core.d.ts"
    )

    add_executable(opengl_example ${OPENGL_SOURCES})
    set_target_properties(opengl_example PROPERTIES
        COMPILE_FLAGS "-Os"
        LINK_FLAGS
          "-Os -sMIN_WEBGL_VERSION=2 -sMAX_WEBGL_VERSION=2 -sOFFSCREEN_FRAMEBUFFER=1 -sWASM=1 -sINVOKE_RUN=0 -sMODULARIZE=1 -sEXPORT_ES6=1 -lembind --emit-tsd=opengl_example.d.ts"
    )

elseif(DEFINED EMSCRIPTEN AND BUILD_JS)
    # ======================
    # JavaScript build
    # ======================
    set(CMAKE_BINARY_DIR ${CMAKE_BINARY_DIR}/js)

    add_executable(core ${CORE_SOURCES})
    set(CMAKE_EXECUTABLE_SUFFIX ".mjs")
    set_target_properties(core PROPERTIES
        COMPILE_FLAGS "-Os"
        LINK_FLAGS
          "-Os -sWASM=0 -sENVIRONMENT='web' -sINVOKE_RUN=0 -sMODULARIZE=1 -sUSE_ES6_IMPORT_META=0 -sEXPORT_ES6=0 -lembind --emit-tsd=core.d.mts"
    )

    add_executable(opengl_example ${OPENGL_SOURCES})
    set_target_properties(opengl_example PROPERTIES
        COMPILE_FLAGS "-Os"
        LINK_FLAGS
          "-Os -sMIN_WEBGL_VERSION=2 -sMAX_WEBGL_VERSION=2 -sOFFSCREEN_FRAMEBUFFER=1 -sWASM=0 -sENVIRONMENT='web' -sINVOKE_RUN=0 -sMODULARIZE=1 -sUSE_ES6_IMPORT_META=0 -sEXPORT_ES6=0 -lembind --emit-tsd=opengl_example.d.mts"
    )

else()
    # ======================
    # Native (desktop) build
    # ======================
    set(CMAKE_BINARY_DIR ${CMAKE_BINARY_DIR}/bin)

    # -- core
    add_executable(core ${CORE_SOURCES})
    target_compile_options(core PRIVATE -Wall -Wextra -O2 -pthread)
    # Link in native libraries
    target_link_libraries(core
        PRIVATE
          pthread
          glfw
          GLEW::GLEW
          OpenGL::GL
    )

    # -- opengl_example
    add_executable(opengl_example ${OPENGL_SOURCES})
    target_compile_options(opengl_example PRIVATE -Wall -Wextra -O2 -pthread)
    target_link_libraries(opengl_example
        PRIVATE
          pthread
          glfw
          GLEW::GLEW
          OpenGL::GL
    )
endif()
