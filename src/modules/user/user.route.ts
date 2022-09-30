import express from "express";

const Router = express.Router();

import UserController from "./user.controller";

/**
 * GET /api/users
 * Get all users
 *
 */

Router.get("/users", UserController.getAllUsers);

export default Router;
