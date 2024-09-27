// Box.hpp
#pragma once
#include <stdint.h>

struct Box {
    int id;
    float minX, minY;
    float maxX, maxY;
    Box() : id(0), minX(0), minY(0), maxX(0), maxY(0) {}
    Box(uint32_t id, float minX, float minY, float maxX, float maxY)
        : id(id), minX(minX), minY(minY), maxX(maxX), maxY(maxY) {}
};
