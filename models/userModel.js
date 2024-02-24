const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, selected: false },
    about: { type: String, default: "Hey there! I am using Chatsapp" },
    contact: { type: Number, required: true },
    pic: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/002/002/341/small_2x/man-wearing-sunglasses-avatar-character-isolated-icon-free-vector.jpg",
    },
  },
  { timestamps: true ,versionKey:false}
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Users = mongoose.model("Users", userSchema,"Users");

module.exports = Users;
