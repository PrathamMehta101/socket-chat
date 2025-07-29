import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export const generateToken = (
  userId: Types.ObjectId,
  req: Request,
  res: Response
) => {
  // creating the token
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  // creating the cookie on the client side
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};
