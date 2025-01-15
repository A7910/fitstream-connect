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
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";

interface TemplateForm {
  name: string;
  isDefault: boolean;
  header: {
    showLogo: boolean;
    companyName: string;
    showAddress: boolean;
    showPhone: boolean;
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
    showLogo: true,
    companyName: "Gym Name",
    showAddress: true,
    showPhone: true,
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

  const { data: gymConfig } = useQuery({
    queryKey: ["gym-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_config")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  const updateGymConfig = useMutation({
    mutationFn: async (values: {
      gym_name?: string;
      gym_address?: string;
      gym_phone?: string;
      logo_url?: string;
    }) => {
      const { error } = await supabase
        .from("admin_config")
        .update(values)
        .eq("id", gymConfig?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-config"] });
      toast({
        title: "Gym details updated",
        description: "The gym details have been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating gym details:", error);
      toast({
        title: "Error updating gym details",
        description: "There was an error updating the gym details. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (values: TemplateForm) => {
      console.log("Submitting template with values:", values);
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

  const handleLogoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      await updateGymConfig.mutateAsync({ logo_url: publicUrl });
      
      toast({
        title: "Logo uploaded",
        description: "The gym logo has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error uploading logo",
        description: "There was an error uploading the logo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogoRemove = async () => {
    try {
      if (gymConfig?.logo_url) {
        const fileName = gymConfig.logo_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('profile-pictures')
            .remove([fileName]);
        }
      }
      
      await updateGymConfig.mutateAsync({ logo_url: null });
      
      toast({
        title: "Logo removed",
        description: "The gym logo has been removed successfully.",
      });
    } catch (error) {
      console.error("Error removing logo:", error);
      toast({
        title: "Error removing logo",
        description: "There was an error removing the logo. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Gym Details</h3>
            <div className="space-y-4">
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={gymConfig?.logo_url}
                    onChange={handleLogoUpload}
                    onRemove={handleLogoRemove}
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Gym Name</FormLabel>
                <FormControl>
                  <Input
                    value={gymConfig?.gym_name || ""}
                    onChange={(e) =>
                      updateGymConfig.mutate({ gym_name: e.target.value })
                    }
                    placeholder="Enter gym name"
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea
                    value={gymConfig?.gym_address || ""}
                    onChange={(e) =>
                      updateGymConfig.mutate({ gym_address: e.target.value })
                    }
                    placeholder="Enter gym address"
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    value={gymConfig?.gym_phone || ""}
                    onChange={(e) =>
                      updateGymConfig.mutate({ gym_phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </FormControl>
              </FormItem>
            </div>
          </div>

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
                  name="header.showLogo"
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
                  name="header.showAddress"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Show Address</FormLabel>
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
                  name="header.showPhone"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Show Phone</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Content</h3>
                <FormField
                  control={form.control}
                  name="body.showMemberDetails"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Show Member Details</FormLabel>
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
                  name="body.showPlanDetails"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Show Plan Details</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Footer</h3>
                <FormField
                  control={form.control}
                  name="footer.showTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Show Terms</FormLabel>
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
                  name="footer.terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms Text</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
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
                <FormField
                  control={form.control}
                  name="style.secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
