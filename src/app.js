import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }
))
app.use(express.json({limit: "10mb"})) // to convert the data received into json format
app.use(express.urlencoded({extended: true, limit: "16kb"})) // to interpret the data received through url like +, %20 etc.
app.use(express.static("public"))
app.use(cookieParser()) // used to perform CRUD on cookies stored in user's browser

// routes import 
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import likeRouter from "./routes/like.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import commentRouter from "./routes/comment.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/comments", commentRouter)


export { app }