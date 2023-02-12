import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import {
  notFoundErrorHandler,
  badRequestErrorHandler,
  unauthorizedErrorHandler,
  genericErrorHandler
} from "./errorHandlers.js";
import usersRouter from "./api/users/index.js";
import accomodationRouter from "./api/accomodation/index.js";

const server = express();
const port = process.env.PORT;

server.use(cors());
server.use(express.json());

server.use("/users", usersRouter);
server.use("/accomodations", accomodationRouter);

server.use(notFoundErrorHandler);
server.use(badRequestErrorHandler);
server.use(unauthorizedErrorHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_CONNECTION);

mongoose.connection.on("connected", () => {
  console.log("Connected to Mongo");
  server.listen(port, () => {
    console.log("Server is running on port: ", port);
    console.table(listEndpoints(server));
  });
});
