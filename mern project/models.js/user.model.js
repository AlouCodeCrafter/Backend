const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    pseudo: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 55,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email address",
      },
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      maxlength: 1024,
      minlength: 6,
      trim: true,
    },
    picture: {
      type: String,
      default: "./uploads/profil/random-user.png",
    },
    bio: {
      type: String,
      maxlength: 1024,
    },
    followers: {
      type: [String],
    },
    following: {
      type: [String],
    },
    likes: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Avant de sauvegarder un utilisateur, hacher le mot de passe
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email }); // Correction de `thiS` à `this`

  if (user) {
    const Auth = await bcrypt.compare(password, user.password);
    if (Auth) {
      return user;
    }
    throw Error("Incorrect password");
  }

  throw Error("Incorrect email");
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
