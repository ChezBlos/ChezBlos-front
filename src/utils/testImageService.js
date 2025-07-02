// Script de test pour le service d'images
// À exécuter dans la console du navigateur

import { generateInitialsAvatar } from "../services/imageService";

// Tests d'edge cases
const testCases = [
  { nom: "Dupont", prenom: "Jean" },
  { nom: "Martin", prenom: "Marie" },
  { nom: "", prenom: "" },
  { nom: null, prenom: null },
  { nom: undefined, prenom: undefined },
  { nom: "A", prenom: "B" },
  { nom: "Très-Long-Nom", prenom: "Très-Long-Prénom" },
  { nom: "  ", prenom: "  " }, // Espaces seulement
  { nom: "123", prenom: "456" }, // Chiffres
  { nom: "Léon", prenom: "André" }, // Caractères accentués
];

console.log("=== Test du service generateInitialsAvatar ===");

testCases.forEach((testCase, index) => {
  try {
    const result = generateInitialsAvatar(testCase.nom, testCase.prenom);
    console.log(`✅ Test ${index + 1} réussi:`, {
      input: testCase,
      output: result,
    });

    // Vérifications de sécurité
    if (!result.initials || !result.backgroundColor || !result.textColor) {
      console.error(`❌ Test ${index + 1} - Propriétés manquantes:`, result);
    }
  } catch (error) {
    console.error(`❌ Test ${index + 1} - Erreur:`, error, testCase);
  }
});

console.log("=== Fin des tests ===");
