const mongoose = require("mongoose");

const relationshipSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  objectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Object",
    required: true,
  },
  toObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Object",
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["one-to-one", "one-to-many", "many-to-many"],
  },
  creationDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now },
});

// Create a compound index to ensure uniqueness
relationshipSchema.index({ objectId: 1, toObjectId: 1 }, { unique: true });

const Relationship = mongoose.model("relationship", relationshipSchema);
module.exports = Relationship;

