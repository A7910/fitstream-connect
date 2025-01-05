import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";

export const UserWorkoutHeader = () => {
  const { data: profile, isLoading } = useUserProfile();

  return (
    <CardHeader>
      <CardTitle>
        {isLoading ? (
          "Loading..."
        ) : profile?.full_name ? (
          <>
            <span className="font-bold">{profile.full_name}</span>
            <span>, Here is your workout plan</span>
          </>
        ) : (
          "Here is your workout plan"
        )}
      </CardTitle>
    </CardHeader>
  );
};