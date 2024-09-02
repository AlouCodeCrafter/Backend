const jwt = require("jsonwebtoken");
const UserModel = require("../models.js/user.model");

module.exports.checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        res.cookie("jwt", "", { maxAge: 1 });
        return next();
      } else {
        let user = await UserModel.findById(decodedToken.id);
        res.locals.user = user;
        console.log(user);
        return next();
      }
    });
  } else {
    res.locals.user = null;
    return next();
  }
};

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      } else {
        console.log(decodedToken.id);
        return next();
      }
    });
  } else {
    console.log("No token");
    return res.sendStatus(401);
  }
};
