import config from "./config/config.js";
import express from "express";
import ThreadRoute from "./routes/thread.route.js";
import streamingChatRoute from "./routes/StreamingChat.route.js";
import ExpressError from "./utils/ExpressError.js";
import connectToDB from "./config/db/connectDB.js";
import usersRoute from "./routes/users.route.js";
import cros from "cors";
import cookieParser from "cookie-parser";

import Users from "./models/users.model.js";

import emailService from "./services/mail.service.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("trust proxy", 1);
app.use(cros({
  origin: [
    "http://localhost:5173",
    "https://geminigpt-frontend.onrender.com"],
  credentials: true
}));
app.use(cookieParser());

// login & register route
app.use("/api/v1/user", usersRoute);
// chat route
app.use("/api/v1/", ThreadRoute);
// Api v2 Streaimg chat
app.use("/api/v2/", streamingChatRoute);


app.get("/name", async (req, res) => {
  await modelNames();
  res.json({ ok: "ok" });
})

// Handel not matched root
app.all("/*splat", (req, res, next) => {
  next(new ExpressError(404, "Route not found!"));
})

// Error handling middleware
app.use((err, req, res, next) => {
  let { message = "Something wrong in our side", status = 500 } = err;
  console.log(err); // need to remove in Prod.
  res.status(status).json({ status, message: message });
})

app.listen(config.PORT, async () => {
  console.log(`Server is listing at PORT ${config.PORT}`);
  // await emailService();
  await connectToDB();
})