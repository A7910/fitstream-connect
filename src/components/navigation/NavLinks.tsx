import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Session } from "@supabase/supabase-js";

interface NavLinksProps {
  session: Session | null;
  isAdmin: boolean | undefined;
  onLogout: () => void;
}

export const NavLinks = ({ session, isAdmin, onLogout }: NavLinksProps) => {
  return (
    <div className="flex items-center space-x-4">
      <Link to="/membership-plans">
        <Button variant="ghost">Membership Plans</Button>
      </Link>
      {session ? (
        <>
          <Link to="/workout-plan">
            <Button variant="ghost">Workout Plan</Button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost">Admin Dashboard</Button>
            </Link>
          )}
          <Link to="/profile">
            <Button variant="ghost">Profile</Button>
          </Link>
          <Button variant="ghost" onClick={onLogout}>
            Logout
          </Button>
        </>
      ) : (
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      )}
    </div>
  );
};