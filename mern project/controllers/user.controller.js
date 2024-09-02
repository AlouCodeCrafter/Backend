const { isStrongPassword } = require("validator");
const UserModel = require("../models.js/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.userinfo = async (req, res) => {
  console.log(req.params);
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID Unknown: " + req.params.id);

  try {
    // Recherche de l'utilisateur par ID
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (err) {
    console.log("ID Unknown: " + err);
    res.status(500).send("An error occurred");
  }
};

module.exports.updateUser = async (req, res) => {
  // Validation de l'ID
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID Unknown: " + req.params.id);
  }

  try {
    // Mise à jour de l'utilisateur
    const updatedUser = await UserModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          bio: req.body.bio,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Envoi de la réponse
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    res.send(updatedUser);
  } catch (err) {
    // Gestion des erreurs
    res.status(500).send({ message: err.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  // Validation de l'ID
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID Unknown: " + req.params.id);
  }

  try {
    // Utilisation de deleteOne à la place de remove, qui est déprécié
    await UserModel.deleteOne({ _id: req.params.id }).exec();

    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    // Correction de la variable d'erreur (error au lieu de err)
    res.status(500).send({ message: error.message });
  }
};

module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  ) {
    return res.status(400).send("ID Unknown: " + req.params.id);
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    const updatedFollowedUser = await UserModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true }
    );

    if (!updatedFollowedUser) {
      return res.status(404).send("User to follow not found");
    }

    res.status(201).json(updatedUser);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports.unfollow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToUnfollow)
  ) {
    return res.status(400).send("ID Unknown: " + req.params.id);
  }

  try {
    // Retirer de la liste des suivis
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnfollow } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    // Retirer de la liste des followers
    const updatedUnfollowedUser = await UserModel.findByIdAndUpdate(
      req.body.idToUnfollow,
      { $pull: { followers: req.params.id } },
      { new: true }
    );

    if (!updatedUnfollowedUser) {
      return res.status(404).send("User to unfollow not found");
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
