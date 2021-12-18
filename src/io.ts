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
  // === Join specific room
  socket.on("joinroom", async ({ room }: any) => {
    socket.join(room);
  });
  // ====================== Messages
  socket.on("sendmessage", async ({ message, room }: any) => {
    const newMessage = new MessageSchema({
      sender: socket.user!._id,
      message: message,
    });
    const chatHistory = await ChatSchema.findByIdAndUpdate(
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
    io.in(room).emit("message", { chatHistory, allChats });
  });
  //========
  socket.on("disconnect", async () => {
    // console.log("disconnected socket " + socket.id);
    const user: any = await UserSchema.findById(socket.user._id);
    user.socket = null;
    await user.save();
  });
});
