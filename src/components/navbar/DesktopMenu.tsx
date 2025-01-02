import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLinks } from "./NavLinks";

interface DesktopMenuProps {
  session: any;
  isAdmin: boolean;
  handleLogout: () => void;
}

export const DesktopMenu = ({ session, isAdmin, handleLogout }: DesktopMenuProps) => {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <NavLinks session={session} isAdmin={isAdmin} handleLogout={handleLogout} />
      {!session && (
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      )}
    </div>
  );
};