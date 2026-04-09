import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { superadminService } from "@/services/api";
import { useCompany } from "@/hooks/useCompany";
import type { Quote } from "@/types";
import {
  formatCurrency,
  formatDate,
  getClientDisplayName,
  getCompanyDisplayName,
  getQuoteStatusLabel,
  hasCompanyMembership,
} from "./superadmin-utils";

export function SuperadminQuoteDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { companies } = useCompany();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const response = await superadminService.getQuoteById(id);
        setQuote(response);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message || "Impossible de charger ce devis.",
        });
        navigate("/superadmin/quotes", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, navigate, toast]);

  const canOpenCompany = useMemo(
    () => Boolean(quote && hasCompanyMembership(companies, quote.company_id)),
    [companies, quote],
  );

  const handleDownload = async () => {
    if (!quote) return;

    try {
      const blob = await superadminService.downloadQuotePdf(quote.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quote.quote_number}.pdf`;
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

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" className="mb-2 -ml-3">
            <Link to="/superadmin/quotes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux devis
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{quote.quote_number}</h1>
          <p className="text-muted-foreground">
            {getCompanyDisplayName(quote.company)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Telecharger le PDF
          </Button>
          {canOpenCompany && (
            <Button asChild variant="outline">
              <Link to={`/companies/${quote.company_id}`}>
                <Building2 className="mr-2 h-4 w-4" />
                Ouvrir l'entreprise
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <Badge variant="secondary">{getQuoteStatusLabel(quote.status)}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date d'emission</p>
              <p className="font-medium">{formatDate(quote.issue_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Validite</p>
              <p className="font-medium">{formatDate(quote.validity_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Montant total</p>
              <p className="font-medium">{formatCurrency(quote.total)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{getClientDisplayName(quote.client)}</p>
            </div>
            {quote.notes && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entreprise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="font-medium">{quote.company?.name}</div>
            <div className="text-muted-foreground">
              {quote.company?.siren || "SIREN indisponible"}
            </div>
            <div className="text-muted-foreground">
              {[quote.company?.address, quote.company?.postal_code, quote.company?.city]
                .filter(Boolean)
                .join(", ") || "Adresse indisponible"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lignes du devis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Qté</TableHead>
                <TableHead>PU</TableHead>
                <TableHead>TVA</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(quote.items || []).map((item) => (
                <TableRow key={item.id || `${item.position}-${item.description}`}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {item.description}
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell>{item.vat_rate}%</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.line_total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
