# 📝 Guide de Logging - Désactivation des Logs en Production

## 🎯 Objectif
Désactiver automatiquement les logs de débogage en production tout en gardant les erreurs importantes.

## 🚀 Configuration

### Variables d'environnement

#### Développement (`.env`)
```env
VITE_LOG_LEVEL=debug  # Tous les logs activés
```

#### Production (`.env.production`)
```env
VITE_LOG_LEVEL=error  # Seulement les erreurs
```

### Niveaux disponibles
- `debug` : Tous les logs (développement)
- `info` : Info + warn + error
- `warn` : Avertissements + erreurs
- `error` : Seulement les erreurs (production)
- `silent` : Aucun log

## 🔧 Utilisation du Logger

### Import
```typescript
import { logger, logApiResponse, logApiError, logUserAction } from "../utils/logger";
```

### Remplacement des console.log

#### AVANT ❌
```typescript
console.log("Données de l'utilisateur:", userData);
console.error("Erreur API:", error);
console.warn("Attention:", message);
```

#### APRÈS ✅
```typescript
logger.debug("Données de l'utilisateur:", userData);
logger.error("Erreur API:", error);
logger.warn("Attention:", message);
```

### Helpers spécialisés
```typescript
// Pour les réponses API
logApiResponse("/orders", response.data);

// Pour les erreurs API
logApiError("/orders", error);

// Pour les actions utilisateur
logUserAction("login", { userId: user.id });
```

## 📦 Méthodes disponibles

| Méthode | Niveau | Production | Description |
|---------|--------|------------|-------------|
| `logger.debug()` | debug | ❌ | Debugging détaillé |
| `logger.info()` | info | ❌ | Informations générales |
| `logger.warn()` | warn | ✅ | Avertissements |
| `logger.error()` | error | ✅ | Erreurs critiques |
| `logger.devOnly()` | - | ❌ | Développement uniquement |
| `logger.table()` | debug | ❌ | Affichage tableau |
| `logger.group()` | debug | ❌ | Groupement de logs |

## 🏭 Comportement en Production

### Avec `VITE_LOG_LEVEL=error`
- ✅ `logger.error()` → Affiché
- ❌ `logger.warn()` → Masqué
- ❌ `logger.info()` → Masqué
- ❌ `logger.debug()` → Masqué
- ❌ `console.log()` → Toujours affiché (à éviter !)

### Avantages
1. **Performance** : Pas de logs inutiles en production
2. **Sécurité** : Pas d'exposition de données sensibles
3. **Propreté** : Console propre pour les utilisateurs
4. **Flexibilité** : Contrôle par variable d'environnement

## 🔄 Migration des fichiers existants

### Fichiers prioritaires à migrer
1. `src/services/orderService.ts` ✅ (fait)
2. `src/services/advancedStatsService.ts`
3. `src/hooks/useAdvancedStats.ts`
4. `src/screens/AdminDashboard/sections/AdminMenuSection/AdminMenuSection.tsx`

### Pattern de remplacement
```bash
# Rechercher tous les console.log
grep -r "console\.log" src/

# Remplacer par logger.debug
# console.log(...) → logger.debug(...)
# console.error(...) → logger.error(...)
# console.warn(...) → logger.warn(...)
```

## 🧪 Test

### En développement
```bash
npm run dev
# Tous les logs sont visibles
```

### En production
```bash
npm run build
npm run preview
# Seules les erreurs sont visibles
```

## 📋 Checklist

- [x] ✅ Service logger créé
- [x] ✅ Variables d'environnement configurées
- [x] ✅ Exemple de migration (orderService)
- [ ] 🔄 Migrer les autres services
- [ ] 🔄 Migrer les composants React
- [ ] 🔄 Tester en production

Ce système garantit des logs propres en production tout en gardant un debugging complet en développement !
