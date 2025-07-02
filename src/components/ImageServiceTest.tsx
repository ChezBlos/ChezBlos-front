import React from "react";
import { UserAvatar } from "../components/UserAvatar";
import { generateInitialsAvatar } from "../services/imageService";
import { logger } from "../utils/logger";

/**
 * Composant de test pour vérifier la robustesse du service d'images
 */
export const ImageServiceTest: React.FC = () => {
  // Cas de test pour les avatars
  const testCases = [
    { nom: "Dupont", prenom: "Jean", photo: null },
    { nom: "Martin", prenom: "Marie", photo: "/uploads/profiles/marie.jpg" },
    { nom: "", prenom: "", photo: null },
    { nom: null, prenom: null, photo: null },
    { nom: "A", prenom: "B", photo: null },
    { nom: "Très-Long-Nom", prenom: "Très-Long-Prénom", photo: null },
  ];

  logger.debug("=== Test du service d'images ===");

  // Test de la fonction generateInitialsAvatar avec différents cas
  testCases.forEach((testCase, index) => {
    try {
      const result = generateInitialsAvatar(testCase.nom, testCase.prenom);
      logger.debug(`Test ${index + 1}:`, {
        input: testCase,
        output: result,
      });
    } catch (error) {
      logger.error(`Erreur dans le test ${index + 1}:`, error);
    }
  });

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Test du Service d'Images</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {testCases.map((testCase, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 border rounded"
          >
            <UserAvatar
              nom={testCase.nom}
              prenom={testCase.prenom}
              photo={testCase.photo}
              size="lg"
            />
            <div className="mt-2 text-center text-sm">
              <div>
                <strong>Nom:</strong> {testCase.nom || "null"}
              </div>
              <div>
                <strong>Prénom:</strong> {testCase.prenom || "null"}
              </div>
              <div>
                <strong>Photo:</strong> {testCase.photo || "null"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">
          Tests de différentes tailles
        </h3>
        <div className="flex items-center gap-4">
          <UserAvatar nom="Test" prenom="Small" size="sm" />
          <UserAvatar nom="Test" prenom="Medium" size="md" />
          <UserAvatar nom="Test" prenom="Large" size="lg" />
          <UserAvatar nom="Test" prenom="XLarge" size="xl" />
        </div>
      </div>
    </div>
  );
};

export default ImageServiceTest;
