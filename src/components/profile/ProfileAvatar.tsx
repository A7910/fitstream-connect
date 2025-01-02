import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { User, Camera } from "lucide-react";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  isUploading: boolean;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
}

export const ProfileAvatar = ({
  avatarUrl,
  isUploading,
  onImageUpload,
  onImageRemove,
}: ProfileAvatarProps) => {
  return (
    <div className="relative">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback>
          <User className="h-12 w-12" />
        </AvatarFallback>
      </Avatar>
      <div className="absolute bottom-0 right-0">
        <ImageUpload
          value={avatarUrl}
          onChange={onImageUpload}
          onRemove={onImageRemove}
          disabled={isUploading}
        >
          <Button 
            size="icon" 
            variant="secondary" 
            className="rounded-full bg-white hover:bg-gray-100 shadow-md"
            disabled={isUploading}
          >
            <Camera className="h-4 w-4 text-black" />
          </Button>
        </ImageUpload>
      </div>
    </div>
  );
};