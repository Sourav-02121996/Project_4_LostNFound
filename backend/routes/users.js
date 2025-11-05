const express = require("express");
const router = express.Router();
const { getDb } = require("../config/db");
const { ObjectId } = require("mongodb");

// POST /api/users - Create a new user
router.post("/", async (req, res, next) => {
  try {
    const { nuid, name, phone, email, password } = req.body;

    if (!nuid || !name || !phone || !email || !password) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const db = await getDb();
    const usersCollection = db.collection("Users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const newUser = {
      nuid,
      name,
      phone,
      email,
      password,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    res.status(201).json({
      message: "Account created successfully.",
      userId: result.insertedId,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/login - User login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const db = await getDb();
    const usersCollection = db.collection("Users");

    const user = await usersCollection.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful.",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/profile - Get user profile
router.get("/profile", async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const db = await getDb();
    const usersCollection = db.collection("Users");

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/profile - Update user profile
router.put("/profile", async (req, res, next) => {
  try {
    const { userId, nuid, name, phone, email } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const db = await getDb();
    const usersCollection = db.collection("Users");

    const updateData = {};
    if (nuid) updateData.nuid = nuid;
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    updateData.updatedAt = new Date();

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "Profile updated successfully." });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/password - Change user password
router.put("/password", async (req, res, next) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "User ID, current password, and new password are required." });
    }

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const db = await getDb();
    const usersCollection = db.collection("Users");

    const user = await usersCollection.findOne({ _id: new ObjectId(userId), password: currentPassword });
    if (!user) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: newPassword, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

