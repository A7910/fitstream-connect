import { useState } from "react";
import { Loader2, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AttendanceDateSelector } from "./AttendanceDateSelector";
import { AttendanceRecordItem } from "./AttendanceRecordItem";
import { useAttendanceRecords } from "./useAttendanceRecords";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const RECORDS_PER_PAGE = 8;

export const AttendanceRecords = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { attendanceRecords, isLoading, handleClearAttendance } = useAttendanceRecords(selectedDate);

  const filteredRecords = attendanceRecords.filter(record => 
    record.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + RECORDS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <AttendanceDateSelector
          selectedDate={selectedDate}
          onDateChange={(date) => {
            setSelectedDate(date);
            setCurrentPage(1); // Reset to first page when date changes
          }}
        />

        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
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
            {paginatedRecords.map((record) => (
              <AttendanceRecordItem key={record.id} record={record} />
            ))}
            {filteredRecords.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No attendance records found
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
};