const express = require("express");
const router = express.Router(); // Initialisez le routeur
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const uploadContoller = require("../controllers/upload.controller");
const multer = require("multer");
const upload = multer();

// Définissez les routes correctement

//Auth
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logout);

//useController
router.get("/", userController.getAllUsers);
router.get("/:id", userController.userinfo);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.patch("/follow/:id", userController.follow);
router.patch("/unfollow/:id", userController.unfollow);

//upload
router.post("/upload", upload.single("file"), uploadContoller.uploadProfil);

module.exports = router;
