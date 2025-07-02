/// <reference types="vite/client" />
// Déclaration des variables d'environnement Vite pour l'autocomplétion et la compatibilité TypeScript

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
