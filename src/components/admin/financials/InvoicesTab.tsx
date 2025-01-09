import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const InvoicesTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          profiles:user_id (full_name),
          membership_plans:plan_id (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setSelectedInvoices([]);
      toast({
        title: "Invoices deleted",
        description: "Selected invoices have been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting invoices",
        description: "There was an error deleting the invoices. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting invoices:", error);
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(invoices?.map(invoice => invoice.id) || []);
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, id]);
    } else {
      setSelectedInvoices(prev => prev.filter(invoiceId => invoiceId !== id));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoices</h2>
        {selectedInvoices.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Selected</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the selected invoices.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteInvoiceMutation.mutate(selectedInvoices)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedInvoices.length === invoices?.length}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
              </TableHead>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Member Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices?.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedInvoices.includes(invoice.id)}
                    onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.profiles?.full_name}</TableCell>
                <TableCell>{invoice.membership_plans?.name}</TableCell>
                <TableCell>${invoice.amount}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell>{invoice.payment_mode || '-'}</TableCell>
                <TableCell>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InvoicesTab;