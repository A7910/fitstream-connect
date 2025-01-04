import { useState } from "react";
import { Loader2, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AttendanceDateSelector } from "./AttendanceDateSelector";
import { AttendanceRecordItem } from "./AttendanceRecordItem";
import { useAttendanceRecords } from "./useAttendanceRecords";

export const AttendanceRecords = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  
  const { attendanceRecords, isLoading, handleClearAttendance } = useAttendanceRecords(selectedDate);

  const filteredRecords = attendanceRecords.filter(record => 
    record.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <AttendanceDateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          className="text-destructive hover:bg-destructive/10"
          onClick={handleClearAttendance}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {filteredRecords.map((record) => (
              <AttendanceRecordItem key={record.id} record={record} />
            ))}
            {filteredRecords.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No attendance records found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};