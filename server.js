const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")

const formatMessage = require("./utils/message")
const { userJoin, getCurrentUser } = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//Set static folder
app.use(express.static(path.join(__dirname, "public")))

const botName = "Chatchord Bot"

//Run when client connets
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room)
    socket.join(user.room)
    //Welcomes client
    socket.emit(
      "message",
      formatMessage(botName, `Welcome ${username} to chatchord`)
    )

    //Broadcast when a user connects
    socket.broadcast.to(user.room)(
      "message",
      formatMessage(botName, `${user.username} has joined the chat`)
    )

    //Listen for a chatMessage
    socket.on("chatMessage", (message) => {
      io.emit("message", formatMessage("User Text", message))
    })
  })

  //Runs when client disconnects
  socket.on("disconnect", () => {
    io.emit("message", formatMessage(botName, "A user has left the chat"))
  })
})

const PORT = 4000 || process.env.PORT

server.listen(PORT, () => {
  console.log(`Server started at port${PORT}`)
})
