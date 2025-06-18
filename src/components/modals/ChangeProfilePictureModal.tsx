import React, { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Upload, X } from "lucide-react";
import { ProfileService } from "../../services/profileService";
import { useNotifications } from "../../hooks/useNotifications";

interface ChangeProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeProfilePictureModal: React.FC<
  ChangeProfilePictureModalProps
> = ({ isOpen, onClose }) => {
  const { showSuccess, showError } = useNotifications();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsUploading] = useState(false);
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
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Impossible de créer le contexte du canvas");
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              throw new Error("Erreur lors de la création du blob");
            }
            resolve(blob);
          },
          "image/jpeg",
          0.8
        );
      });
    },
    []
  );

  const handleUpload = async () => {
    if (!imgRef.current || !completedCrop || !selectedImage) {
      showError("Veuillez sélectionner et recadrer une image");
      return;
    }

    try {
      setIsUploading(true);

      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop
      );
      const file = new File([croppedImageBlob], "profile-picture.jpg", {
        type: "image/jpeg",
      });
      await ProfileService.updateProfilePicture(file);

      // Récupérer le profil mis à jour - on ne peut pas reconnecter automatiquement
      // L'utilisateur verra sa nouvelle photo après actualisation de la page

      showSuccess("Photo de profil mise à jour avec succès !");
      handleClose();
    } catch (error: any) {
      console.error("Erreur lors de l'upload:", error);
      showError(
        error.message || "Erreur lors de la mise à jour de la photo de profil"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setCrop({
      unit: "%",
      width: 50,
      height: 50,
      x: 25,
      y: 25,
    });
    setCompletedCrop(undefined);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop({
        unit: "px",
        width: Math.min(width, height) * 0.8,
        height: Math.min(width, height) * 0.8,
        x: (width - Math.min(width, height) * 0.8) / 2,
        y: (height - Math.min(width, height) * 0.8) / 2,
      });
    },
    []
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Changer la photo de profil
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {!selectedImage ? (
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
                <p className="text-gray-600 text-sm">
                  Ajustez la zone à afficher dans le cercle de profil :
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                  Changer d'image
                </Button>
              </div>

              <div className="max-h-96 overflow-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt="À recadrer"
                    src={selectedImage}
                    onLoad={onImageLoad}
                    className="max-w-full h-auto"
                  />
                </ReactCrop>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !completedCrop}
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
