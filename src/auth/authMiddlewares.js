import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

export const generateAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
};

export const verifyAccessToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) reject(err);
      else resolve(payload);
    });
  });
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    next(createHttpError(403, "You are not allowed to access this resource"));
  } else {
    next();
  }
};

export const hostOnly = (req, res, next) => {
  if (req.user.role !== "host") {
    next(createHttpError(403, "You are not allowed to access this resource"));
  } else {
    next();
  }
};

export const JwtAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Please provide credentials"));
  } else {
    try {
      const token = req.headers.authorization.replace("Bearer ", "");
      const payload = await verifyAccessToken(token);
      req.user = {
        _id: payload._id,
        role: payload.role
      };
      next();
    } catch (error) {
      next(createHttpError(401, "Please provide credentials"));
    }
  }
};
