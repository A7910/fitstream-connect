import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
import { User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

      // Upload image to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      // Update profile with new avatar URL
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

  const validatePhoneNumber = (number: string) => {
    // Remove any spaces or special characters
    const cleanNumber = number.replace(/\s+/g, '').replace(/[^\d]/g, '');
    
    // Check if the number starts with Pakistan's country code (92)
    if (!cleanNumber.startsWith('92')) {
      toast.error("Please enter the number with country code (92)");
      return false;
    }
    
    // Check if the number is of valid length (92 + 10 digits)
    if (cleanNumber.length !== 12) {
      toast.error("Please enter a valid Pakistani phone number (92XXXXXXXXXX)");
      return false;
    }
    
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const updatePassword = async () => {
    try {
      if (!validatePassword(newPassword)) {
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("New password and confirmation do not match");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Error updating password");
    }
  };

  const updateProfile = async () => {
    try {
      if (!validatePhoneNumber(phoneNumber)) {
        return;
      }

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
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    }
  };

  return (
    <Card className="bg-white shadow-lg border-none">
      <CardHeader>
        <CardTitle className="text-3xl font-bebas text-primary">Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary/5">
                <User className="h-12 w-12 text-primary" />
              </AvatarFallback>
            </Avatar>
            <ImageUpload
              value={avatarUrl}
              onChange={handleImageUpload}
              onRemove={handleImageRemove}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-poppins text-gray-600">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-50 font-poppins"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-poppins text-gray-600">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="font-poppins"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-poppins text-gray-600">Phone Number (92XXXXXXXXXX)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="92XXXXXXXXXX"
                className="font-poppins"
              />
            </div>

            <Button
              onClick={updateProfile}
              className="w-full bg-primary hover:bg-primary/90 text-white font-poppins"
              disabled={isUploading}
            >
              Update Profile
            </Button>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-poppins text-gray-600">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="font-poppins"
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-poppins text-gray-600">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="font-poppins"
                  placeholder="Confirm new password"
                />
              </div>

              <Button
                onClick={updatePassword}
                className="w-full bg-primary hover:bg-primary/90 text-white font-poppins"
                disabled={!newPassword || !confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
