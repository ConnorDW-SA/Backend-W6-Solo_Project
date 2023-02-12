import mongoose from "mongoose";

export const badRequestErrorHandler = (err, req, res, next) => {
  if (err.status === 400 || err instanceof mongoose.Error.ValidationError) {
    res.status(400).send(err.errorsList);
  } else if (err instanceof mongoose.Error.CastError) {
    res.status(400).send("Invalid ID");
  } else {
    next(err);
  }
};

export const notFoundErrorHandler = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send(err.message);
  } else {
    next(err);
  }
};

export const unauthorizedErrorHandler = (err, req, res, next) => {
  if (err.status === 401) {
    res.status(401).send(err.message);
  } else {
    next(err);
  }
};

export const genericErrorHandler = (err, req, res, next) => {
  res.status(500).send("Generic Server Error");
};
