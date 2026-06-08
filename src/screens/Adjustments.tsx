import { useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmptyState,
  InvoiceStatusBadge,
  LoadingCards,
  PageHeader,
} from "@/components/AppPrimitives";
import {
  getCreditNotes,
  getDebitNotes,
  type CreditNote,
  type DebitNote,
} from "@/services/adjustmentsService";
import { CreditNoteDialog } from "@/components/CreditNoteDialog";
import { DebitNoteDialog } from "@/components/DebitNoteDialog";
import { CreditNoteViewDialog } from "@/components/CreditNoteViewDialog";
import { DebitNoteViewDialog } from "@/components/DebitNoteViewDialog";
import { formatCurrency } from "@/utils/currency";
import { toast } from "sonner";

export default function Adjustments() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [debitNotes, setDebitNotes] = useState<DebitNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [debitDialogOpen, setDebitDialogOpen] = useState(false);
  const [viewCreditDialogOpen, setViewCreditDialogOpen] = useState(false);
  const [viewDebitDialogOpen, setViewDebitDialogOpen] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNote | null>(null);
  const [selectedDebitNote, setSelectedDebitNote] = useState<DebitNote | null>(null);

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
    return (
      <div className="app-section">
        <PageHeader title="Credit & Debit Notes" description="Loading adjustment documents." />
        <LoadingCards count={2} />
      </div>
    );
  }

  return (
    <div className="app-section">
      <PageHeader
        eyebrow="Invoice adjustments"
        title="Credit & Debit Notes"
        description="Credit notes reduce invoice amounts. Debit notes increase invoice amounts for additional charges or corrections."
      />

      <Tabs defaultValue="credit" className="space-y-5">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100">
          <TabsTrigger value="credit">Credit Notes</TabsTrigger>
          <TabsTrigger value="debit">Debit Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="credit" className="space-y-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <ArrowDownCircle className="mt-1 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-primary">Credit notes reduce invoice value</h3>
                <p className="text-sm text-primary">
                  Use these for returns, discounts, reversals, or customer credits.
                </p>
              </div>
            </div>
            <Button onClick={() => setCreditDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Credit Note
            </Button>
          </div>

          {creditNotes.length ? (
            <AdjustmentTable
              type="credit"
              notes={creditNotes}
              onView={(note) => {
                setSelectedCreditNote(note as CreditNote);
                setViewCreditDialogOpen(true);
              }}
            />
          ) : (
            <EmptyState
              icon={ArrowDownCircle}
              title="No credit notes yet"
              description="Create a credit note when you need to reduce an invoice amount."
              action={<Button onClick={() => setCreditDialogOpen(true)}>Create Credit Note</Button>}
            />
          )}
        </TabsContent>

        <TabsContent value="debit" className="space-y-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <ArrowUpCircle className="mt-1 h-5 w-5 text-blue-700" />
              <div>
                <h3 className="font-semibold text-blue-950">Debit notes increase invoice value</h3>
                <p className="text-sm text-blue-800">
                  Use these for additional fees, delivery charges, or underbilling corrections.
                </p>
              </div>
            </div>
            <Button onClick={() => setDebitDialogOpen(true)} className="bg-blue-700 hover:bg-blue-800">
              <Plus className="mr-2 h-4 w-4" />
              Create Debit Note
            </Button>
          </div>

          {debitNotes.length ? (
            <AdjustmentTable
              type="debit"
              notes={debitNotes}
              onView={(note) => {
                setSelectedDebitNote(note as DebitNote);
                setViewDebitDialogOpen(true);
              }}
            />
          ) : (
            <EmptyState
              icon={ArrowUpCircle}
              title="No debit notes yet"
              description="Create a debit note when you need to increase an invoice amount."
              action={<Button onClick={() => setDebitDialogOpen(true)}>Create Debit Note</Button>}
            />
          )}
        </TabsContent>
      </Tabs>

      <CreditNoteDialog
        open={creditDialogOpen}
        onOpenChange={setCreditDialogOpen}
        onSuccess={loadData}
      />
      <DebitNoteDialog
        open={debitDialogOpen}
        onOpenChange={setDebitDialogOpen}
        onSuccess={loadData}
      />
      <CreditNoteViewDialog
        open={viewCreditDialogOpen}
        onOpenChange={setViewCreditDialogOpen}
        creditNote={selectedCreditNote}
      />
      <DebitNoteViewDialog
        open={viewDebitDialogOpen}
        onOpenChange={setViewDebitDialogOpen}
        debitNote={selectedDebitNote}
      />
    </div>
  );
}

type Adjustment = CreditNote | DebitNote;

function AdjustmentTable({
  notes,
  type,
  onView,
}: {
  notes: Adjustment[];
  type: "credit" | "debit";
  onView: (note: Adjustment) => void;
}) {
  return (
    <div className="table-shell">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>{type === "credit" ? "Credit Note" : "Debit Note"}</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="hidden md:table-cell">Reason</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note) => (
            <TableRow key={note.id}>
              <TableCell className="font-semibold text-slate-950">
                {"creditNoteNumber" in note ? note.creditNoteNumber : note.debitNoteNumber}
              </TableCell>
              <TableCell>{note.invoiceNumber}</TableCell>
              <TableCell>{note.customerName}</TableCell>
              <TableCell className={type === "credit" ? "font-semibold text-primary" : "font-semibold text-blue-700"}>
                {formatCurrency(note.amount)}
              </TableCell>
              <TableCell className="hidden max-w-sm truncate md:table-cell">
                {note.reason}
              </TableCell>
              <TableCell className="hidden md:table-cell">{note.date}</TableCell>
              <TableCell>
                <InvoiceStatusBadge status={note.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onView(note)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
