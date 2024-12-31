import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveMembersList } from "./attendance/ActiveMembersList";
import { AttendanceRecords } from "./attendance/AttendanceRecords";

const AttendanceManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active-members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active-members">Active Members</TabsTrigger>
            <TabsTrigger value="attendance-record">Attendance Record</TabsTrigger>
          </TabsList>

          <TabsContent value="active-members">
            <ActiveMembersList />
          </TabsContent>

          <TabsContent value="attendance-record">
            <AttendanceRecords />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AttendanceManagement;