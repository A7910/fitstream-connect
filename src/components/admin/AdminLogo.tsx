import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const AdminLogo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [newLogoUrl, setNewLogoUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: logoConfig } = useQuery({
    queryKey: ["adminConfig"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_config")
        .select("*")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const updateLogo = useMutation({
    mutationFn: async (url: string) => {
      const { error } = await supabase
        .from("admin_config")
        .update({ 
          logo_url: url,
          updated_at: new Date().toISOString()
        })
        .eq("id", logoConfig?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminConfig"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Logo updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating logo:", error);
      toast({
        title: "Error",
        description: "Failed to update logo",
        variant: "destructive",
      });
    },
  });

  const handleUpdateLogo = () => {
    if (!newLogoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    updateLogo.mutate(newLogoUrl);
  };

  return (
    <div className="space-y-4">
      <img
        src={logoConfig?.logo_url}
        alt="Admin Dashboard Logo"
        className="h-12 w-12 object-cover rounded-full"
      />
      {isEditing ? (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter new logo URL"
            value={newLogoUrl}
            onChange={(e) => setNewLogoUrl(e.target.value)}
          />
          <Button onClick={handleUpdateLogo}>Save</Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          Change Logo
        </Button>
      )}
    </div>
  );
};

export default AdminLogo;