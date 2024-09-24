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
    Box& getBox(decltype(Box::id) id);
    void removeBox(decltype(Box::id) id);

    std::vector<decltype(Box::id)> queryBox(const Box& box);
    std::vector<decltype(Box::id)> getAllItems();

private:
    float cellSize;
    std::unordered_map<decltype(Box::id), Box> boxes;
    std::unordered_map<std::pair<int, int>, std::vector<decltype(Box::id)>, pair_hash> grid;

    std::vector<std::pair<int, int>> getCellsCoveredByBox(const Box& box);
};
