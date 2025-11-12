import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getCreditNotes, getDebitNotes } from "@/services/adjustmentsService";
import type { CreditNote, DebitNote } from "@/services/adjustmentsService";
import { Plus, Eye } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { toast } from "sonner";

export default function Adjustments() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [debitNotes, setDebitNotes] = useState<DebitNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [credits, debits] = await Promise.all([getCreditNotes(), getDebitNotes()]);
      setCreditNotes(credits);
      setDebitNotes(debits);
    } catch (error) {
      console.error("Error loading adjustment notes:", error);
      toast.error("Failed to load adjustment notes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Credit & Debit Notes</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage invoice adjustments</p>
      </div>

      <Tabs defaultValue="credit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="credit">Credit Notes</TabsTrigger>
          <TabsTrigger value="debit">Debit Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="credit" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Credit Notes</CardTitle>
                <CardDescription>Notes for reducing invoice amounts</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Credit Note
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead>Credit Note #</TableHead>
                  <TableHead className="hidden md:table-cell">Invoice #</TableHead>
                  <TableHead className="hidden lg:table-cell">Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Reason</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="font-medium">{note.creditNoteNumber}</TableCell>
                      <TableCell className="hidden md:table-cell">{note.invoiceNumber}</TableCell>
                      <TableCell className="hidden lg:table-cell">{note.customerName}</TableCell>
                      <TableCell className="hidden sm:table-cell">{note.date}</TableCell>
                      <TableCell>{formatCurrency(note.amount)}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">{note.reason}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={note.status === "issued" ? "default" : "secondary"} className="capitalize">
                          {note.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debit" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Debit Notes</CardTitle>
                <CardDescription>Notes for increasing invoice amounts</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Debit Note
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead>Debit Note #</TableHead>
                  <TableHead className="hidden md:table-cell">Invoice #</TableHead>
                  <TableHead className="hidden lg:table-cell">Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Reason</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debitNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="font-medium">{note.debitNoteNumber}</TableCell>
                      <TableCell className="hidden md:table-cell">{note.invoiceNumber}</TableCell>
                      <TableCell className="hidden lg:table-cell">{note.customerName}</TableCell>
                      <TableCell className="hidden sm:table-cell">{note.date}</TableCell>
                      <TableCell>{formatCurrency(note.amount)}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">{note.reason}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={note.status === "issued" ? "default" : "secondary"} className="capitalize">
                          {note.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
