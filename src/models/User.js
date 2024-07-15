const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is Required"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please Enter A Valid Email"],
  },
  clientIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
  ],
  password: {
    type: String,
    required: [true, "Password is Required"],
    minlength: [6, "Password Length must be seven characters minimum"],
  },
  role: {
    type: String,
    enum: ["master admin", "admin", "user"],
    default: "user",
  },
  creationDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const exist = await bcrypt.compare(password.trim(), user.password);
    if (exist) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("User Does Not Exist");
};

const User = mongoose.model("user", userSchema);
module.exports = User;
