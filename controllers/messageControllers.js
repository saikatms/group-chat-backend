const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("reacts", "name");
    // .populate("chat");
    return res.status(200).send({ message: "Success", data: messages });
  } catch (error) {
    return res.status(400).send({ error: error.message });
    // throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    // console.log("Invalid data passed into request");
    return res
      .status(400)
      .send({ error: "Invalid data chatId or content missing" });
  }

  let newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    return res.status(200).send({ message: "Success", data: message });
  } catch (error) {
    return res.status(400).send({ error: error.message });
    throw new Error(error.message);
  }
});

const reactOnMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.body;

  if (!messageId) {
    // console.log("Invalid data passed into request");
    return res.status(400).send({ error: "messageId missing" });
  }

  try {
    let updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        $push: {
          reacts: req.user._id,
        },
      },
      { new: true }
    );

    return res.status(200).send({ message: "Success", data: updatedMessage });
  } catch (error) {
    return res.status(400).send({ error: error.message });
    // throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage, reactOnMessage };
