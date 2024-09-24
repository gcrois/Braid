// spatial_hash.cpp
#include "spatial_hash.hpp"
#include <cmath>
#include <unordered_set>

SpatialHash::SpatialHash(float cellSize) : cellSize(cellSize) {}

void SpatialHash::insertBox(const Box& box) {
    uint32_t id = box.id;
    boxes[id] = box;
    auto cells = getCellsCoveredByBox(box);
    for (const auto& cell : cells) {
        grid[cell].push_back(id);
    }
}

void SpatialHash::updateBox(const Box& box) {
    removeBox(box.id);
    insertBox(box);
}

void SpatialHash::removeBox(uint32_t id) {
    auto it = boxes.find(id);
    if (it != boxes.end()) {
        const Box& oldBox = it->second;
        auto cells = getCellsCoveredByBox(oldBox);
        for (const auto& cell : cells) {
            auto& vec = grid[cell];
            vec.erase(std::remove(vec.begin(), vec.end(), id), vec.end());
            if (vec.empty()) {
                grid.erase(cell);
            }
        }
        boxes.erase(it);
    }
}

std::vector<uint32_t> SpatialHash::queryBox(const Box& box) {
    std::unordered_set<uint32_t> resultSet;
    auto cells = getCellsCoveredByBox(box);
    for (const auto& cell : cells) {
        auto gridIt = grid.find(cell);
        if (gridIt != grid.end()) {
            for (uint32_t id : gridIt->second) {
                const auto& candidateBox = boxes[id];
                // Check for intersection
                if (candidateBox.maxX >= box.minX && candidateBox.minX <= box.maxX &&
                    candidateBox.maxY >= box.minY && candidateBox.minY <= box.maxY) {
                    resultSet.insert(id);
                }
            }
        }
    }
    return std::vector<uint32_t>(resultSet.begin(), resultSet.end());
}

std::vector<std::pair<int, int>> SpatialHash::getCellsCoveredByBox(const Box& box) {
    int minCellX = static_cast<int>(std::floor(box.minX / cellSize));
    int maxCellX = static_cast<int>(std::floor(box.maxX / cellSize));
    int minCellY = static_cast<int>(std::floor(box.minY / cellSize));
    int maxCellY = static_cast<int>(std::floor(box.maxY / cellSize));

    std::vector<std::pair<int, int>> cells;
    for (int x = minCellX; x <= maxCellX; ++x) {
        for (int y = minCellY; y <= maxCellY; ++y) {
            cells.emplace_back(x, y);
        }
    }
    return cells;
}

std::vector<uint32_t> SpatialHash::getAllItems() {
    std::vector<uint32_t> allItems;
    for (const auto& entry : boxes) {
        allItems.push_back(entry.first);
    }
    return allItems;
}

Box& SpatialHash::getBox(uint32_t id) {
    return boxes.at(id);
}
