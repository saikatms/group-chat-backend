const express = require("express");
const {
  createGroupChat,
  renameGroup,
  removeUserFromGroup,
  addUserToGroup,
  fetchChats,
  accessChat,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/createGroup").post(protect, createGroupChat);
router.route("/renameGroup").patch(protect, renameGroup);
router.route("/removeUserFromGroup").patch(protect, removeUserFromGroup);
router.route("/addUserToGroup").patch(protect, addUserToGroup);

module.exports = router;
