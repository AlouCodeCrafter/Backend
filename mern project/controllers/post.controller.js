const { text } = require("body-parser");
const postModel = require("../models.js/post.model");
const userModel = require("../models.js/user.model");
const objectID = require("mongoose").Types.ObjectId;

module.exports.readPost = (req, res) => {
  postModel
    .find((err, docs) => {
      if (!err) res.send(docs);
      else console.log("erre to get data : " + err);
    })
    .sort({ createdAt: -1 });
};
module.exports.createPost = async (req, res) => {
  const newPost = new postModel({
    posterId: req.body.posterId,
    message: req.body.message,
    video: req.body.video,
    likers: [],
    comments: [],
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (error) {
    return res.status(400).send(error);
  }
};

module.exports.updatePost = async (req, res) => {
  if (!objectID.isValid(req.params.id)) {
    return res.status(400).send("ID Unknown: " + req.params.id);
  }

  const updatedRecord = {
    message: req.body.message,
  };

  try {
    const docs = await postModel.findByIdAndUpdate(
      req.params.id,
      { $set: updatedRecord },
      { new: true }
    );
    res.send(docs);
  } catch (err) {
    console.log("Update error: " + err);
    res.status(500).send(err);
  }
};

module.exports.deletePost = async (req, res) => {
  console.log("Delete request received");
  const id = req.params.id;
  console.log("ID:", id);

  if (!objectID.isValid(id)) {
    return res.status(400).send("ID Unknown: " + id);
  }

  try {
    const result = await postModel.findByIdAndDelete(id);
    if (result) {
      console.log("Post deleted successfully");
      res.status(200).send("Post deleted successfully");
    } else {
      console.log("Post not found");
      res.status(404).send("Post not found");
    }
  } catch (err) {
    console.log("Delete error: " + err);
    res.status(500).send("An error occurred while deleting the post");
  }
};

module.exports.likePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.body.id; // Assure-toi que l'ID de l'utilisateur est envoyé dans le corps de la requête

  // Vérification des IDs
  if (!objectID.isValid(postId) || !objectID.isValid(userId)) {
    return res.status(400).send("Invalid Post or User ID");
  }

  try {
    // Ajouter l'utilisateur aux "likers" du post
    const updatedPost = await postModel.findByIdAndUpdate(
      postId,
      { $addToSet: { likers: userId } },
      { new: true } // Renvoie le document mis à jour
    );

    // Ajouter le post aux "likes" de l'utilisateur
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { likes: postId } },
      { new: true }
    );

    // Vérifie si les deux mises à jour ont réussi
    if (updatedPost && updatedUser) {
      return res.status(200).json({ post: updatedPost, user: updatedUser });
    } else {
      return res.status(404).send("Post or User not found");
    }
  } catch (error) {
    console.log("Like error: " + error);
    return res.status(500).send(error);
  }
};

module.exports.unlikePost = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!objectID.isValid(id)) {
    return res.status(400).send("ID Unknown: " + id);
  }

  try {
    // Retirer l'ID de l'utilisateur de la liste des likers du post
    const post = await postModel.findByIdAndUpdate(
      id,
      {
        $pull: { likers: userId },
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Retirer l'ID du post de la liste des likes de l'utilisateur
    await userModel.findByIdAndUpdate(
      userId,
      {
        $pull: { likes: id },
      },
      { new: true }
    );

    res.status(200).send(post);
  } catch (error) {
    console.log("Unlike error: " + error);
    res.status(500).send(error);
  }
};

module.exports.commentPost = async (req, res) => {
  if (!objectID.isValid(req.params.id)) {
    return res.status(400).send("ID Unknown: " + req.params.id);
  }

  try {
    return postModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      },
      { new: true },
      (err, docs) => {
        if (!err) return res.send(docs);
        else res.status(400).send(err);
      }
    );
  } catch (error) {
    return res.status(400).send(error);
  }
};

module.exports.editCommentPost = async (req, res) => {
  // Vérification de la validité de l'ID du post
  if (!objectID.isValid(req.params.id)) {
    return res.status(400).send("ID Unknown: " + req.params.id);
  }

  try {
    // Recherche du post par ID
    const post = await postModel.findById(req.params.id);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Recherche du commentaire à modifier
    const theComment = post.comments.find((comment) =>
      comment._id.equals(req.body.commentId)
    );

    if (!theComment) {
      return res.status(404).send("Comment not found");
    }

    // Mise à jour du texte du commentaire
    theComment.text = req.body.text;

    // Sauvegarde du post avec le commentaire modifié
    const updatedPost = await post.save();

    // Envoi du post mis à jour en réponse
    return res.status(200).send(updatedPost);
  } catch (error) {
    console.log("Edit comment error: " + error);
    return res.status(500).send(error);
  }
};

module.exports.deleteCommentPost = async (req, res) => {
  // Vérification de la validité de l'ID du post
  if (!objectID.isValid(req.params.id)) {
    return res.status(400).send("ID Unknown: " + req.params.id);
  }

  try {
    const updatedPost = await postModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true } // Pour retourner le document mis à jour
    );

    if (!updatedPost) {
      return res.status(404).send("Post not found");
    }

    return res.status(200).send(updatedPost);
  } catch (error) {
    console.log("Delete comment error: " + error);
    return res.status(500).send(error);
  }
};
