import express from "express";
import AccomodationModel from "./model.js";
import q2m from "query-to-mongo";
import {
  JwtAuthMiddleware,
  adminOnly,
  hostOnly
} from "../../auth/authMiddlewares.js";
import createError from "http-errors";

const accomodationRouter = express.Router();

// EVERYONE

accomodationRouter.get("/", JwtAuthMiddleware, async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const total = await AccomodationModel.countDocuments(query.criteria);
    const accomodations = await AccomodationModel.find(
      query.criteria,
      query.options.fields
    )
      .skip(query.options.skip)
      .limit(query.options.limit)
      .sort(query.options.sort)
      .populate({ path: "user" });
    res.send({
      links: query.links("http://localhost:3001/accomodations", total),
      total,
      accomodations,
      pages: Math.ceil(total / query.options.limit)
    });
  } catch (error) {
    next(error);
  }
});

accomodationRouter.get("/:id", JwtAuthMiddleware, async (req, res, next) => {
  try {
    const accomodation = await AccomodationModel.findById(
      req.params.id
    ).populate({ path: "user" });
    if (accomodation) {
      res.send(accomodation);
    } else {
      next(createError(404, `Accomodation with id ${req.params.id} not found`));
    }
  } catch (error) {
    next(error);
  }
});

accomodationRouter.get(
  "/me",
  JwtAuthMiddleware,
  hostOnly,
  async (req, res, next) => {
    try {
      const accomodations = await AccomodationModel.find({
        user: req.user._id
      }).populate({ path: "user" });
      if (accomodations) {
        res.send(accomodations);
      } else {
        next(createError(404, `Accomodations not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

// HOSTS ONLY

accomodationRouter.post(
  "/",
  JwtAuthMiddleware,
  hostOnly,
  async (req, res, next) => {
    try {
      const newAccomodation = new AccomodationModel({
        ...req.body,
        user: req.user._id
      });
      const { _id } = await newAccomodation.save();
      res.status(201).send(_id);
    } catch (error) {
      next(error);
    }
  }
);

accomodationRouter.put(
  "/me/:id",
  JwtAuthMiddleware,
  hostOnly,
  async (req, res, next) => {
    try {
      const accomodation = await AccomodationModel.findById(
        req.params.id
      ).populate({ path: "user" });
      if (accomodation) {
        const newAccom =
          accomodation.user._id.toString() === req.user._id.toString();

        if (newAccom) {
          const updatedAccomodation = await AccomodationModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
              runValidators: true,
              new: true
            }
          );
          res.send(updatedAccomodation);
        } else {
          next(createError(403, `You are not the owner of this accomodation`));
        }
      } else {
        next(
          createError(404, `Accomodation with id ${req.params.id} not found`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

accomodationRouter.delete(
  "/me/:id",
  JwtAuthMiddleware,
  hostOnly,
  async (req, res, next) => {
    try {
      const accomodation = await AccomodationModel.findById(
        req.params.id
      ).populate({ path: "user" });
      if (accomodation) {
        const newAccom =
          accomodation.user._id.toString() === req.user._id.toString();

        if (newAccom) {
          await AccomodationModel.findByIdAndDelete(req.params.id);
          res.status(204).send();
        } else {
          next(createError(403, `You are not the owner of this accomodation`));
        }
      } else {
        next(
          createError(404, `Accomodation with id ${req.params.id} not found`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// ADMINS ONLY

accomodationRouter.delete(
  "/:id",
  JwtAuthMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const accomodation = await AccomodationModel.findById(
        req.params.id
      ).populate({ path: "user" });
      if (accomodation) {
        await AccomodationModel.findByIdAndDelete(req.params.id);
        res.status(204).send();
      } else {
        next(
          createError(404, `Accomodation with id ${req.params.id} not found`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

accomodationRouter.put(
  "/:id",
  JwtAuthMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const accomodation = await AccomodationModel.findById(
        req.params.id
      ).populate({ path: "user" });
      if (accomodation) {
        const updatedAccomodation = await AccomodationModel.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            runValidators: true,
            new: true
          }
        );
        res.send(updatedAccomodation);
      } else {
        next(
          createError(404, `Accomodation with id ${req.params.id} not found`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default accomodationRouter;
