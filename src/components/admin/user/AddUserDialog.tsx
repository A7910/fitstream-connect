import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AddUserDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddUser = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUserData.email,
          fullName: newUserData.fullName,
          phoneNumber: newUserData.phoneNumber,
        },
      });

      if (error) throw error;

      toast({
        title: "User invited successfully",
        description: "An invitation email has been sent to the user.",
      });

      setIsOpen(false);
      setNewUserData({ email: "", fullName: "", phoneNumber: "" });
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        title: "Error inviting user",
        description: "There was an error inviting the user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add New User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUserData.email}
              onChange={(e) =>
                setNewUserData({ ...newUserData, email: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={newUserData.fullName}
              onChange={(e) =>
                setNewUserData({ ...newUserData, fullName: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={newUserData.phoneNumber}
              onChange={(e) =>
                setNewUserData({ ...newUserData, phoneNumber: e.target.value })
              }
            />
          </div>
          <Button onClick={handleAddUser}>Invite User</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;