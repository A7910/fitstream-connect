import { useMemo } from "react";

interface UserMembershipDataProps {
  allUsers: any[];
  memberships: any[];
}

export const useUserMembershipData = ({ allUsers, memberships }: UserMembershipDataProps) => {
  const usersWithMembership = useMemo(() => {
    return allUsers?.map(user => {
      const userMemberships = memberships?.filter(m => m.user_id === user.id) || [];
      // Sort memberships by created_at in descending order and get the latest one
      const latestMembership = userMemberships.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      
      // Check if the membership is active and not expired
      const isActive = latestMembership?.status === "active" && 
        new Date(latestMembership.end_date) >= new Date();
      
      return {
        ...user,
        membership: {
          ...latestMembership,
          status: isActive ? "active" : "inactive"
        }
      };
    }) || [];
  }, [allUsers, memberships]);

  return usersWithMembership;
};