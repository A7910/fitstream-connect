import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "@/components/ui/color-picker";

interface TemplateForm {
  name: string;
  isDefault: boolean;
  header: {
    logo: boolean;
    companyName: string;
    companyAddress: string;
    companyContact: string;
  };
  body: {
    showMemberDetails: boolean;
    showPlanDetails: boolean;
    showPaymentDetails: boolean;
  };
  footer: {
    showTerms: boolean;
    terms: string;
    showSignature: boolean;
  };
  style: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

const defaultValues: TemplateForm = {
  name: "",
  isDefault: false,
  header: {
    logo: true,
    companyName: "Gym Name",
    companyAddress: "",
    companyContact: "",
  },
  body: {
    showMemberDetails: true,
    showPlanDetails: true,
    showPaymentDetails: true,
  },
  footer: {
    showTerms: true,
    terms: "Thank you for your business!",
    showSignature: true,
  },
  style: {
    primaryColor: "#000000",
    secondaryColor: "#666666",
    fontFamily: "Helvetica",
  },
};

export const InvoiceTemplateDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<TemplateForm>({
    defaultValues,
  });

  const { data: templates } = useQuery({
    queryKey: ["invoice-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_templates")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (values: TemplateForm) => {
      console.log("Submitting template with values:", values); // Debug log
      const { error } = await supabase.from("invoice_templates").insert({
        name: values.name,
        is_default: values.isDefault,
        template_data: {
          header: values.header,
          body: values.body,
          footer: values.footer,
          style: values.style,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice-templates"] });
      setOpen(false);
      form.reset(defaultValues);
      toast({
        title: "Template created",
        description: "The invoice template has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating template:", error);
      toast({
        title: "Error creating template",
        description: "There was an error creating the template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: TemplateForm) => {
    if (!values.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }
    createTemplateMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Templates</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Template</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Set as Default</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Header</h3>
              <FormField
                control={form.control}
                name="header.logo"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Show Logo</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="header.companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Style</h3>
              <FormField
                control={form.control}
                name="style.primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <FormControl>
                      <ColorPicker {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Save Template
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};