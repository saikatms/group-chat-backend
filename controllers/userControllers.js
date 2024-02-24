const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const jwt = require("jsonwebtoken");

// signup new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, contact } = req.body;

  if (!name || !email || !password || !contact) {
    return res.status(400).send({ error: "Please Enter all the Feilds" });
    // throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });
  const contactExists = await User.findOne({ contact });
  if (userExists) {
    return res.status(400).json({
      error: "Your E-Mail Id is already Registered",
    });
  }
  if (contactExists) {
    return res.status(400).json({
      error: "Your Mobile is already Registered",
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    contact,
  });

  if (user) {
    return res.status(201).json({
      message: "Success",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, "30d"),
      },
    });
  } else {
    return res.status(400).send({ error: "Failed to create the User" });
    // throw new Error("Failed to create the User");
  }
});

// sign in user
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).send({
      error: "Invalid Credentials OR User not found",
    });
  }
  if (user && (await user.matchPassword(password))) {
    return res.status(200).send({
      message: "Login Successfull",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } else {
    return res.status(401).send({
      error: "Invalid Credentials OR User not found",
    });
  }
});

// Search user
const allUsers = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    return res.status(200).send({ message: "Success", data: users });
  } catch (error) {
    return res.status(401).send({
      error: "Unathorize Access",
    });
  }
});

// get my self
const getmyself = asyncHandler(async (req, res) => {
  try {
    const userDetails = req.user;
    return res.status(200).send({ message: "Success", data: userDetails });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = {
  registerUser,
  authUser,
  allUsers,
  getmyself,
};
