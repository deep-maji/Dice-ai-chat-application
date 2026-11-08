import ExpressError from "../utils/ExpressError.js";
import Threads from "../models/threads.model.js";
import extractTitle from "../utils/getTitle.js";
import httpStatus, { status } from "http-status"
import { googleGenAiMain, genarateTitleOfTheThread, streamingChat } from "../services/genai.js";

export const createNewThread = async (req, res, next) => {

  const { prompt, threadId } = req.body;
  const { id, email } = req.userData;
  if (!prompt || !threadId) {
    throw new ExpressError(404, "Prompt is required!");
  }

  const thread = await Threads.findOne({ threadId });
  const history = thread ? thread.messages : [];

  const response = await googleGenAiMain({ prompt, history });
  const contents = response.text;

  const usermessage = {
    role: "user",
    content: prompt,
  }

  const modelmessage = {
    role: "model",
    content: contents,
  }

  let title;
  let save;
  if (!thread) { // first chat
    title = await genarateTitleOfTheThread({ contents });
    title = title.text;

    // title = "Default title";
    const chatPayload = {
      threadId,
      userId: id,
      title: title || "Default title",
      messages: [usermessage, modelmessage]
    }

    const newThread = new Threads(chatPayload);
    save = await newThread.save();
  }
  else { // else chat already exsist
    title = thread.title;
    thread.messages.push(usermessage);
    thread.messages.push(modelmessage);
    save = await thread.save();
  }

  modelmessage.title = title;
  modelmessage._id = save._id;
  res.status(httpStatus.OK).json({ response: modelmessage });
}

export const getAllThreadHistroy = async (req, res, next) => {
  const { id, email } = req.userData;
  const threadHistroy = await Threads.find({ userId: id }, 'title threadId').sort({ updatedAt: -1 });
  res.status(httpStatus.OK).json({ threadHistroy });
}

export const getThreadById = async (req, res, next) => {
  const { id, email } = req.userData;
  const { id: threadId } = req.params;

  const thread = await Threads.findOne({ userId: id, threadId: threadId });
  res.status(httpStatus.OK).json({ response: thread });
}

export const deleteThreadById = async (req, res, next) => {
  const { id, email } = req.userData;
  const { id: mongoThreadId } = req.params;
  await Threads.findByIdAndDelete({ userId: id, _id: mongoThreadId });
  res.status(httpStatus.OK).json({ message: "Thread removed successfully.", status: httpStatus.OK });
}

// export const puterChat = async (req, res, next) => {
