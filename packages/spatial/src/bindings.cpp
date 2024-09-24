// Bindings.cpp
#include <emscripten/bind.h>
#include "box.hpp"
#include "spatial_hash.hpp"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(module) {
    register_vector<uint32_t>("vector<uint32_t>");

    class_<Box>("Box")
        .constructor<>()
        .constructor<uint32_t, float, float, float, float>()
        .property("id", &Box::id)
        .property("minX", &Box::minX)
        .property("minY", &Box::minY)
        .property("maxX", &Box::maxX)
        .property("maxY", &Box::maxY);

    class_<SpatialHash>("SpatialHash")
        .constructor<float>()
        .function("insertBox", &SpatialHash::insertBox)
        .function("updateBox", &SpatialHash::updateBox)
        .function("getBox", &SpatialHash::getBox, allow_raw_pointers())
        .function("removeBox", &SpatialHash::removeBox)
        .function("queryBox", &SpatialHash::queryBox)
        .function("getAllItems", &SpatialHash::getAllItems);
}
