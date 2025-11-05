const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const { getDb } = require("./db");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/users", async (req, res, next) => {
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

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Central error handler to avoid leaking stack traces
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
