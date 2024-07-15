const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  objectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Object",
    required: true,
  },
  name: { type: String, required: true },
  internalName: { type: String },
  type: {
    type: String,
    required: true,
    enum: [
      "text",
      "select",
      "file",
      "image", //aws buckets
      "Number",
      "HTML", //tiny mc
      "url", //regex to vslidate
      "date",
      "dateTime",
      "time", //
      "boolean", //checkbox
    ],
  },
  optionsTitle: { type: String },
  options: {
    type: [
      {
        name: String,
        internalName: String,
      },
    ],
  },
  creationDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now },
});

// Make property names belonging to the same object UNIQUE
propertySchema.pre("save", async function (next) {
  // Modify internal name to have all lowercase and underscores between words
  this.internalName = this.name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_");

  // Conditionally set the 'options' field based on the 'type'
  if (this.type !== "select") {
    this.options = undefined; // Remove 'options' property for non-'select' types
  } else {
    this.options.forEach((e) => {
      e.internalName = e.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_");
    });
  }

  try {
    // Check for duplicate internalName within the same objectId
    const existingProperty = await mongoose.model("property").findOne({
      internalName: this.internalName,
      objectId: this.objectId,
    });

    if (existingProperty) {
      const error = new Error(
        `A property with the internal name "${this.internalName}" already exists for the given object.`
      );
      next(error);
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

const Property = mongoose.model("property", propertySchema);
module.exports = Property;
