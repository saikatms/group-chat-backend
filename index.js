const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const cors = require("cors");
const helmet = require("helmet");
dotenv.config();

const { socket } = require("socket.io");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
// const { PORT, CLIENT_ACCESS_URL } = require("./config/keys");

const app = express();
connectDB();

// socket.io implement

const http = require("http");
const { Server } = require("socket.io");

app.use(cors());
// app.use(function (request, response, next) {
//   response.header("Access-Control-Allow-Origin", "*");
//   response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
// const corsOptions = {
//   origin: "*",
//   credentials: true, //access-control-allow-credentials:true
//   optionSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

const server = http.createServer(app);

app.use(helmet());
app.use(express.json()); //to accept json data
// app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome",
  });
});

// Routes
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use(notFound);
app.use(errorHandler);

// PORT
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server is Running on PORT: http://localhost:${PORT}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_ACCESS_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
io.listen(4000);

io.on("connection", (socket) => {
  console.log("connetcted to Socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(`${userData.name} with _id: ${userData._id} is connected.`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    if (!room) {
      return console.log(`no room is selected by user`);
    }
    socket.join(room);
    console.log(`user joined room. Room _id : ${room._id}`);
  });

  socket.on("typing", (room) => {
    console.log("aaaa", room);
    socket.in(room).emit("typing", {
      senderId: room.senderId,
    });
  });
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    console.log("newMessageRecieved", newMessageRecieved);
    var chat = newMessageRecieved.chat;
    if (!chat) {
      return;
    }
    // if (!chat.users) {
    //   retconsole.log("chat.users is not defined");
    // }

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) {
        return;
      }
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
});
