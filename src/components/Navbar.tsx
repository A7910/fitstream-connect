import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gray-900">FitHub</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">Login</Button>
            <Button className="bg-primary hover:bg-primary/90">Sign Up</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;