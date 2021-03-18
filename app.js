require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require("http");
const socketio = require("socket.io");

const { host, port } = process.env;

const usersloginRouter = require("./routes/users_login");
const chatRouter = require("./routes/chat");
const formatMessage = require("./utils/message");
const {
  userJoin,
  getCurrentUser,
  userLeaveChat,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/users", usersloginRouter);
app.use("/chat", chatRouter);

app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";
io.on("connection", (socket) => {
  console.log("new connection !!!");
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to chatCord"));

    // broadcast when user connect
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined chat`)
      );
    //   send users and room info
    io.to(user.room).emit('roomUsers', {
        room:user.room,
        users: getRoomUsers(user.room)
    })
  });

  // listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    console.log(user);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
  socket.on("disconnect", () => {
    const user = userLeaveChat(socket.id);
    if (user) {
      io
      .to(user.room)
      .emit("message", `${user.username} as left the chat`);
    }

  });
});

// run when client disconnect
server.listen(port, () => {
  console.log(`server listen at http://${host}:${port}`);
});

module.exports = app;
