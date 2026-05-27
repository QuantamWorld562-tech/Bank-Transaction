import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import tokenBlackListModel from "../models/blackList.model.js";

// ─── Helper: extract & validate token (shared logic) ──────────────────────────
const extractToken = (req) =>
    req.cookies?.token || req.headers.authorization?.split(" ")[1];

const verifyToken = async (req, res) => {
    const token = extractToken(req);

    // 1. Token presence check
    if (!token) {
        res.status(401).json({
            message: "Unauthorized: token is missing",
            success: false,
        });
        return null;
    }

    // 2. Blacklist check
    const isBlacklisted = await tokenBlackListModel.findOne({ token });
    if (isBlacklisted) {
        res.status(401).json({
            message: "Unauthorized: token has been revoked",
            success: false,
        });
        return null;
    }

    // 3. Verify & decode
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401).json({
                message: "Unauthorized: user no longer exists",
                success: false,
            });
            return null;
        }

        return user;
    } catch (err) {
        // jwt.verify itself throws on invalid/expired token
        res.status(401).json({
            message: "Unauthorized: token is invalid or expired",
            success: false,
        });
        return null;
    }
};

// ─── Middleware 1: General auth ────────────────────────────────────────────────
export const isAuthenticated = async (req, res, next) => {
    const user = await verifyToken(req, res);
    if (!user) return; // response already sent inside verifyToken

    req.user = user;
    next();
};

// ─── Middleware 2: System/Admin user only ──────────────────────────────────────
export const isSystemUser = async (req, res, next) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const systemUser = await User
        .findById(user._id)
        .select("+systemUser"); // systemUser field excluded by default

    if (!systemUser?.systemUser) {
        return res.status(403).json({
            message: "Forbidden: system user access required",
            success: false,
        });
    }

    req.user = systemUser;
    next();
};