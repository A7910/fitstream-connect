import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import AdminLogo from "./AdminLogo";

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">Muneeb Chupa</h1>
        <div className="mt-4">
          <AdminLogo />
        </div>
      </div>
      <Button variant="outline" onClick={onLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default AdminHeader;