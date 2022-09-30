import { Response, Request } from "express";
import User from "./user.model";

/**
 * getUsers controller to retrieve all the users.
 * @param _res
 * @param res
 */

const UserController = {
  getAllUsers: (_req: Request, res: Response) => {
    User.find({})
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((error) => res.status(400).send(error));
  },
};

export default UserController;
