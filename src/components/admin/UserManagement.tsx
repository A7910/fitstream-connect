import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserManagementProps {
  memberships: any[];
}

const UserManagement = ({ memberships }: UserManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {memberships?.map((membership) => (
            <div
              key={membership.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{membership.profile?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  Status: {membership.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires: {new Date(membership.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {membership.profile?.phone_number}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;