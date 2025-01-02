import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
import { User, Camera } from "lucide-react";

interface ProfileFormProps {
  profile: {
    full_name: string | null;
    phone_number: string | null;
    avatar_url: string | null;
  } | null;
  email: string;
  userId: string;
}

export const ProfileForm = ({ profile, email, userId }: ProfileFormProps) => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhoneNumber(profile.phone_number || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error updating profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = async () => {
    try {
      setIsUploading(true);
      if (avatarUrl) {
        const fileName = avatarUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('profile-pictures')
            .remove([fileName]);
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(null);
      toast.success("Profile picture removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Error removing profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const updates = {
        id: userId,
        full_name: fullName,
        phone_number: phoneNumber,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates);

      if (error) throw error;
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
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
              onChange={handleImageUpload}
              onRemove={handleImageRemove}
            >
              <Button 
                size="icon" 
                variant="secondary" 
                className="rounded-full bg-white hover:bg-gray-100"
              >
                <Camera className="h-4 w-4 text-black" />
              </Button>
            </ImageUpload>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold">{fullName || "Add your name"}</h2>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={updateProfile}
              className="flex-1"
              disabled={isUploading}
            >
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          className="w-full"
        >
          Edit Profile
        </Button>
      )}
    </div>
  );
};
