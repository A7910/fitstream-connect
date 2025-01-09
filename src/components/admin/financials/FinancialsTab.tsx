import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoicesTab from "./InvoicesTab";
import { GenerateInvoiceDialog } from "./GenerateInvoiceDialog";

const FinancialsTab = () => {
  return (
    <Tabs defaultValue="invoices" className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        <GenerateInvoiceDialog />
      </div>
      <TabsContent value="invoices">
        <InvoicesTab />
      </TabsContent>
    </Tabs>
  );
};

export default FinancialsTab;