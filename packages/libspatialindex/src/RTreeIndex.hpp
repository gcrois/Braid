// ISpatialIndex.hpp
#pragma once
#include <spatialindex/SpatialIndex.h>
#include <vector>

#include "ISpatialIndex.hpp"
#include "Box.hpp"

class RTreeIndex : public ISpatialIndex {
public:
    RTreeIndex();
    ~RTreeIndex();

    void insertBox(const Box& box);
    void insertBoxes(const std::vector<Box>& boxes);
    void updateBox(const Box& box);
    void removeBox(int id);
    std::vector<int> queryBox(const Box& box);
    std::vector<int> getAllItems();
    Box getBox(int id);

private:
    SpatialIndex::IStorageManager* storage;
    SpatialIndex::ISpatialIndex* tree;
    SpatialIndex::id_type indexIdentifier;
    std::unordered_map<int, Box> boxes; // Map from ID to Box

    class QueryVisitor : public SpatialIndex::IVisitor {
    public:
        std::vector<SpatialIndex::id_type> results;

        void visitNode(const SpatialIndex::INode& n) override {
            // Optional: Implement if you need to process nodes
        }

        void visitData(const SpatialIndex::IData& d) override {
            results.push_back(d.getIdentifier());
        }

        void visitData(std::vector<const SpatialIndex::IData*>& v) override {
            // Not used in this context
        }
    };
};