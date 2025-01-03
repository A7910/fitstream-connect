import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NavLinksProps {
  session: any;
  isAdmin: boolean;
  handleLogout: () => void;
}

export const NavLinks = ({ session, isAdmin, handleLogout }: NavLinksProps) => {
  return (
    <>
      <Link to="/membership-plans">
        <Button variant="ghost" className="font-poppins">Membership Plans</Button>
      </Link>
      {session && (
        <>
          <Link to="/workout-plan">
            <Button variant="ghost" className="font-poppins">Workout Plan</Button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" className="font-poppins">Admin Dashboard</Button>
            </Link>
          )}
          <Link to="/profile">
            <Button variant="ghost" className="font-poppins">Profile</Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="font-poppins">
            Logout
          </Button>
        </>
      )}
    </>
  );
};