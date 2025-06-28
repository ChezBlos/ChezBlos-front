/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_IMAGE_BASE_URL: string;
  // Ajoutez d'autres variables d'environnement ici si besoin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
