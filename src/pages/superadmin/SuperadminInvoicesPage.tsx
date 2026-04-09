import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Download, Eye, Receipt, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { superadminService } from "@/services/api";
import { useCompany } from "@/hooks/useCompany";
import { SuperadminCompanyFilter } from "./SuperadminCompanyFilter";
import type {
  Invoice,
  InvoiceStatus,
  SuperadminCompanySummary,
} from "@/types";
import {
  formatCurrency,
  getClientDisplayName,
  getCompanyDisplayName,
  getInvoiceDocumentDate,
  getInvoiceStatusLabel,
  getInvoiceTypeLabel,
  hasCompanyMembership,
  invoiceStatusLabels,
} from "./superadmin-utils";

export function SuperadminInvoicesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { companies } = useCompany();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [selectedCompany, setSelectedCompany] =
    useState<SuperadminCompanySummary | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await superadminService.getInvoices({
          page,
          limit: 20,
          search: search || undefined,
          status: status === "all" ? undefined : status,
          company_id: selectedCompany?.id,
        });
        setInvoices(response.invoices);
        setTotalPages(response.totalPages);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message || "Impossible de charger les factures.",
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [page, search, selectedCompany?.id, status, toast]);

  const handleDownload = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const blob = await superadminService.downloadInvoicePdf(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de telecharger le PDF.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Factures globales</h1>
          <p className="text-muted-foreground">
            Consultation en lecture seule sur toutes les entreprises.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/superadmin">Retour au hub</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Numero ou titre"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setPage(1);
              setStatus(value as InvoiceStatus | "all");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(invoiceStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SuperadminCompanyFilter
            value={selectedCompany}
            onChange={(company) => {
              setPage(1);
              setSelectedCompany(company);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultats</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facture</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Aucune facture trouvee.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-muted-foreground" />
                              {invoice.invoice_number}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {getInvoiceTypeLabel(invoice.type)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getCompanyDisplayName(invoice.company)}</TableCell>
                        <TableCell>{getClientDisplayName(invoice.client)}</TableCell>
                        <TableCell>{getInvoiceDocumentDate(invoice)}</TableCell>
                        <TableCell>{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getInvoiceStatusLabel(invoice.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/superadmin/invoices/${invoice.id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownload(invoice.id, invoice.invoice_number)
                              }
                            >
                              <Download className="mr-2 h-4 w-4" />
                              PDF
                            </Button>
                            {hasCompanyMembership(companies, invoice.company_id) && (
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/companies/${invoice.company_id}`}>
                                  <Building2 className="mr-2 h-4 w-4" />
                                  Entreprise
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} sur {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Precedent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
