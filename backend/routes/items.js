const express = require("express");
const router = express.Router();
const { getDb } = require("../config/db");
const { ObjectId } = require("mongodb");

// GET /api/items - Get all items with optional search and filters
router.get("/", async (req, res, next) => {
  try {
    const { search, location, category, dateFound, userId, status } = req.query;

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    // Build query filter
    const filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (status) {
      filter.status = status;
    }

    if (location) {
      filter.location = location;
    }

    if (category) {
      filter.category = category;
    }

    if (dateFound) {
      filter.dateFound = dateFound;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const items = await itemsCollection.find(filter).sort({ createdAt: -1 }).toArray();

    res.json(items);
  } catch (error) {
    next(error);
  }
});

// GET /api/items/:id - Get a single item by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid item ID." });
    }

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const item = await itemsCollection.findOne({ _id: new ObjectId(id) });
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
});

// POST /api/items - Create a new item
router.post("/", async (req, res, next) => {
  try {
    const { userId, name, location, description, dateFound, category, image, status } = req.body;

    if (!userId || !name || !location || !description || !dateFound || !category) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const newItem = {
      userId,
      name,
      location,
      description,
      dateFound,
      category,
      image: image || null,
      status: status || "searching", // "searching" or "claimed"
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await itemsCollection.insertOne(newItem);

    res.status(201).json({
      message: "Item created successfully.",
      itemId: result.insertedId,
      item: { ...newItem, _id: result.insertedId },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/items/:id - Update an item
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, description, dateFound, category, image, status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid item ID." });
    }

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const updateData = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (description) updateData.description = description;
    if (dateFound) updateData.dateFound = dateFound;
    if (category) updateData.category = category;
    if (image !== undefined) updateData.image = image;
    if (status) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    updateData.updatedAt = new Date();

    const result = await itemsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.json({ message: "Item updated successfully." });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/items/:id - Delete an item
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid item ID." });
    }

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const result = await itemsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Item not found." });
    }

    res.json({ message: "Item deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// GET /api/items/user/:userId - Get all items by a specific user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const items = await itemsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(items);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

