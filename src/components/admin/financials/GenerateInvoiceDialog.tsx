import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { addDays } from "date-fns";
import { InvoiceMemberSelect } from "./generate-invoice/InvoiceMemberSelect";
import { InvoicePlanSelect } from "./generate-invoice/InvoicePlanSelect";
import { InvoicePaymentModeSelect } from "./generate-invoice/InvoicePaymentModeSelect";

interface GenerateInvoiceForm {
  userId: string;
  planId: string;
  paymentMode: string;
  dueDate: Date;
}

export const GenerateInvoiceDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<GenerateInvoiceForm>({
    defaultValues: {
      dueDate: addDays(new Date(), 7),
    },
  });

  const { data: users } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: plans } = useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("id, name, price, duration_months");
      if (error) throw error;
      return data;
    },
  });

  const onSubmit = async (values: GenerateInvoiceForm) => {
    try {
      const plan = plans?.find((p) => p.id === values.planId);
      if (!plan) throw new Error("Plan not found");

      const { data: membership, error: membershipError } = await supabase
        .from("user_memberships")
        .select()
        .eq("user_id", values.userId)
        .eq("plan_id", values.planId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (membershipError) throw membershipError;

      const { error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: values.userId,
          membership_id: membership.id,
          plan_id: values.planId,
          amount: plan.price,
          status: 'pending',
          payment_mode: values.paymentMode,
          due_date: values.dueDate.toISOString(),
          invoice_number: 'PENDING'
        });

      if (invoiceError) throw invoiceError;

      toast({
        title: "Invoice generated successfully",
        description: "The invoice has been created.",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast({
        title: "Error generating invoice",
        description: "There was an error generating the invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Generate Invoice</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InvoiceMemberSelect form={form} users={users || []} />
            <InvoicePlanSelect form={form} plans={plans || []} />
            <InvoicePaymentModeSelect form={form} />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <DatePicker date={field.value} onDateChange={field.onChange} />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Generate Invoice
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};