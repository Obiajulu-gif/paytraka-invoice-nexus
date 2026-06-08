import { useEffect, useMemo, useState } from "react";
import { Eye, Mail, MapPin, Phone, Plus, Trash2, UserRoundPen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  LoadingCards,
  PageHeader,
  SearchToolbar,
} from "@/components/AppPrimitives";
import { CustomerDialog } from "@/components/CustomerDialog";
import { deleteCustomer, getCustomers, type Customer } from "@/services/customersService";
import { getInvoices, type Invoice } from "@/services/invoicesService";
import { formatCurrency } from "@/utils/currency";
import { toast } from "sonner";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const [customerData, invoiceData] = await Promise.all([
        getCustomers(),
        getInvoices(),
      ]);
      setCustomers(customerData);
      setInvoices(invoiceData);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const statsByCustomer = useMemo(() => {
    return invoices.reduce<Record<string, { invoiceCount: number; paid: number }>>(
      (acc, invoice) => {
        if (!acc[invoice.customerId]) {
          acc[invoice.customerId] = { invoiceCount: 0, paid: 0 };
        }
        acc[invoice.customerId].invoiceCount += 1;
        if (invoice.status === "paid") {
          acc[invoice.customerId].paid += invoice.total;
        }
        return acc;
      },
      {},
    );
  }, [invoices]);

  const filteredCustomers = customers.filter((customer) => {
    const query = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query) ||
      customer.address.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Delete ${customer.name}? This action cannot be undone.`)) return;

    try {
      await deleteCustomer(customer.id);
      toast.success("Customer deleted successfully");
      loadCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCustomer(undefined);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="app-section">
        <PageHeader
          title="Customers"
          description="Loading customer records and invoice totals."
        />
        <LoadingCards count={3} />
      </div>
    );
  }

  return (
    <div className="app-section">
      <PageHeader
        eyebrow="Customer records"
        title="Customers"
        description="Manage billing contacts, TIN details, addresses, and customer payment history."
        action={
          <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      <SearchToolbar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search customers by name, email, phone, or address..."
      >
        <Badge variant="outline" className="bg-slate-50 px-3 py-2 text-slate-600">
          {customers.length} customer(s)
        </Badge>
      </SearchToolbar>

      {filteredCustomers.length ? (
        <>
          <div className="grid gap-4 lg:hidden">
            {filteredCustomers.map((customer) => {
              const stats = statsByCustomer[customer.id] || {
                invoiceCount: 0,
                paid: 0,
              };
              return (
                <div key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">{customer.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{customer.taxId || "No TIN on file"}</p>
                    </div>
                    <Badge variant="outline">{stats.invoiceCount} invoices</Badge>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {customer.email}</p>
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {customer.phone}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {customer.address}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-500">Total paid</p>
                      <p className="font-semibold text-primary">{formatCurrency(stats.paid)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(customer)}>
                        <UserRoundPen className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(customer)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="table-shell hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>TIN</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const stats = statsByCustomer[customer.id] || {
                    invoiceCount: 0,
                    paid: 0,
                  };
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium text-slate-950">{customer.name}</div>
                        <div className="text-sm text-slate-500">{customer.createdAt}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-700">{customer.email}</div>
                        <div className="text-sm text-slate-500">{customer.phone}</div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{customer.address}</TableCell>
                      <TableCell>{customer.taxId || "-"}</TableCell>
                      <TableCell>{stats.invoiceCount}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatCurrency(stats.paid)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="View customer">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)} title="Edit customer">
                            <UserRoundPen className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(customer)} title="Delete customer">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add your first customer to start invoicing and tracking payments."
          action={<Button onClick={handleAddNew}>Add Customer</Button>}
        />
      )}

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingCustomer(undefined);
        }}
        customer={editingCustomer}
        onSuccess={loadCustomers}
      />
    </div>
  );
}
