import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NavLinksProps {
  isAdmin: boolean;
  handleLogout: () => void;
  session: any;
}

export const NavLinks = ({ isAdmin, handleLogout, session }: NavLinksProps) => {
  return (
    <>
      <Link to="/membership-plans">
        <Button variant="ghost" className="text-white hover:text-yellow-400">
          Membership Plans
        </Button>
      </Link>
      {session && (
        <>
          <Link to="/workout-plan">
            <Button variant="ghost" className="text-white hover:text-yellow-400">
              Workout Plan
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" className="text-white hover:text-yellow-400">
                Admin Dashboard
              </Button>
            </Link>
          )}
          <Link to="/profile">
            <Button variant="ghost" className="text-white hover:text-yellow-400">
              Profile
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-white hover:text-yellow-400"
          >
            Logout
          </Button>
        </>
      )}
    </>
  );
};