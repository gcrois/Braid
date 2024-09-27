// RTreeIndex.cpp
#include <spatialindex/SpatialIndex.h>
#include <emscripten.h>
#include <vector>
#include <unordered_map>
#include <iostream>
#include <sstream>
#include <cassert>

#include "RTreeIndex.hpp"
#include "Box.hpp"

RTreeIndex::RTreeIndex() {
    // Initialize an in-memory storage manager
    storage = SpatialIndex::StorageManager::createNewMemoryStorageManager();

    // Create a new, empty, RTree with dimensionality 2, minimum load 70%, using "storage" as
    // the StorageManager and the R*-Tree splitting policy.
    indexIdentifier = 1; // Could be any value
    tree = SpatialIndex::RTree::createNewRTree(*storage, 0.7 /* fill factor */, 10 /* index capacity */,
                                 10 /* leaf capacity */, 2 /* dimension */,
                                 SpatialIndex::RTree::RV_RSTAR, indexIdentifier);
}

RTreeIndex::~RTreeIndex() {
    delete tree;
    delete storage;
}

void RTreeIndex::insertBox(const Box& box) {
    boxes[box.id] = box;

    double low[2] = {box.minX, box.minY};
    double high[2] = {box.maxX, box.maxY};
    SpatialIndex::Region r(low, high, 2);

    // Insert the data into the R-tree
    tree->insertData(0, nullptr, r, box.id);
}

void RTreeIndex::insertBoxes(const std::vector<Box>& boxesToInsert) {
    // Bulk insert using a custom data stream
    class DataStream : public SpatialIndex::IDataStream {
    public:
        DataStream(const std::vector<Box>& boxes) : m_boxes(boxes), m_index(0) {}
        ~DataStream() override = default;

        SpatialIndex::IData* getNext() override {
            if (m_index >= m_boxes.size()) return nullptr;

            const Box& box = m_boxes[m_index++];
            double low[2] = {box.minX, box.minY};
            double high[2] = {box.maxX, box.maxY};
            SpatialIndex::Region r(low, high, 2);

            return new SpatialIndex::RTree::Data(0, nullptr, r, box.id);
        }

        bool hasNext() override {
            return m_index < m_boxes.size();
        }

        uint32_t size() override {
            return static_cast<uint32_t>(m_boxes.size());
        }

        void rewind() override {
            m_index = 0;
        }

    private:
        const std::vector<Box>& m_boxes;
        size_t m_index;
    };

    // Insert boxes into the local map and prepare for bulk loading
    for (const auto& box : boxesToInsert) {
        boxes[box.id] = box;
    }

    DataStream ds(boxesToInsert);

    // Perform bulk loading
    delete tree;
    tree = SpatialIndex::RTree::createAndBulkLoadNewRTree(
        SpatialIndex::RTree::BLM_STR,
        ds,
        *storage,
        0.7 /* fill factor */,
        10 /* index capacity */,
        10 /* leaf capacity */,
        2 /* dimension */,
        SpatialIndex::RTree::RV_RSTAR,
        indexIdentifier
    );
}

void RTreeIndex::updateBox(const Box& box) {
    removeBox(box.id);
    insertBox(box);
}

void RTreeIndex::removeBox(int id) {
    auto it = boxes.find(id);
    if (it != boxes.end()) {
        const Box& box = it->second;
        double low[2] = {box.minX, box.minY};
        double high[2] = {box.maxX, box.maxY};
        SpatialIndex::Region r(low, high, 2);

        tree->deleteData(r, id);
        boxes.erase(it);
    }
}

std::vector<int> RTreeIndex::queryBox(const Box& box) {
    double low[2] = {box.minX, box.minY};
    double high[2] = {box.maxX, box.maxY};
    SpatialIndex::Region r(low, high, 2);

    QueryVisitor vis;
    tree->intersectsWithQuery(r, vis);

    std::vector<int> ids;
    for (SpatialIndex::id_type id : vis.results) {
        ids.push_back(static_cast<int>(id));
    }

    return ids;
}

std::vector<int> RTreeIndex::getAllItems() {
    std::vector<int> ids;
    for (const auto& entry : boxes) {
        ids.push_back(entry.first);
    }
    return ids;
}

Box RTreeIndex::getBox(int id) {
    return boxes.at(id);
}
