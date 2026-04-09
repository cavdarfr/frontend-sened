import type {
  CompanyWithRole,
  Invoice,
  InvoiceStatus,
  InvoiceType,
  Quote,
  QuoteStatus,
} from "@/types";

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  draft: "Brouillon",
  sent: "Envoye",
  viewed: "Consulte",
  accepted: "Accepte",
  signed: "Signe",
  refused: "Refuse",
  expired: "Expire",
  converted: "Converti",
};

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyee",
  paid: "Payee",
  overdue: "En retard",
  cancelled: "Annulee",
};

export const invoiceTypeLabels: Record<string, string> = {
  standard: "Facture",
  invoice: "Facture",
  deposit: "Acompte",
  final: "Solde",
  credit_note: "Avoir",
};

export function formatCurrency(amount: number | string | null | undefined): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(amount || 0));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getClientDisplayName(
  client?: { company_name?: string | null; first_name?: string | null; last_name?: string | null } | null,
): string {
  if (!client) return "Client inconnu";

  if (client.company_name?.trim()) {
    return client.company_name;
  }

  const fallback = [client.first_name, client.last_name].filter(Boolean).join(" ").trim();
  return fallback || "Client inconnu";
}

export function getCompanyDisplayName(
  company?: { name?: string | null; siren?: string | null } | null,
): string {
  if (!company) return "Entreprise inconnue";
  if (company.siren) return `${company.name || "Entreprise"} · ${company.siren}`;
  return company.name || "Entreprise inconnue";
}

export function getQuoteStatusLabel(status: QuoteStatus | string): string {
  return quoteStatusLabels[status as QuoteStatus] || status;
}

export function getInvoiceStatusLabel(status: InvoiceStatus | string): string {
  return invoiceStatusLabels[status as InvoiceStatus] || status;
}

export function getInvoiceTypeLabel(type: InvoiceType | string): string {
  return invoiceTypeLabels[type] || type;
}

export function hasCompanyMembership(
  companies: CompanyWithRole[],
  companyId: string,
): boolean {
  return companies.some((company) => company.id === companyId);
}

export function getQuoteDocumentDate(quote: Quote): string {
  return formatDate(quote.issue_date);
}

export function getInvoiceDocumentDate(invoice: Invoice): string {
  return formatDate(invoice.issue_date);
}
