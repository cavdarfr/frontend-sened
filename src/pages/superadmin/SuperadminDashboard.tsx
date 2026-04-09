import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  FileMinus,
  FileText,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { superadminService } from "@/services/api";
import type { SuperadminCompanySummary } from "@/types";

type SummaryState = {
  companies: number;
  quotes: number;
  invoices: number;
  creditNotes: number;
};

export function SuperadminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryState>({
    companies: 0,
    quotes: 0,
    invoices: 0,
    creditNotes: 0,
  });
  const [recentCompanies, setRecentCompanies] = useState<
    SuperadminCompanySummary[]
  >([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [companies, quotes, invoices, creditNotes] = await Promise.all([
          superadminService.getCompanies({ page: 1, limit: 5 }),
          superadminService.getQuotes({ page: 1, limit: 1 }),
          superadminService.getInvoices({ page: 1, limit: 1 }),
          superadminService.getCreditNotes({ page: 1, limit: 1 }),
        ]);

        setSummary({
          companies: companies.total,
          quotes: quotes.total,
          invoices: invoices.total,
          creditNotes: creditNotes.total,
        });
        setRecentCompanies(companies.companies);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description:
            error.message || "Impossible de charger l'espace superadmin.",
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [toast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Espace Superadmin</h1>
          <p className="text-muted-foreground">
            Lecture globale des documents de toutes les entreprises.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entreprises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-3xl font-semibold">{summary.companies}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Devis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-3xl font-semibold">{summary.quotes}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Factures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Receipt className="h-5 w-5 text-primary" />
              <span className="text-3xl font-semibold">{summary.invoices}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avoirs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <FileMinus className="h-5 w-5 text-primary" />
              <span className="text-3xl font-semibold">
                {summary.creditNotes}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Raccourcis</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <Button asChild variant="outline" className="justify-start">
              <Link to="/superadmin/quotes">Explorer les devis</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/superadmin/invoices">Explorer les factures</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/superadmin/credit-notes">Explorer les avoirs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entreprises recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune entreprise trouvee.
              </p>
            ) : (
              recentCompanies.map((company) => (
                <div
                  key={company.id}
                  className="rounded-lg border px-4 py-3 text-sm"
                >
                  <div className="font-medium">{company.name}</div>
                  <div className="text-muted-foreground">
                    {company.siren || "SIREN indisponible"}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
