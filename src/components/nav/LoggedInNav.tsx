import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LoggedInNavProps {
  isAdmin: boolean;
  onLogout: () => Promise<void>;
}

const LoggedInNav = ({ isAdmin, onLogout }: LoggedInNavProps) => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">FitStream Connect</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/membership-plans">
              <Button variant="ghost">Membership Plans</Button>
            </Link>
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LoggedInNav;