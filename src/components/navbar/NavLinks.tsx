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
      <Link to="/membership-plans" className="w-full">
        <Button variant="ghost" className="font-poppins w-full">Membership Plans</Button>
      </Link>
      {session && (
        <>
          <Link to="/workout-plan" className="w-full">
            <Button variant="ghost" className="font-poppins w-full">Workout Plan</Button>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="w-full">
              <Button variant="ghost" className="font-poppins w-full">Admin Dashboard</Button>
            </Link>
          )}
          <Link to="/profile" className="w-full">
            <Button variant="ghost" className="font-poppins w-full">Profile</Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="font-poppins w-full">
            Logout
          </Button>
        </>
      )}
    </>
  );
};