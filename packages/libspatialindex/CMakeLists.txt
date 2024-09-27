cmake_minimum_required(VERSION 3.15)
project(SpatialIndexWasm)

# Set the C++ standard
set(CMAKE_CXX_STANDARD 20)

# Add libspatialindex source directory
add_subdirectory(libspatialindex)

# Add the source files
file(GLOB_RECURSE SOURCES "src/*.cpp")

# Add the include path for libspatialindex headers
include_directories(${CMAKE_SOURCE_DIR}/libspatialindex/include)

# Configure emscripten build options
if (EMSCRIPTEN)
  set(CMAKE_EXECUTABLE_SUFFIX ".js")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -std=gnu++20")
  
  # Emscripten linker flags
  set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -s MODULARIZE=1 -s EXPORT_ES6=1 -s ALLOW_MEMORY_GROWTH=1 --bind -lembind -O3")
  set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -s EXPORTED_RUNTIME_METHODS='[\"ccall\", \"cwrap\"]' -s WASM=1")
  
  # Emit TypeScript declaration file
  set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} --emit-tsd=spatialindex_wasm.d.ts")
endif()

# Create the output library
add_executable(spatialindex_wasm ${SOURCES})

# Link libspatialindex (since it was added as a subdirectory)
target_link_libraries(spatialindex_wasm spatialindex)
