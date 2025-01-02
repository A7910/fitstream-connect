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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

const AnnouncementManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [messageType, setMessageType] = useState("info");

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
            message_type: messageType,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Fetch all active subscriptions and send push notifications
      const { data: profiles } = await supabase
        .from('profiles')
        .select('push_subscription')
        .not('push_subscription', 'is', null);

      if (profiles) {
        for (const profile of profiles) {
          try {
            await fetch('/api/send-push-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subscription: profile.push_subscription,
                notification: {
                  message: newMessage,
                }
              }),
            });
          } catch (error) {
            console.error('Error sending push notification:', error);
          }
        }
      }

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

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

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
              <div className="flex items-center gap-2 mb-2">
                <span>{getMessageTypeIcon(currentAnnouncement.message_type)}</span>
                <p className="font-medium">Current Announcement:</p>
              </div>
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

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>Message Type</Label>
              <Select
                value={messageType}
                onValueChange={(value) => setMessageType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span>Information</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="success">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Success</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="warning">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Warning</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="alert">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Alert</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="active">Make announcement active</Label>
            </div>
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