# Chez Blos - Frontend

Interface utilisateur moderne pour le système de gestion du restaurant Chez Blos.

## 🚀 Fonctionnalités

- **Authentification sécurisée** : Login admin (email/mot de passe) et personnel (code d'accès)
- **Interface responsive** : Design adaptatif pour tous les appareils
- **Gestion des rôles** : Admin, Serveur, Cuisine avec permissions spécifiques
- **Dashboard personnalisé** : Interface adaptée selon le rôle utilisateur
- **Routage protégé** : Accès sécurisé aux pages selon les autorisations

## 🚀 Installation et démarrage

### Prérequis

- Node.js
- npm ou yarn

### Installation

```bash
cd Chez_Blos-Front_end
npm install
```

### Démarrage en développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build de production

```bash
npm run build
```

## 🔐 Système d'authentification

### Types d'utilisateurs

- **Admin** : Accès complet au système
- **Serveur** : Gestion des commandes et des tables
- **Cuisine** : Gestion des préparations

### Connexion

- **Admin** : Email + mot de passe
- **Personnel** : Code d'accès unique (format: 2 lettres nom + 2 lettres prénom + 4 chiffres)

**Chez Blos** - Système de gestion de restaurant moderne et intuitif.
