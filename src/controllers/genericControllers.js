const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const uploadFilesToS3 = require("../utils/fileUpload.js");
const Client = require("../models/Client.js");
const ObjectModel = require("../models/Object.js"); // Renamed to avoid conflict with JavaScript's Object
const Properties = require("../models/Property.js");
const Data = require("../models/Data.js");
const Filter = require("../models/Filter.js");
const Published = require("../models/Published.js");
const Relationship = require("../models/Relationship.js");
const RelationshipData = require("../models/RelationshipData.js");

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname);
  },
});

const upload = multer({ storage: storage });

const isRoleAuthorized = (userRole, collection) => {
  const allowedRoles = {
    client: ["master admin"],
    object: ["master admin", "admin"],
    property: ["master admin", "admin"],
    data: ["master admin", "admin"],
    filter: ["master admin", "admin"],
  };

  return (
    allowedRoles[collection] && allowedRoles[collection].includes(userRole)
  );
};

const getAll = async (req, res) => {
  const { collection } = req.params;
  const queryParams = req.query;
  try {
    const Model = mongoose.model(collection);
    const documents = await Model.find(queryParams);
    res.status(200).json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getById = async (req, res) => {
  const { collection, id } = req.params;
  try {
    const Model = mongoose.model(collection);
    const document = await Model.findById(id);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.status(200).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const create = async (req, res) => {
  const { collection } = req.params;

  upload.any()(req, res, async (err) => {
    if (err) {
      console.log("failed in multer", err);
      return res.status(500).json({ error: err.message });
    }

    try {
      const Model = mongoose.model(collection);

      let fileUrls = {};

      if (req.files) {
        fileUrls = await uploadFilesToS3(req.files);
      }
      const { objectId, ...data } = req.body;

      const newDocument = new Model({
        values: { ...data, ...fileUrls },
        objectId,
      });
      await newDocument.save();

      res.status(201).json({ message: "Document added successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

const update = async (req, res) => {
  const { collection, id } = req.params;
  const { data } = req.body;

  if (!isRoleAuthorized(req.user.role, collection)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const Model = mongoose.model(collection);
    const updatedDocument = await Model.findByIdAndUpdate(
      id,
      { ...data, updateDate: Date.now },
      { new: true }
    );
    if (!updatedDocument) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.status(200).json(updatedDocument);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  const { collection, id } = req.params;
  try {
    const Model = mongoose.model(collection);
    const deletedDocument = await Model.findByIdAndDelete(id);
    if (!deletedDocument) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
