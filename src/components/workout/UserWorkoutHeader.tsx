import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";

export const UserWorkoutHeader = () => {
  const { data: profile, isLoading } = useUserProfile();

  return (
    <CardHeader>
      <CardTitle>
        {isLoading
          ? "Loading..."
          : profile?.full_name
          ? `${profile.full_name}, Here is your workout plan`
          : "Here is your workout plan"}
      </CardTitle>
    </CardHeader>
  );
};