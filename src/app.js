import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

// app.use: to use middleware
// limit data
app.use(express.json({limit: "16kb"}))
// url configure
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
// read users cookie
app.use(cookieParser())

export { app }