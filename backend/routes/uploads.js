import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";

const router = express.Router();

// Stream image binary stored inside Items.imageData
router.get("/item/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid id");
    }

    const db = await getDb();
    const itemsCollection = db.collection("Items");

    const item = await itemsCollection.findOne({ _id: new ObjectId(id) }, { projection: { imageData: 1 } });
    if (!item || !item.imageData || !item.imageData.data) {
      return res.status(404).send("Not found");
    }

    const imageDoc = item.imageData;
    res.setHeader("Content-Type", imageDoc.contentType || "application/octet-stream");
    // Optionally set caching headers
    res.setHeader("Cache-Control", "public, max-age=86400");

    // Send the binary buffer
    return res.send(imageDoc.data.buffer ? imageDoc.data.buffer : imageDoc.data);
  } catch (err) {
    next(err);
  }
});

export default router;
