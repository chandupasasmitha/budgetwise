"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { addPaymentMethod, getPaymentMethods } from "@/lib/db-books";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PaymentMethods() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; name: string }[]>([]);
  const [newMethodName, setNewMethodName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMethods() {
      if (user) {
        setIsLoading(true);
        const methods = await getPaymentMethods(user.uid);
        setPaymentMethods(methods);
        setIsLoading(false);
      }
    }
    fetchMethods();
  }, [user]);

  const handleAddMethod = async () => {
    if (!user || !newMethodName.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Payment method name cannot be empty.",
      });
      return;
    }
    try {
      const newId = await addPaymentMethod({ name: newMethodName, userId: user.uid });
      setPaymentMethods([...paymentMethods, { id: newId, name: newMethodName }]);
      setNewMethodName("");
      toast({
        title: "Success",
        description: "New payment method added.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add payment method.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="New payment method name..."
          value={newMethodName}
          onChange={(e) => setNewMethodName(e.target.value)}
        />
        <Button onClick={handleAddMethod}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">{method.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No payment methods found. Add one above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
