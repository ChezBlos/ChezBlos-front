import { useState, useEffect, useCallback } from "react";
import {
  UserService,
  StaffUser,
  CreateUserRequest,
} from "../services/userService";

// Hook pour récupérer les utilisateurs/staff
export const useUsers = () => {
  const [data, setData] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await UserService.getUsers();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    data,
    loading,
    error,
    refetch: fetchUsers,
  };
};

// Hook pour créer un utilisateur
export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createUser = useCallback(
    async (userData: CreateUserRequest): Promise<StaffUser | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await UserService.createUser(userData);
        return result;
      } catch (err: any) {
        console.error("Erreur complète:", err);

        let errorMessage = "Erreur lors de la création";

        if (err?.response?.data?.details) {
          // Erreurs de validation avec détails
          errorMessage = err.response.data.details.join(", ");
        } else if (err?.response?.data?.error) {
          // Message d'erreur simple
          errorMessage = err.response.data.error;
        } else if (err?.message) {
          // Message d'erreur générique
          errorMessage = err.message;
        }

        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createUser,
    loading,
    error,
  };
};

// Hook pour mettre à jour un utilisateur
export const useUpdateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(
    async (
      id: string,
      userData: Partial<CreateUserRequest>
    ): Promise<StaffUser | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await UserService.updateUser(id, userData);
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors de la mise à jour"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updateUser,
    loading,
    error,
  };
};

// Hook pour supprimer un utilisateur
export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await UserService.deleteUser(id);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteUser,
    loading,
    error,
  };
};

// Hook pour activer/désactiver un utilisateur
export const useToggleUserStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleUserStatus = useCallback(
    async (id: string): Promise<StaffUser | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await UserService.toggleUserStatus(id);
        return result;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du changement de statut"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    toggleUserStatus,
    loading,
    error,
  };
};

// Hook pour gérer les codes d'accès
export const useUserAccessCode = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getUserAccessCode = useCallback(
    async (userId: string): Promise<any | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await UserService.getUserAccessCode(userId);
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );
  const generateAccessCode = useCallback(
    async (userId: string): Promise<any | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await UserService.generateAccessCode(userId);
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    getUserAccessCode,
    generateAccessCode,
    loading,
    error,
  };
};
