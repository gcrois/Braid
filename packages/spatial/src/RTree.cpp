// RTree.cpp
#include "RTree.hpp"
#include <algorithm>

RTreeNode::RTreeNode(bool leaf) : isLeaf(leaf) {}

RTreeNode::~RTreeNode() {
    for (auto child : childNodes) {
        delete child;
    }
}

RTree::RTree(int maxEntries) : maxEntries(maxEntries) {
    root = new RTreeNode(true);
}

RTree::~RTree() {
    freeNode(root);
}

void RTree::freeNode(RTreeNode* node) {
    if (node) {
        for (auto child : node->childNodes) {
            freeNode(child);
        }
        delete node;
    }
}

void RTree::insertBox(const Box& box) {
    boxes[box.id] = box;
    insert(root, box, box.id);
}

void RTree::insert(RTreeNode* node, const Box& box, int id) {
    // Simplified insert logic
    node->children.push_back(id);
    node->mbr = combineMBRs(node->mbr, box);
    // Split node if necessary
    if (node->children.size() > maxEntries) {
        splitNode(node);
    }
}

void RTree::splitNode(RTreeNode* node) {
    // Simplified split logic
    // In a real implementation, you'd redistribute entries and create new nodes
}

void RTree::updateBox(const Box& box) {
    removeBox(box.id);
    insertBox(box);
}

void RTree::removeBox(int id) {
    if (boxes.find(id) != boxes.end()) {
        Box box = boxes[id];
        boxes.erase(id);
        remove(root, box, id);
    }
}

bool RTree::remove(RTreeNode* node, const Box& box, int id) {
    // Simplified remove logic
    auto it = std::find(node->children.begin(), node->children.end(), id);
    if (it != node->children.end()) {
        node->children.erase(it);
        return true;
    }
    return false;
}

Box& RTree::getBox(int id) {
    return boxes.at(id);
}

std::vector<int> RTree::queryBox(const Box& box) {
    std::vector<int> result;
    query(root, box, result);
    return result;
}

void RTree::query(RTreeNode* node, const Box& box, std::vector<int>& result) {
    if (!boxesIntersect(node->mbr, box)) {
        return;
    }
    for (int id : node->children) {
        const Box& childBox = boxes[id];
        if (boxesIntersect(childBox, box)) {
            result.push_back(id);
        }
    }
    for (auto childNode : node->childNodes) {
        query(childNode, box, result);
    }
}

std::vector<int> RTree::getAllItems() {
    std::vector<int> ids;
    for (const auto& entry : boxes) {
        ids.push_back(entry.first);
    }
    return ids;
}

Box RTree::combineMBRs(const Box& a, const Box& b) {
    Box mbr;
    mbr.minX = std::min(a.minX, b.minX);
    mbr.minY = std::min(a.minY, b.minY);
    mbr.maxX = std::max(a.maxX, b.maxX);
    mbr.maxY = std::max(a.maxY, b.maxY);
    return mbr;
}

bool RTree::boxesIntersect(const Box& a, const Box& b) {
    return a.minX <= b.maxX && a.maxX >= b.minX &&
           a.minY <= b.maxY && a.maxY >= b.minY;
}
