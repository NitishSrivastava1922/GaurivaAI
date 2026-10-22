import { app } from "../config/firebase.js";
import { getAuth } from "firebase-admin/auth";
import User from "../model/userModel.js";
import crypto from "crypto";
import redis from "../../../shared/redis.js";

const getCookie = (req, name) => {
  const cookie = req.headers.cookie;
  if (!cookie) return undefined;

  const value = cookie
    .split(";")
    .map((part) => part.trim().split("="))
    .find(([key]) => key === name)?.[1];

  return value ? decodeURIComponent(value) : undefined;
};

export const login = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Authentication token is required" });
    }
    const decoded = await getAuth(app).verifyIdToken(token);
    const firebaseUser = await getAuth(app).getUser(decoded.uid);

    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: firebaseUser.displayName || decoded.name,
        email: firebaseUser.email || decoded.email,
        avatar: firebaseUser.photoURL || decoded.picture,
      });
    } else {
      user.name = firebaseUser.displayName || decoded.name;
      user.email = firebaseUser.email || decoded.email;
      user.avatar = firebaseUser.photoURL || decoded.picture;
      await user.save();
    }

    const profile = {
      userId: user._id,
      uid: user.firebaseUid,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      plan: user.plan,
      credits: user.credits,
      totalCredits: user.totalCredits,
      planExpiresAt: user.planExpiresAt,
    };
    const sessionId = crypto.randomUUID();

    await redis.set(
      `user-session-${user._id}`,
      sessionId,
      "EX",
      2 * 24 * 60 * 60,
    );
    await redis.set(
      `sessionId:${sessionId}`,
      JSON.stringify(profile),
      "EX",
      2 * 24 * 60 * 60,
    ); // Set session in Redis with 2 days expiration

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: profile,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionId = getCookie(req, "session");
    if (!sessionId) {
      return res.status(204).end();
    }

    await redis.del(`sessionId:${sessionId}`);
    res.clearCookie("session", {
      path: "/",
      sameSite: "strict",
      secure: false,
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updateUserPayment = async (req, res) => {
  try {
    const { plan, credits, userId } = req.body;
    if (!userId || !plan || !Number.isSafeInteger(credits) || credits <= 0) {
      return res.status(400).json({
        message: "Valid userId, plan, and credits are required",
      });
    }
    const user = await User.findOne({ firebaseUid: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.plan = plan;
    user.credits += credits;
    user.totalCredits += credits;
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await user.save();

    const sessionId = await redis.get(`user-session-${user._id}`);

    if (sessionId) {
      await redis.set(
        `sessionId:${sessionId}`,
        JSON.stringify({
          userId: user._id,
          uid: user.firebaseUid,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          plan: user.plan,
          credits: user.credits,
          totalCredits: user.totalCredits,
          planExpiresAt: user.planExpiresAt,
        }),
        "EX",
        2 * 24 * 60 * 60,
      );
    }
    return res.status(200).json({
      success: true,
      user: {
        userId: user._id,
        uid: user.firebaseUid,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `update user payment error:${error}` });
  }
};

export const deductCredits = async (req, res) => {
  try {

    const { userId, agent } = req.body ?? {};

    if (!userId || !agent) {
      return res.status(400).json({
        success: false,
        message: "userId and agent are required",
      });
    }

    const COST = {
      chat: 1,
      search: 5,
      coding: 10,
      pdf: 10,
      ppt: 10,
      image: 10,
      imageGen: 10,
    };


    const requiredCredits = COST[agent] || 1;

    const user = await User.findOneAndUpdate(
      { firebaseUid: userId, credits: { $gte: requiredCredits } },
      { $inc: { credits: -requiredCredits } },
      { new: true },
    );

    if (!user) {
      const userExists = await User.exists({ firebaseUid: userId });
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Not enough credits",
      });
    }


    const sessionId = await redis.get(`user-session-${user._id}`);


    if (!sessionId) {
      console.log("No session mapping found in Redis.");
    } else {
      const updatedSession = {
        userId: user._id,
        uid: user.firebaseUid,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      };

      await redis.set(
        `sessionId:${sessionId}`,
        JSON.stringify(updatedSession),
        "EX",
        2 * 24 * 60 * 60
      );

    }


    return res.status(200).json({
      success: true,
      user: {
        userId: user._id,
        uid: user.firebaseUid,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      },
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
