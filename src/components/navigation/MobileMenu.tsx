import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLinks } from "./NavLinks";

interface MobileMenuProps {
  isOpen: boolean;
  session: any;
  isAdmin: boolean;
  onLogout: () => void;
}

export const MobileMenu = ({ isOpen, session, isAdmin, onLogout }: MobileMenuProps) => {
  return (
    <div
      className={`md:hidden transition-all duration-300 ease-in-out ${
        isOpen
          ? "max-h-96 opacity-100"
          : "max-h-0 opacity-0 overflow-hidden"
      }`}
    >
      <div className="px-2 pt-2 pb-3 space-y-1">
        <NavLinks session={session} isAdmin={isAdmin} onLogout={onLogout} />
        {!session && (
          <Link to="/login" className="block">
            <Button className="w-full">Login</Button>
          </Link>
        )}
      </div>
    </div>
  );
};