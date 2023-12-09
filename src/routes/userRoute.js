/** @format */

const { authJwt } = require("../middlewares");
const controller = require("../controllers/userController");
import adminRoute from "./adminRoute";

const userRoute = (app) => {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/", controller.allAccess);

  app.get("/user", authJwt.verifyToken, controller.userBoard);

  app.use("/admin", [authJwt.verifyToken, authJwt.isAdmin]);
  adminRoute(app);
};

export default userRoute;
