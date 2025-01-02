import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLinks } from "./NavLinks";

interface MobileMenuProps {
  isMenuOpen: boolean;
  session: any;
  isAdmin: boolean;
  handleLogout: () => void;
}

export const MobileMenu = ({ 
  isMenuOpen, 
  session, 
  isAdmin, 
  handleLogout 
}: MobileMenuProps) => {
  return (
    <div
      className={`md:hidden transition-all duration-300 ease-in-out ${
        isMenuOpen
          ? "max-h-96 opacity-100"
          : "max-h-0 opacity-0 overflow-hidden"
      }`}
    >
      <div className="px-2 pt-2 pb-3 space-y-1 bg-black/90">
        <NavLinks 
          isAdmin={isAdmin} 
          handleLogout={handleLogout} 
          session={session} 
        />
        {!session && (
          <Link to="/login" className="block">
            <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
              Login
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};