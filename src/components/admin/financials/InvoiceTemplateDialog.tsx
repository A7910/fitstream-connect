import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";

interface AdminConfig {
  id: string;
  logo_url: string | null;
  gym_name: string | null;
  gym_address: string | null;
  gym_phone: string | null;
  created_at: string;
  updated_at: string;
}

export const InvoiceTemplateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gymConfig } = useQuery({
    queryKey: ["admin_config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_config")
        .select("*")
        .single();

      if (error) throw error;
      return data as AdminConfig;
    },
  });

  const updateGymConfig = useMutation({
    mutationFn: async (updates: Partial<AdminConfig>) => {
      const { data, error } = await supabase
        .from("admin_config")
        .update(updates)
        .eq("id", gymConfig?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_config"] });
      toast({
        title: "Success",
        description: "Gym configuration has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating gym config:", error);
      toast({
        title: "Error",
        description: "Failed to update gym configuration",
        variant: "destructive",
      });
    },
  });

  const handleLogoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      await updateGymConfig.mutateAsync({ logo_url: publicUrl });
      
      toast({
        title: "Logo uploaded",
        description: "The gym logo has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error uploading logo",
        description: "There was an error uploading the logo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogoRemove = async () => {
    try {
      if (gymConfig?.logo_url) {
        const fileName = gymConfig.logo_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('profile-pictures')
            .remove([fileName]);
        }
      }
      
      await updateGymConfig.mutateAsync({ logo_url: null });
      
      toast({
        title: "Logo removed",
        description: "The gym logo has been removed successfully.",
      });
    } catch (error) {
      console.error("Error removing logo:", error);
      toast({
        title: "Error removing logo",
        description: "There was an error removing the logo. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Template</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Invoice Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Gym Logo</Label>
              <ImageUpload
                value={gymConfig?.logo_url}
                onChange={handleLogoUpload}
                onRemove={handleLogoRemove}
              />
            </div>

            <div className="space-y-2">
              <Label>Gym Name</Label>
              <Input
                value={gymConfig?.gym_name || ''}
                onChange={(e) => updateGymConfig.mutate({ gym_name: e.target.value })}
                placeholder="Enter gym name"
              />
            </div>

            <div className="space-y-2">
              <Label>Gym Address</Label>
              <Input
                value={gymConfig?.gym_address || ''}
                onChange={(e) => updateGymConfig.mutate({ gym_address: e.target.value })}
                placeholder="Enter gym address"
              />
            </div>

            <div className="space-y-2">
              <Label>Gym Phone</Label>
              <Input
                value={gymConfig?.gym_phone || ''}
                onChange={(e) => updateGymConfig.mutate({ gym_phone: e.target.value })}
                placeholder="Enter gym phone number"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};