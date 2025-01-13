import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface InvoicePaymentModeSelectProps {
  form: UseFormReturn<any>;
}

export const InvoicePaymentModeSelect = ({ form }: InvoicePaymentModeSelectProps) => {
  return (
    <FormField
      control={form.control}
      name="paymentMode"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Payment Mode</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};