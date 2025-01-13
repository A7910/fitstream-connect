import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface InvoicePlanSelectProps {
  form: UseFormReturn<any>;
  plans: any[];
}

export const InvoicePlanSelect = ({ form, plans }: InvoicePlanSelectProps) => {
  return (
    <FormField
      control={form.control}
      name="planId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Membership Plan</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {plans?.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};