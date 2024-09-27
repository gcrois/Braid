// SpatialHash.hpp
#pragma once
#include "ISpatialIndex.hpp"
#include "Box.hpp"
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

class SpatialHash : public ISpatialIndex {
public:
    SpatialHash(float cellSize);

    void insertBox(const Box& box) override;
    void updateBox(const Box& box) override;
    void removeBox(int id) override;
    Box& getBox(int id) override;
    std::vector<int> queryBox(const Box& box) override;
    std::vector<int> getAllItems() override;

private:
    float cellSize;
    std::unordered_map<int, Box> boxes;
    std::unordered_map<std::pair<int, int>, std::vector<int>, pair_hash> grid;

    std::vector<std::pair<int, int>> getCellsCoveredByBox(const Box& box);
};
