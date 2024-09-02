const UserModel = require("../models.js/user.model");
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

module.exports.uploadProfil = async (req, res) => {
  try {
    // Vérification que le fichier est bien reçu
    if (!req.file) {
      return res.status(400).send("Aucun fichier reçu");
    }

    // Vérification des types de fichiers valides
    if (
      req.file.mimetype !== "image/jpeg" &&
      req.file.mimetype !== "image/jpg" &&
      req.file.mimetype !== "image/png"
    ) {
      throw Error("Type de fichier invalide");
    }

    // Vérification de la taille du fichier
    if (req.file.size > 500000) {
      throw Error("La taille du fichier dépasse la limite");
    }

    // Définir le nom du fichier
    const filename = req.body.name + ".jpg";

    // Traiter le fichier avec pipeline
    await pipeline(
      req.file.stream,
      fs.createWriteStream(
        `${__dirname}/../client/public/uploads/profil/${filename}`
      )
    );

    // Mettre à jour l'utilisateur avec la nouvelle image de profil
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { picture: "./uploads/profil/" + filename } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!updatedUser) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    res.status(200).send(updatedUser);
  } catch (error) {
    // Envoyer le message d'erreur en réponse
    res.status(400).send(error.message);
  }
};
