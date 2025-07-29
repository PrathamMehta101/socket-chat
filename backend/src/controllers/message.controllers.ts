import { Request, Response } from "express";
import User from "../models/user.model";
import Message from "../models/message.model";
import cloudinary from "../lib/cloudinary";

export const getUsersForSidebar = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user?._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error in getUsersForSidebar: ", error.message);
    } else {
      console.log("Error in getUsersForSidebar: ", error);
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user?._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error in getMessages controller: ", error.message);
    } else {
      console.log("Error in getMessages controller: ", error);
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user?._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // todo: realtime functionality goes here => socket.io
    res.status(201).json(newMessage);
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error in sendMessage controller", error.message);
    } else {
      console.log("Error in sendMessage controller", error);
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};
