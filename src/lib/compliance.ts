import { Company, Customer, InvoiceLineItem } from "@/types/api";

export function customerComplianceIssues(customer?: Customer) {
  if (!customer) return ["customer record"];
  const issues: string[] = [];
  if (!customer.state) issues.push("state");
  if (!customer.lga) issues.push("LGA");
  if (!customer.street_name && !customer.billing_address) issues.push("street name");
  if (!customer.city) issues.push("city");
  if (!customer.postal_code) issues.push("postal zone");
  if (!customer.business_description) issues.push("description");
  if (!customer.phone1?.startsWith("+")) issues.push("telephone starting with +");
  if (!customer.tax_identification_number) issues.push("TIN");
  return issues;
}

export function companyComplianceIssues(company?: Company | null) {
  if (!company) return ["supplier profile"];
  const issues: string[] = [];
  if (!company.street_name && !company.address) issues.push("street name");
  if (!company.country) issues.push("country");
  if (!company.postal_code) issues.push("postal zone");
  if (!company.city) issues.push("city");
  if (!company.state) issues.push("state");
  if (!company.lga) issues.push("LGA");
  if (!company.description) issues.push("description");
  if (!company.business_phone?.startsWith("+")) issues.push("telephone starting with +");
  return issues;
}

export function lineItemComplianceIssues(items: InvoiceLineItem[] = []) {
  const issues: string[] = [];
  if (!items.length) return ["line items"];
  items.forEach((item, index) => {
    const label = `line ${index + 1}`;
    if (!item.hsn_code) issues.push(`${label} HSN code`);
    if (!item.product_category) issues.push(`${label} product category`);
    if (!(Number(item.quantity) > 0)) issues.push(`${label} quantity`);
    if (!item.description) issues.push(`${label} description`);
  });
  return issues;
}

export function complianceScore(customer: Customer) {
  const total = 8;
  return Math.round(((total - customerComplianceIssues(customer).length) / total) * 100);
}
