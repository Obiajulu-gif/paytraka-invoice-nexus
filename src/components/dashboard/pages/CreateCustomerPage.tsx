import { Button, ComplianceAlert, FormShell, PageHeader } from "../ui";

export function CreateCustomerPage({ supplier = false }: { supplier?: boolean }) {
  const type = supplier ? "Supplier" : "Customer";
  const sections: [string, string[]][] = supplier
    ? [["Supplier Type", ["Business", "Individual", "Contractor", "Government"]], ["Basic Information", ["Supplier Name", "Contact Person", "Email Address", "Phone Number", "Category", "Status"]], ["Tax and Compliance Details", ["Supplier TIN", "RC Number / BN Number", "VAT Registered", "VAT Number", "Buyer Type"]], ["Supplier Address", ["Address Line 1", "Address Line 2", "City", "State", "Country", "Postal Code"]], ["Bank and Payment Details", ["Bank Name", "Account Number", "Account Name", "Preferred Payment Method", "Payment Terms"]], ["Purchase Preferences", ["Default internal notes", "Automatically flag missing TIN", "Attach purchase documents by default"]], ["Notes & Documents", ["Private Notes", "Upload certificate/contract/KYC documents"]]]
    : [["Customer Type", ["Business", "Individual", "Government", "Non-profit"]], ["Basic Information", ["Customer Name", "Contact Person", "Email Address", "Phone Number", "Alternative Phone", "Category", "Status"]], ["Tax & Compliance Details", ["Customer TIN", "RC Number / BN Number", "VAT Registered", "VAT Number", "Buyer Type"]], ["Billing Address", ["Address Line 1", "Address Line 2", "City", "State", "Country", "Postal Code"]], ["Invoice & Payment Preferences", ["Payment Terms", "Preferred Currency", "Automatically email invoices to this customer", "Attach payment link to every invoice", "Default invoice note"]], ["Internal Notes & Documents", ["Private notes", "Upload certificate/contract/KYC documents"]]];
  return (
    <>
      <PageHeader breadcrumb={`Dashboard / ${supplier ? "Suppliers" : "Customers"} / Create ${type}`} title={`Create ${type}`} subtitle={`Add ${supplier ? "vendor" : "buyer"} details for invoices, receipts, payment tracking, and e-invoicing validation.`} action={<><Button variant="secondary" href={`/dashboard/${supplier ? "suppliers" : "customers"}`}>Cancel</Button><Button variant="secondary">Save and Create Invoice</Button><Button>Save {type}</Button></>} />
      <ComplianceAlert title="Tax Identification Missing" text={`${type} TIN improves invoice validation and reduces failed FIRS/NRS submissions.`} />
      <FormShell title={`Create ${type}`} sideTitle="Readiness Checklist" sections={sections} buttons={[`Save ${type}`]} />
    </>
  );
}
