import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody } from "@/components/ui/table";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { GenerateInvoiceDialog } from "./GenerateInvoiceDialog";
import { InvoiceTableHeader } from "./invoice-list/InvoiceTableHeader";
import { InvoiceTableRow } from "./invoice-list/InvoiceTableRow";
import { InvoiceActions } from "./invoice-list/InvoiceActions";

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

  const { data: defaultTemplate } = useQuery({
    queryKey: ["default-template"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_templates")
        .select("*")
        .eq("is_default", true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No default template",
          description: "Please create a default invoice template.",
          variant: "default",
        });
        return null;
      }

      return data[0];
    },
  });

  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async ({ invoiceId, status }: { invoiceId: string; status: string }) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", invoiceId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Status updated",
        description: "Invoice status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating status",
        description: "There was an error updating the invoice status. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating invoice status:", error);
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

  const handleStatusChange = (invoiceId: string, status: string) => {
    updateInvoiceStatusMutation.mutate({ invoiceId, status });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <div className="flex gap-2">
          <GenerateInvoiceDialog />
          <InvoiceActions 
            selectedCount={selectedInvoices.length}
            onDelete={() => deleteInvoiceMutation.mutate(selectedInvoices)}
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <InvoiceTableHeader 
            onSelectAll={handleSelectAll}
            allSelected={selectedInvoices.length === invoices?.length}
          />
          <TableBody>
            {invoices?.map((invoice) => (
              <InvoiceTableRow
                key={invoice.id}
                invoice={invoice}
                selected={selectedInvoices.includes(invoice.id)}
                onSelect={(checked) => handleSelectInvoice(invoice.id, checked)}
                onStatusChange={(status) => handleStatusChange(invoice.id, status)}
                template={defaultTemplate?.template_data}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InvoicesTab;