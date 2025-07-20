import React, { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Upload, X } from "lucide-react";
import { Slider } from "../ui/slider";
import { ProfileService } from "../../services/profileService";
import { useNotifications } from "../../hooks/useNotifications";
import { logger } from "../../utils/logger";

interface ChangeProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void; // Callback pour rafraîchir l'image de profil
}

export const ChangeProfilePictureModal: React.FC<
  ChangeProfilePictureModalProps
> = ({ isOpen, onClose, onProfileUpdated }) => {
  const { showSuccess, showError } = useNotifications();
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError("La taille de l'image ne doit pas dépasser 2MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        showError("Veuillez sélectionner un fichier image valide");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculer les dimensions de l'image basées sur sa taille naturelle
  const getImageDimensions = () => {
    if (!imgRef.current) return { width: 256, height: 256 };

    const img = imgRef.current;
    const baseSize = 256; // Taille de base pour zoom 1x

    // Calculer les dimensions naturelles adaptées au container
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    let baseWidth, baseHeight;

    // Toujours permettre à l'image de grandir proportionnellement
    if (aspectRatio > 1) {
      // Image plus large que haute
      baseWidth = baseSize;
      baseHeight = baseSize / aspectRatio;
    } else {
      // Image plus haute que large
      baseHeight = baseSize;
      baseWidth = baseSize * aspectRatio;
    }

    // Appliquer le zoom sans contrainte de taille maximale
    return {
      width: baseWidth * zoom,
      height: baseHeight * zoom,
    };
  };

  const getCroppedImg = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!imgRef.current) {
        reject(new Error("Image non trouvée"));
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Impossible de créer le contexte du canvas"));
        return;
      }

      // Taille du cercle de crop (256px pour une bonne qualité)
      const cropSize = 256;
      canvas.width = cropSize;
      canvas.height = cropSize;

      // Créer un masque circulaire
      ctx.beginPath();
      ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
      ctx.clip();

      // Dessiner l'image avec les transformations appliquées
      const img = imgRef.current;
      const containerSize = 256;

      // Calculer les dimensions réelles de l'image affichée
      const imageDimensions = getImageDimensions();

      // Position de l'image dans le canvas (centrée + offset)
      const x = containerSize / 2 + imagePosition.x - imageDimensions.width / 2;
      const y =
        containerSize / 2 + imagePosition.y - imageDimensions.height / 2;

      ctx.drawImage(img, x, y, imageDimensions.width, imageDimensions.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Erreur lors de la création du blob"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  }, [zoom, imagePosition]);

  const handleUpload = async () => {
    if (!imgRef.current || !image) {
      showError("Veuillez sélectionner une image");
      return;
    }

    try {
      setIsUploading(true);

      const croppedImageBlob = await getCroppedImg();
      const file = new File([croppedImageBlob], "profile-picture.jpg", {
        type: "image/jpeg",
      });
      await ProfileService.updateProfilePicture(file);

      showSuccess("Photo de profil mise à jour avec succès !");

      // Appeler le callback pour rafraîchir l'image de profil
      if (onProfileUpdated) {
        onProfileUpdated();
      }

      handleClose();
    } catch (error: any) {
      logger.error("Erreur lors de l'upload:", error);
      showError(
        error.message || "Erreur lors de la mise à jour de la photo de profil"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setImage(null);
    setIsUploading(false);
    setZoom(1);
    setImagePosition({ x: 0, y: 0 });
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const onImageLoad = useCallback(() => {
    // Afficher l'image dans sa taille naturelle au chargement
    // L'utilisateur pourra ensuite ajuster le zoom et la position
    setZoom(1);
    setImagePosition({ x: 0, y: 0 });
  }, []);

  // Fonctions pour gérer le déplacement de l'image
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Fonction pour gérer le zoom
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Changer la photo de profil
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {!image ? (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Sélectionnez une image pour votre photo de profil. Vous pourrez
                ensuite choisir la zone à afficher.
              </p>

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium mb-2">
                  Cliquez pour sélectionner une image
                </p>
                <p className="text-gray-400 text-sm">
                  PNG, JPG, JPEG jusqu'à 2MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                aria-label="Sélectionner une image de profil"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-gray-600 text-sm font-medium">
                    Ajustez votre photo de profil
                  </p>
                  <p className="text-gray-400 text-xs">
                    Déplacez l'image et ajustez le zoom pour positionner votre
                    visage dans le cercle
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImage(null)}
                >
                  <X className="h-4 w-4" />
                  Changer d'image
                </Button>
              </div>

              {/* Container de l'image avec cercle de crop */}
              <div className="bg-gray-5 rounded-lg p-4 flex flex-col items-center space-y-4">
                <div
                  className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg"
                  style={{
                    boxShadow:
                      "0 0 0 2px rgba(249, 115, 22, 0.2), 0 0 20px rgba(249, 115, 22, 0.3)",
                  }}
                >
                  <img
                    ref={imgRef}
                    src={image}
                    alt="À recadrer"
                    className="absolute cursor-grab select-none"
                    style={{
                      width: `${getImageDimensions().width}px`,
                      height: `${getImageDimensions().height}px`,
                      left: `${imagePosition.x}px`,
                      top: `${imagePosition.y}px`,
                      cursor: isDragging ? "grabbing" : "grab",
                      transform: "translate(-50%, -50%)",
                      marginLeft: "50%",
                      marginTop: "50%",
                      maxWidth: "none",
                      maxHeight: "none",
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onLoad={onImageLoad}
                    draggable={false}
                  />
                </div>

                {/* Slider de zoom */}
                <div className="w-full max-w-xs space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Zoom
                  </label>
                  <Slider
                    value={[zoom]}
                    onValueChange={handleZoomChange}
                    min={0.2}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0.2x</span>
                    <span>3x</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isUploading ? "Upload en cours..." : "Valider"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
