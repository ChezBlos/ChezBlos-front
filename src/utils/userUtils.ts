// Fonction utilitaire pour générer les initiales d'un utilisateur
export const getInitials = (prenom?: string, nom?: string): string => {
  const prenomInitial = prenom ? prenom.charAt(0).toUpperCase() : "";
  const nomInitial = nom ? nom.charAt(0).toUpperCase() : "";

  if (prenomInitial && nomInitial) {
    return prenomInitial + nomInitial;
  }

  if (prenomInitial) {
    return prenomInitial;
  }

  if (nomInitial) {
    return nomInitial;
  }

  return "U"; // Fallback pour "User"
};

// Fonction pour générer une couleur de fond basée sur les initiales
export const getInitialsBackgroundColor = (initials: string): string => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-teal-500",
  ];

  // Utilise le code de caractère de la première lettre pour choisir une couleur
  const charCode = initials.charCodeAt(0);
  return colors[charCode % colors.length];
};
