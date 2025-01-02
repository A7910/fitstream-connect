import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

export const MobileMenu = ({ isOpen, toggleMenu }: MobileMenuProps) => {
  return (
    <Button variant="ghost" size="icon" onClick={toggleMenu}>
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  );
};