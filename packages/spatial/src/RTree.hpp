// RTree.hpp
#pragma once
#include "ISpatialIndex.hpp"
#include "Box.hpp"
#include <vector>
#include <unordered_map>

// A simple RTree node structure
struct RTreeNode {
    Box mbr; // Minimum bounding rectangle
    std::vector<int> children; // IDs of child boxes
    std::vector<RTreeNode*> childNodes; // Pointers to child nodes
    bool isLeaf;

    RTreeNode(bool leaf);
    ~RTreeNode();
};

class RTree : public ISpatialIndex {
public:
    RTree(int maxEntries = 4);
    ~RTree();

    void insertBox(const Box& box) override;
    void updateBox(const Box& box) override;
    void removeBox(int id) override;
    Box& getBox(int id) override;
    std::vector<int> queryBox(const Box& box) override;
    std::vector<int> getAllItems() override;

private:
    int maxEntries;
    RTreeNode* root;
    std::unordered_map<int, Box> boxes;

    void insert(RTreeNode* node, const Box& box, int id);
    bool remove(RTreeNode* node, const Box& box, int id);
    void query(RTreeNode* node, const Box& box, std::vector<int>& result);
    void adjustTree(RTreeNode* node);
    void splitNode(RTreeNode* node);
    Box combineMBRs(const Box& a, const Box& b);
    bool boxesIntersect(const Box& a, const Box& b);
    void freeNode(RTreeNode* node);
};
