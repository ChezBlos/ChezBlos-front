// Utilitaire pour transformer les données MongoDB en format JavaScript standard

/**
 * Transforme un ObjectId MongoDB { "$oid": "..." } en string
 */
function transformObjectId(value: any): string {
  if (value && typeof value === "object" && value.$oid) {
    return value.$oid;
  }
  return value;
}

/**
 * Transforme une date MongoDB { "$date": "..." } en string ISO
 */
function transformDate(value: any): string {
  if (value && typeof value === "object" && value.$date) {
    return value.$date;
  }
  return value;
}

/**
 * Transforme récursivement un objet MongoDB en remplaçant les ObjectIds et dates
 */
function transformMongoObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformMongoObject(item));
  }

  if (typeof obj === "object") {
    // Cas spéciaux pour ObjectId et Date
    if (obj.$oid) {
      return obj.$oid;
    }
    if (obj.$date) {
      return obj.$date;
    }

    // Transformation récursive pour les objets
    const transformed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      transformed[key] = transformMongoObject(value);
    }
    return transformed;
  }

  return obj;
}

/**
 * Transforme les données de commande MongoDB en format standard
 */
export function transformMongoOrderData(rawOrders: any[]): any[] {
  if (!Array.isArray(rawOrders)) {
    console.warn("Expected array of orders, got:", typeof rawOrders);
    return [];
  }

  return rawOrders.map((order) => {
    try {
      // Transformation de base
      const transformed = transformMongoObject(order);

      // Assurer que l'_id est une string
      if (transformed._id) {
        transformed._id = transformObjectId(transformed._id);
      }

      // Transformer les dates spécifiques
      if (transformed.dateCreation) {
        transformed.dateCreation = transformDate(transformed.dateCreation);
      }
      if (transformed.dateModification) {
        transformed.dateModification = transformDate(
          transformed.dateModification
        );
      }
      if (transformed.createdAt) {
        transformed.createdAt = transformDate(transformed.createdAt);
      }
      if (transformed.updatedAt) {
        transformed.updatedAt = transformDate(transformed.updatedAt);
      }

      // Transformer les ObjectIds dans les items
      if (transformed.items && Array.isArray(transformed.items)) {
        transformed.items = transformed.items.map((item: any) => ({
          ...item,
          menuItem: transformObjectId(item.menuItem),
        }));
      }

      // Transformer l'ObjectId du serveur
      if (transformed.serveur) {
        if (
          typeof transformed.serveur === "object" &&
          transformed.serveur._id
        ) {
          transformed.serveur._id = transformObjectId(transformed.serveur._id);
        } else {
          // Si serveur est juste un ObjectId, on le garde tel quel pour l'instant
          transformed.serveur = transformObjectId(transformed.serveur);
        }
      }

      return transformed;
    } catch (error) {
      console.error("Error transforming order:", error);
      return order; // Retourner l'ordre original en cas d'erreur
    }
  });
}
