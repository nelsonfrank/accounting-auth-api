/* eslint-disable @typescript-eslint/no-unused-vars */

// dependencies
import express, { Application, Response } from "express";
import cors from "cors";

import AuthRoutes from "./modules/auth/auth.route";
import UserRoutes from "./modules/user/user.route";

// middleware
import jwtAuthenticate from "./middlewares/authorization";
import Authorize from "./middlewares/authentication";

export default function createServer() {
  const app: Application = express();

  // body parser
  app.use(express.json());

  // cors
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://18.117.98.249:9090",
        "http://18.117.98.249:8080",
      ],
      credentials: true,
    })
  );

  app.use("/api/auth", AuthRoutes);
  app.use("/api", jwtAuthenticate, Authorize, UserRoutes);

  app.use(express.static("public"));

  app.get("/", (_, res: Response) => {
    res.send("Account app");
  });

  // 404 Error Handler
  app.use((_req, res, _next) => {
    res.status(404).send("Not found");
  });
  return app;
}
