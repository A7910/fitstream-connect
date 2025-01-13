import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { InvoicePDF } from "../InvoicePDF";
import { InvoiceStatusSelect } from "./InvoiceStatusSelect";

interface InvoiceTableRowProps {
  invoice: any;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusChange: (status: string) => void;
  template: any;
}

export const InvoiceTableRow = ({ 
  invoice, 
  selected, 
  onSelect, 
  onStatusChange,
  template 
}: InvoiceTableRowProps) => {
  return (
    <TableRow>
      <TableCell>
        <Checkbox 
          checked={selected}
          onCheckedChange={(checked) => onSelect(checked as boolean)}
        />
      </TableCell>
      <TableCell>{invoice.invoice_number}</TableCell>
      <TableCell>{invoice.profiles?.full_name}</TableCell>
      <TableCell>{invoice.membership_plans?.name}</TableCell>
      <TableCell>${invoice.amount}</TableCell>
      <TableCell>
        <InvoiceStatusSelect 
          status={invoice.status}
          onStatusChange={(status) => onStatusChange(status)}
        />
      </TableCell>
      <TableCell>{invoice.payment_mode || '-'}</TableCell>
      <TableCell>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</TableCell>
      <TableCell>
        {invoice.due_date ? format(new Date(invoice.due_date), 'MMM dd, yyyy') : '-'}
      </TableCell>
      <TableCell>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              View PDF
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <InvoicePDF invoice={invoice} template={template} />
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
};