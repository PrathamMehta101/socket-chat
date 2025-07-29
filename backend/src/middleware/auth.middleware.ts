import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { Request, Response, NextFunction } from "express";

import { Document } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: Document;
    }
  }
}

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorised - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log(decoded);

    if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
      return res.status(401).json({ message: "Unauthorised - Invalid token" });
    }

    const userId = (decoded as jwt.JwtPayload).userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error in protectRoute middleware", error.message);
    } else {
      console.log("Error in protectRoute middleware", error);
    }
    res.status(401).json({ message: "Internal Server Error" });
  }
};
