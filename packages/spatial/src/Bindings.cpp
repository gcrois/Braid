// Bindings.cpp
#include <emscripten/bind.h>
#include "Box.hpp"
#include "ISpatialIndex.hpp"

#include "RTree.hpp"
#include "SpatialHash.hpp"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(module) {
    register_vector<int>("VectorInt");

    class_<Box>("Box")
        .constructor<>()
        .constructor<int, float, float, float, float>()
        .property("id", &Box::id)
        .property("minX", &Box::minX)
        .property("minY", &Box::minY)
        .property("maxX", &Box::maxX)
        .property("maxY", &Box::maxY);

    class_<ISpatialIndex>("ISpatialIndex")
        .function("insertBox", &ISpatialIndex::insertBox)
        .function("updateBox", &ISpatialIndex::updateBox)
        .function("removeBox", &ISpatialIndex::removeBox)
        .function("getBox", &ISpatialIndex::getBox, allow_raw_pointers())
        .function("queryBox", &ISpatialIndex::queryBox)
        .function("getAllItems", &ISpatialIndex::getAllItems);

    class_<RTree, base<ISpatialIndex>>("RTree")
        .constructor<int>();
    
    class_<SpatialHash, base<ISpatialIndex>>("SpatialHash")
        .constructor<float>();
}

