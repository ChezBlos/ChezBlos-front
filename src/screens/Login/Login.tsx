import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthRedirect } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { EnvelopeSimple, Eye, EyeSlash, Lock, Phone } from "phosphor-react";
import { Button } from "../../components/ui/button";
import { SpinnerSmall } from "../../components/ui/spinner";

export const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();
  useAuthRedirect();

  // Onglet actif : 'admin' ou 'staff'
  const [tab, setTab] = useState<"admin" | "staff">("admin");

  // États pour admin
  const [adminCredentials, setAdminCredentials] = useState({
    email: "",
    motDePasse: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // États pour staff
  const [staffCredentials, setStaffCredentials] = useState({
    telephone: "",
    codeAcces: "",
  });

  if (isAuthenticated) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(adminCredentials);
      showSuccess("Connexion réussie !");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erreur de connexion";

      // Vérifier si c'est une erreur de compte désactivé
      if (
        errorMessage.includes("désactivé") ||
        errorMessage.includes("désactive")
      ) {
        setError(
          "Votre compte a été désactivé. Veuillez contacter l'administrateur."
        );
        showError(
          "Votre compte a été désactivé. Veuillez contacter l'administrateur."
        );
      } else {
        setError(errorMessage);
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(staffCredentials);
      showSuccess("Connexion réussie !");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Téléphone ou code d'accès invalide";

      // Vérifier si c'est une erreur de compte désactivé
      if (
        errorMessage.includes("désactivé") ||
        errorMessage.includes("désactive")
      ) {
        setError(
          "Votre compte a été désactivé. Veuillez contacter l'administrateur."
        );
        showError(
          "Votre compte a été désactivé. Veuillez contacter l'administrateur."
        );
      } else {
        setError(errorMessage);
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Layout mobile */}
      <div className="flex md:hidden flex-col min-h-screen">
        {/* Logo en haut pour mobile */}
        <div className="flex items-center justify-center gap-4 pt-12 pb-8 px-6">
          <img
            src="/img/logo.png"
            alt="Logo Chez Blos"
            className="w-60 h-auto mt-16"
          />
        </div>

        {/* Formulaire en bas pour mobile */}
        <div className="flex-1 flex flex-col justify-center pb-8 px-6">
          <article className="flex flex-col gap-6 w-full">
            <header className="flex flex-col items-center gap-4">
              <h1 className="text-gray-800 font-extrabold text-3xl text-center mb-4">
                Connectez vous
              </h1>
              <div className="flex w-full rounded-full overflow-hidden shadow-sm">
                <button
                  type="button"
                  className={`flex-1 py-2.5 text-base font-medium transition-colors duration-150 ${
                    tab === "admin"
                      ? "bg-orange-500 text-white shadow"
                      : "text-gray-700 bg-white hover:bg-orange-50"
                  }`}
                  onClick={() => {
                    setTab("admin");
                    setError("");
                  }}
                  aria-current={tab === "admin" ? "page" : undefined}
                >
                  Administrateur
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2.5 text-base font-medium transition-colors duration-150 ${
                    tab === "staff"
                      ? "bg-orange-500 text-white shadow"
                      : "text-gray-700 bg-white hover:bg-orange-50"
                  }`}
                  onClick={() => {
                    setTab("staff");
                    setError("");
                  }}
                  aria-current={tab === "staff" ? "page" : undefined}
                >
                  Personnel
                </button>
              </div>
            </header>

            {tab === "admin" ? (
              <form
                className="flex flex-col gap-4 w-full"
                aria-label="Login form admin"
                onSubmit={handleAdminLogin}
              >
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="email-mobile"
                    className="text-gray-800 font-medium text-sm"
                  >
                    Adresse email
                  </label>
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-3 gap-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-200 transition-all">
                    <EnvelopeSimple
                      className="text-gray-400"
                      size={20}
                      weight="regular"
                    />
                    <input
                      id="email-mobile"
                      name="email"
                      type="email"
                      className="flex-1 border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-base"
                      placeholder="Entrez votre adresse email"
                      aria-label="Adresse email"
                      value={adminCredentials.email}
                      onChange={(e) =>
                        setAdminCredentials((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="password-mobile"
                    className="text-gray-800 font-medium text-sm"
                  >
                    Mot de passe
                  </label>
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-3 gap-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-200 transition-all">
                    <Lock
                      className="text-gray-400"
                      size={20}
                      weight="regular"
                    />
                    <input
                      id="password-mobile"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="flex-1 border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-base"
                      placeholder="••••••••••••••••"
                      aria-label="Mot de passe"
                      value={adminCredentials.motDePasse}
                      onChange={(e) =>
                        setAdminCredentials((prev) => ({
                          ...prev,
                          motDePasse: e.target.value,
                        }))
                      }
                      required
                      autoComplete="current-password"
                    />
                    {showPassword ? (
                      <Eye
                        className="text-gray-400 cursor-pointer hover:text-gray-600"
                        size={20}
                        weight="regular"
                        aria-label="Masquer le mot de passe"
                        onClick={() => setShowPassword(false)}
                        tabIndex={0}
                        role="button"
                      />
                    ) : (
                      <EyeSlash
                        className="text-gray-400 cursor-pointer hover:text-gray-600"
                        size={20}
                        weight="regular"
                        aria-label="Afficher le mot de passe"
                        onClick={() => setShowPassword(true)}
                        tabIndex={0}
                        role="button"
                      />
                    )}
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  variant="default"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg py-3 text-base transition-all duration-150"
                  aria-label="Se connecter"
                  disabled={
                    isLoading ||
                    !adminCredentials.email ||
                    !adminCredentials.motDePasse
                  }
                >
                  {isLoading ? <SpinnerSmall color="white" /> : "Se connecter"}
                </Button>
              </form>
            ) : (
              <form
                className="flex flex-col gap-4 w-full"
                aria-label="Login form staff"
                onSubmit={handleStaffLogin}
              >
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="telephone-mobile"
                    className="text-gray-800 font-medium text-sm"
                  >
                    Numéro de téléphone
                  </label>
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-3 gap-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-200 transition-all">
                    <Phone
                      className="text-gray-400"
                      size={20}
                      weight="regular"
                    />
                    <input
                      id="telephone-mobile"
                      name="telephone"
                      type="tel"
                      className="flex-1 border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-base"
                      placeholder="Ex: +33123456789"
                      aria-label="Numéro de téléphone"
                      value={staffCredentials.telephone}
                      onChange={(e) =>
                        setStaffCredentials((prev) => ({
                          ...prev,
                          telephone: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="codeAcces-mobile"
                    className="text-gray-800 font-medium text-sm"
                  >
                    Code d'accès
                  </label>
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-3 gap-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-200 transition-all">
                    <Lock
                      className="text-gray-400"
                      size={20}
                      weight="regular"
                    />
                    <input
                      id="codeAcces-mobile"
                      name="codeAcces"
                      type="text"
                      className="flex-1 border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-base uppercase"
                      placeholder="Ex: ISBL1234"
                      aria-label="Code d'accès"
                      value={staffCredentials.codeAcces}
                      onChange={(e) =>
                        setStaffCredentials((prev) => ({
                          ...prev,
                          codeAcces: e.target.value.toUpperCase(),
                        }))
                      }
                      required
                      maxLength={8}
                    />
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg py-3 text-base transition-all duration-150"
                  aria-label="Se connecter"
                  disabled={
                    isLoading ||
                    !staffCredentials.telephone ||
                    !staffCredentials.codeAcces
                  }
                >
                  {isLoading ? <SpinnerSmall color="white" /> : "Se connecter"}
                </Button>
              </form>
            )}
          </article>
        </div>
      </div>

      {/* Layout desktop */}
      <div className="hidden md:flex min-h-screen">
        {/* Section formulaire à gauche */}
        <div className="flex-1 flex justify-center items-center p-8">
          <article className="flex flex-col gap-8 w-full max-w-md">
            <header className="flex flex-col items-center gap-4">
              <h1 className="text-gray-800 font-extrabold text-4xl items-start mb-4">
                Connectez vous
              </h1>
              <div className="flex w-full rounded-full overflow-hidden shadow-sm">
                <button
                  type="button"
                  className={`flex-1 py-2 text-lg font-medium transition-colors duration-150 ${
                    tab === "admin"
                      ? "bg-orange-500 text-white shadow"
                      : "text-gray-700 bg-white hover:bg-orange-50"
                  }`}
                  onClick={() => {
                    setTab("admin");
                    setError("");
                  }}
                  aria-current={tab === "admin" ? "page" : undefined}
                >
                  Administrateur
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-lg font-medium transition-colors duration-150 ${
                    tab === "staff"
                      ? "bg-orange-500 text-white shadow"
                      : "text-gray-700 bg-white hover:bg-orange-50"
                  }`}
                  onClick={() => {
                    setTab("staff");
                    setError("");
                  }}
                  aria-current={tab === "staff" ? "page" : undefined}
                >
                  Personnel
                </button>
              </div>
            </header>

            {tab === "admin" ? (
              <form
                className="flex flex-col gap-4 w-full"
                aria-label="Login form admin"
                onSubmit={handleAdminLogin}
              >
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="email"
                    className="text-gray-800 font-medium text-sm"
                  >
                    Adresse email
                  </label>
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 gap-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-200 transition-all">
                    <EnvelopeSimple
                      className="text-gray-400"
                      size={18}
                      weight="regular"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="flex-1 border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
                      placeholder="Entrez votre adresse email"
                      aria-label="Adresse email"
                      value={adminCredentials.email}
                      onChange={(e) =>
                        setAdminCredentials((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="password"
                    className="text-gray-800 font-medium text-sm"
                  >
                    Mot de passe
                  </label>
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 gap-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-200 transition-all">
                    <Lock
                      className="text-gray-400"
                      size={18}
                      weight="regular"
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="flex-1 border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
                      placeholder="••••••••••••••••"
                      aria-label="Mot de passe"
                      value={adminCredentials.motDePasse}
                      onChange={(e) =>
                        setAdminCredentials((prev) => ({
                          ...prev,
                          motDePasse: e.target.value,
                        }))
                      }
                      required
                      autoComplete="current-password"
                    />
                    {showPassword ? (
                      <Eye
                        className="text-gray-400 cursor-pointer hover:text-gray-600"
                        size={18}
                        weight="regular"
                        aria-label="Masquer le mot de passe"
                        onClick={() => setShowPassword(false)}
                        tabIndex={0}
                        role="button"
                      />
                    ) : (
                      <EyeSlash
                        className="text-gray-400 cursor-pointer hover:text-gray-600"
                        size={18}
                        weight="regular"
                        aria-label="Afficher le mot de passe"
                        onClick={() => setShowPassword(true)}
                        tabIndex={0}
                        role="button"
                      />
                    )}
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  variant="default"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg py-2.5 text-sm transition-all duration-150"
                  aria-label="Se connecter"
                  disabled={
                    isLoading ||
                    !adminCredentials.email ||
                    !adminCredentials.motDePasse
                  }
                >
                  {isLoading ? <SpinnerSmall color="white" /> : "Se connecter"}
                </Button>
              </form>
            ) : (
              <form
                className="flex flex-col gap-4 w-full"
                aria-label="Login form staff"
                onSubmit={handleStaffLogin}
              >
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="telephone"
                    className="text-gray-800 font-medium text-sm"
                  >
                    Numéro de téléphone
                  </label>
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 gap-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-200 transition-all">
                    <Phone
                      className="text-gray-400"
                      size={18}
                      weight="regular"
                    />
                    <input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      className="flex-1 border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm"
                      placeholder="Ex: +33123456789"
                      aria-label="Numéro de téléphone"
                      value={staffCredentials.telephone}
                      onChange={(e) =>
                        setStaffCredentials((prev) => ({
                          ...prev,
                          telephone: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label
                    htmlFor="codeAcces"
                    className="text-gray-800 font-medium text-sm"
                  >
                    Code d'accès
                  </label>
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 gap-3 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-200 transition-all">
                    <Lock
                      className="text-gray-400"
                      size={18}
                      weight="regular"
                    />
                    <input
                      id="codeAcces"
                      name="codeAcces"
                      type="text"
                      className="flex-1 border-none bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none text-sm uppercase"
                      placeholder="Ex: ISBL1234"
                      aria-label="Code d'accès"
                      value={staffCredentials.codeAcces}
                      onChange={(e) =>
                        setStaffCredentials((prev) => ({
                          ...prev,
                          codeAcces: e.target.value.toUpperCase(),
                        }))
                      }
                      required
                      maxLength={8}
                    />
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg py-2.5 text-sm transition-all duration-150"
                  aria-label="Se connecter"
                  disabled={
                    isLoading ||
                    !staffCredentials.telephone ||
                    !staffCredentials.codeAcces
                  }
                >
                  {isLoading ? <SpinnerSmall color="white" /> : "Se connecter"}
                </Button>
              </form>
            )}
          </article>
        </div>

        {/* Section logo et texte à droite */}
        <div className="flex-1 flex flex-col items-start justify-between p-12">
          {/* Logo en haut */}
          <div className="flex items-center justify-center gap-4">
            <img
              src="/img/logo.png"
              alt="Logo Chez Blos"
              className="w-52 h-auto"
            />
          </div>

          {/* Texte en bas */}
          <div className="text-left">
            <h2 className="text-gray-800 font-semibold text-[50px] leading-tight">
              Gérez vos restaurants simplement & facilement
            </h2>
          </div>
        </div>
      </div>
    </main>
  );
};
