import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RecordExpenseDialog } from "./RecordExpenseDialog";

const ExpensesTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select()
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setSelectedExpenses([]);
      toast({
        title: "Expenses deleted",
        description: "Selected expenses have been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting expenses",
        description: "There was an error deleting the expenses. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting expenses:", error);
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(expenses?.map(expense => expense.id) || []);
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleSelectExpense = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedExpenses(prev => [...prev, id]);
    } else {
      setSelectedExpenses(prev => prev.filter(expenseId => expenseId !== id));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <div className="flex gap-2">
          {selectedExpenses.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Selected</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the selected expenses.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteExpenseMutation.mutate(selectedExpenses)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <RecordExpenseDialog />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedExpenses.length === expenses?.length}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses?.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedExpenses.includes(expense.id)}
                    onCheckedChange={(checked) => handleSelectExpense(expense.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.description || '-'}</TableCell>
                <TableCell>${expense.amount}</TableCell>
                <TableCell>{expense.payment_mode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ExpensesTab;