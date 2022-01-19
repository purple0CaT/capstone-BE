import { Server } from "socket.io";
import { app } from "./server";
import { createServer } from "http";
import { ioAuthorization } from "./middlewares/socket.io/socket";
import ChatSchema from "./routes/chats/schema";
import MessageSchema from "./routes/chats/models";
import UserSchema from "./routes/users/schema";
//
export const httpServer = createServer(app);
const io = new Server(httpServer, { allowEIO3: true });
//
io.use(ioAuthorization as any);

io.on("connection", async (socket: any) => {
  const chats = await ChatSchema.find({
    members: socket.user._id,
  });
  chats.map((chat) => {
    socket.join(chat._id.toString());
  });
  // ====================== Messages
  socket.on("sendmessage", async ({ message, room }: any) => {
    console.log("Message", socket.id);
    //
    const newMessage = new MessageSchema({
      sender: socket.user!._id,
      message: message,
    });
    await ChatSchema.findByIdAndUpdate(
      room,
      {
        $push: { history: newMessage },
      },
      { new: true },
    ).populate([
      {
        path: "members",
        select: ["firstname", "lastname", "avatar"],
      },
      {
        path: "history.sender",
        select: ["firstname", "lastname", "avatar"],
      },
    ]);
    const allChats = await ChatSchema.find({
      members: socket.user._id,
    })
      .sort("-updatedAt")
      .populate([
        {
          path: "members",
          select: ["firstname", "lastname", "avatar"],
        },
        {
          path: "history.sender",
          select: ["firstname", "lastname", "avatar"],
        },
      ]);
    io.in(room).emit("message", { chatHistory: allChats[0], allChats });
  });
  // === Join specific room
  socket.on("new-chat-created", async ({ chatId }: any) => {
    socket.join(chatId);
    // console.log("Join", socket.rooms);
    console.log("Joining", socket.id);
  });
  //========
  socket.on("disconnect", async () => {
    const user: any = await UserSchema.findById(socket.user._id);
    user.socket = null;
    await user.save();
  });
});
