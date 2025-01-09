import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoicesTab from "./InvoicesTab";

const FinancialsTab = () => {
  return (
    <Tabs defaultValue="invoices" className="space-y-4">
      <TabsList>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
      </TabsList>
      <TabsContent value="invoices">
        <InvoicesTab />
      </TabsContent>
    </Tabs>
  );
};

export default FinancialsTab;