module.exports.signUpErrors = (err) => {
  // Initialisation d'un objet pour stocker les messages d'erreur
  let errors = { pseudo: "", email: "", password: "" };

  // Vérifie si l'erreur concerne le pseudo
  if (err.message.includes("pseudo")) {
    errors.pseudo = "Pseudo incorrect ou déjà pris";
  }

  // Vérifie si l'erreur concerne l'email
  if (err.message.includes("email")) {
    errors.email = "Email incorrect";
  }

  // Vérifie si l'erreur concerne le mot de passe
  if (err.message.includes("password")) {
    errors.password = "Le mot de passe doit faire 6 caractères minimum";
  }

  // Gère les erreurs de duplication de l'email dans la base de données
  if (err.code === 11000) {
    errors.email = "Cette adresse email est déjà enregistrée";
  }

  // Retourne l'objet contenant les messages d'erreur
  return errors;
};

module.exports.signInErrors = () => {
  let errors = { email: "", password: "" };

  if (err.message.includes("email")) errors.email = "Email inconnu";

  if (err.message.includes("password")) errors.password = "password inconnu";

  return errors;
};
