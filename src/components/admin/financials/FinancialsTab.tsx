import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoicesTab from "./InvoicesTab";
import ExpensesTab from "./ExpensesTab";

const FinancialsTab = () => {
  return (
    <Tabs defaultValue="invoices" className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="invoices">
        <InvoicesTab />
      </TabsContent>
      <TabsContent value="expenses">
        <ExpensesTab />
      </TabsContent>
    </Tabs>
  );
};

export default FinancialsTab;