import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Download, Eye, FileText, Search } from "lucide-react";
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
  Quote,
  QuoteStatus,
  SuperadminCompanySummary,
} from "@/types";
import {
  formatCurrency,
  getClientDisplayName,
  getCompanyDisplayName,
  getQuoteDocumentDate,
  getQuoteStatusLabel,
  hasCompanyMembership,
  quoteStatusLabels,
} from "./superadmin-utils";

export function SuperadminQuotesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { companies } = useCompany();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<QuoteStatus | "all">("all");
  const [selectedCompany, setSelectedCompany] =
    useState<SuperadminCompanySummary | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await superadminService.getQuotes({
          page,
          limit: 20,
          search: search || undefined,
          status: status === "all" ? undefined : status,
          company_id: selectedCompany?.id,
        });
        setQuotes(response.quotes);
        setTotalPages(response.totalPages);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message || "Impossible de charger les devis.",
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [page, search, selectedCompany?.id, status, toast]);

  const handleDownload = async (quoteId: string, quoteNumber: string) => {
    try {
      const blob = await superadminService.downloadQuotePdf(quoteId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quoteNumber}.pdf`;
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
          <h1 className="text-2xl font-bold">Devis globaux</h1>
          <p className="text-muted-foreground">
            Lecture transversale des devis de toutes les entreprises.
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
              setStatus(value as QuoteStatus | "all");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(quoteStatusLabels).map(([value, label]) => (
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
                    <TableHead>Devis</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Aucun devis trouve.
                      </TableCell>
                    </TableRow>
                  ) : (
                    quotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {quote.quote_number}
                          </div>
                        </TableCell>
                        <TableCell>{getCompanyDisplayName(quote.company)}</TableCell>
                        <TableCell>{getClientDisplayName(quote.client)}</TableCell>
                        <TableCell>{getQuoteDocumentDate(quote)}</TableCell>
                        <TableCell>{formatCurrency(quote.total)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getQuoteStatusLabel(quote.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/superadmin/quotes/${quote.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownload(quote.id, quote.quote_number)
                              }
                            >
                              <Download className="mr-2 h-4 w-4" />
                              PDF
                            </Button>
                            {hasCompanyMembership(companies, quote.company_id) && (
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/companies/${quote.company_id}`}>
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
