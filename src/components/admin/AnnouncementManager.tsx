import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const AnnouncementManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data: currentAnnouncement, isLoading } = useQuery({
    queryKey: ["announcement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async () => {
      // Set all existing announcements to inactive
      await supabase
        .from("announcements")
        .update({ is_active: false })
        .eq("is_active", true);

      // Create new announcement
      const { data, error } = await supabase
        .from("announcements")
        .insert([
          {
            message: newMessage,
            is_active: isActive,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["announcement"] });
    },
    onError: (error) => {
      console.error("Error creating announcement:", error);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Announcement Manager</CardTitle>
        <CardDescription>Create and manage announcements for users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentAnnouncement && (
            <div className="p-4 border rounded-lg bg-muted">
              <p className="font-medium mb-2">Current Announcement:</p>
              <p>{currentAnnouncement.message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Status: {currentAnnouncement.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="announcement">New Announcement</Label>
            <Textarea
              id="announcement"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Enter announcement message"
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="active">Make announcement active</Label>
          </div>

          <Button
            onClick={() => createAnnouncement.mutate()}
            disabled={!newMessage}
          >
            Post Announcement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnouncementManager;