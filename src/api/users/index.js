import express from "express";
import createError from "http-errors";
import UserModel from "./model.js";
import {
  JwtAuthMiddleware,
  adminOnly,
  generateAccessToken
} from "../../auth/authMiddlewares.js";
import q2m from "query-to-mongo";

const usersRouter = express.Router();

// Get user by id

usersRouter.get("/:id", JwtAuthMiddleware, async (req, res, next) => {
  const userId = req.params.id === "me" ? req.user._id : req.params.id;
  if (req.params.id !== "me" && !(await adminOnly(req, res, next))) {
    return;
  }
  try {
    const user = await UserModel.findById(userId);
    if (user) {
      res.send(user);
    } else {
      next(createError(404, `User with id ${userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

// Edit user

usersRouter.put("/:id", JwtAuthMiddleware, async (req, res, next) => {
  const userId = req.params.id === "me" ? req.user._id : req.params.id;
  if (req.params.id !== "me" && !(await adminOnly(req, res, next))) {
    return;
  }
  try {
    const user = await UserModel.findByIdAndUpdate(userId, req.body, {
      runValidators: true,
      new: true
    });
    if (user) {
      res.send(user);
    } else {
      next(createError(404, `User with id ${userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

// Delete user

usersRouter.delete("/:id", JwtAuthMiddleware, async (req, res, next) => {
  const userId = req.params.id === "me" ? req.user._id : req.params.id;
  if (req.params.id !== "me" && !(await adminOnly(req, res, next))) {
    return;
  }
  try {
    const user = await UserModel.findByIdAndDelete(userId);
    if (user) {
      res.send(204);
    } else {
      next(createError(404, `User with id ${userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

// login and register

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id, role } = await newUser.save();
    const payload = { _id: newUser._id, role: newUser.role };
    console.log(newUser);
    const accessToken = await generateAccessToken(payload);
    res.send({ accessToken });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.checkCredentials(email, password);
    if (user) {
      const payload = { _id: user._id, role: user.role };
      const accessToken = await generateAccessToken(payload);
      res.send({ accessToken });
    } else {
      next(createError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

// Admin only

usersRouter.get("/", JwtAuthMiddleware, adminOnly, async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const total = await UserModel.countDocuments(query.criteria);
    const users = await UserModel.find(query.criteria, query.options.fields)
      .limit(query.options.limit)
      .skip(query.options.skip)
      .sort(query.options.sort);
    res.send({
      links: query.links("/users", total),
      total,
      users,
      totalPages: Math.ceil(total / query.options.limit)
    });
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
