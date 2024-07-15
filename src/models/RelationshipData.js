const mongoose = require("mongoose");

const relationshipDataSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  dataId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Data",
    required: true,
  },
  toDataId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Data",
    required: true,
  },
  notes: {
    type: String,
  },
  creationDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now },
  isPrimary: { type: Boolean, required: true, default: false },
});

// Create a compound index on to ensure uniqueness
relationshipDataSchema.index({ dataId: 1, toDataId: 1 }, { unique: true });

const RelationshipData = mongoose.model(
  "relationshipData",
  relationshipDataSchema
);
module.exports = RelationshipData;
