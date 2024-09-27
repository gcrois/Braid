// ISpatialIndex.hpp
#pragma once
#include "Box.hpp"
#include <vector>

class ISpatialIndex {
public:
    virtual ~ISpatialIndex() = default;

    virtual void insertBox(const Box& box) = 0;
    virtual void updateBox(const Box& box) = 0;
    virtual void removeBox(int id) = 0;
    virtual Box& getBox(int id) = 0;
    virtual std::vector<int> queryBox(const Box& box) = 0;
    virtual std::vector<int> getAllItems() = 0;
};
