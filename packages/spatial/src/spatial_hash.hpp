// spatial_hash.h
#pragma once
#include "box.hpp"
#include <unordered_map>
#include <vector>
#include <utility>

// Hash function for std::pair<int, int>
struct pair_hash {
    std::size_t operator()(const std::pair<int, int>& p) const {
        auto h1 = std::hash<int>{}(p.first);
        auto h2 = std::hash<int>{}(p.second);
        return h1 ^ h2;
    }
};

class SpatialHash {
public:
    SpatialHash(float cellSize);

    void insertBox(const Box& box);
    void updateBox(const Box& box);
    Box& getBox(uint32_t id);
    void removeBox(uint32_t id);

    std::vector<uint32_t> queryBox(const Box& box);
    std::vector<uint32_t> getAllItems();

private:
    float cellSize;
    std::unordered_map<uint32_t, Box> boxes;
    std::unordered_map<std::pair<int, int>, std::vector<uint32_t>, pair_hash> grid;

    std::vector<std::pair<int, int>> getCellsCoveredByBox(const Box& box);
};
