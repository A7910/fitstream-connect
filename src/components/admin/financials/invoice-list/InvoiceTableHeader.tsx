import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface InvoiceTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
}

export const InvoiceTableHeader = ({ onSelectAll, allSelected }: InvoiceTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox 
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(checked as boolean)}
          />
        </TableHead>
        <TableHead>Invoice Number</TableHead>
        <TableHead>Member Name</TableHead>
        <TableHead>Plan</TableHead>
        <TableHead>Amount</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Payment Mode</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Due Date</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};