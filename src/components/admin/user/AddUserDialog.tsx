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
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validatePasswords = () => {
    if (newUserData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }
    if (newUserData.password !== newUserData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleAddUser = async () => {
    if (!validatePasswords()) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUserData.email,
          fullName: newUserData.fullName,
          phoneNumber: newUserData.phoneNumber,
          password: newUserData.password,
        },
      });

      if (error) throw error;

      toast({
        title: "User created successfully",
        description: "The user account has been created with the specified password.",
      });

      setIsOpen(false);
      setNewUserData({
        email: "",
        fullName: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
      });
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error creating user",
        description: "There was an error creating the user. Please try again.",
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
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={newUserData.password}
              onChange={(e) =>
                setNewUserData({ ...newUserData, password: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={newUserData.confirmPassword}
              onChange={(e) =>
                setNewUserData({ ...newUserData, confirmPassword: e.target.value })
              }
            />
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
          </div>
          <Button onClick={handleAddUser}>Create User</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;