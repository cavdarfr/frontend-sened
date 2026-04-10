import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Euro,
  FileMinus,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useCompany } from "@/hooks/useCompany";
import {
  invoiceStatusColors,
  invoiceStatusLabels,
} from "@/lib/invoice-status-config";
import {
  AccountantDocument,
  AccountantDocumentPeriod,
  AccountantDocumentStatus,
  AccountantDocumentType,
  companyService,
  LinkedClientWithStats,
  PaginatedDocuments,
} from "@/services/api";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString("fr-FR") : "—";

const sanitizeArchivePart = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const buildArchiveFilename = (
  clientName: string,
  year: number,
  periodLabel: string,
) => {
  const safeClientName = sanitizeArchivePart(clientName) || "client";
  const safePeriodLabel = sanitizeArchivePart(periodLabel) || "mois";
  return `documents-${safeClientName}-${year}-${safePeriodLabel}.zip`;
};

const statusOptions: { value: AccountantDocumentStatus; label: string }[] = [
  { value: "sent", label: invoiceStatusLabels.sent },
  { value: "paid", label: invoiceStatusLabels.paid },
  { value: "overdue", label: invoiceStatusLabels.overdue },
  { value: "cancelled", label: invoiceStatusLabels.cancelled },
];

const currentYear = new Date().getFullYear();
const currentMonthPeriod =
  `m${String(new Date().getMonth() + 1).padStart(2, "0")}` as AccountantDocumentPeriod;
const yearOptions = Array.from(
  { length: 6 },
  (_, index) => currentYear - index,
);
const periodOptions: { value: AccountantDocumentPeriod; label: string }[] = [
  { value: "m01", label: "Janvier" },
  { value: "m02", label: "Février" },
  { value: "m03", label: "Mars" },
  { value: "m04", label: "Avril" },
  { value: "m05", label: "Mai" },
  { value: "m06", label: "Juin" },
  { value: "m07", label: "Juillet" },
  { value: "m08", label: "Août" },
  { value: "m09", label: "Septembre" },
  { value: "m10", label: "Octobre" },
  { value: "m11", label: "Novembre" },
  { value: "m12", label: "Décembre" },
];
type AccountantMonthPeriod = (typeof periodOptions)[number]["value"];
const emptyDocuments: PaginatedDocuments = {
  data: [],
  total: 0,
  downloadable_total: 0,
  page: 1,
  limit: 20,
  total_pages: 0,
};

export function AccountantClientDetails() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { companies, currentCompany, loading: companiesLoading } = useCompany();
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<LinkedClientWithStats | null>(null);
  const [activeTab, setActiveTab] =
    useState<AccountantDocumentType>("invoices");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedPeriod, setSelectedPeriod] = useState<AccountantMonthPeriod>(
    currentMonthPeriod as AccountantMonthPeriod,
  );
  const [selectedStatuses, setSelectedStatuses] = useState<
    AccountantDocumentStatus[]
  >([]);
  const [page, setPage] = useState(1);
  const [documents, setDocuments] =
    useState<PaginatedDocuments>(emptyDocuments);
  const [docsLoading, setDocsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const cabinetCompany = useMemo(() => {
    if (
      currentCompany &&
      ["accountant", "accountant_consultant"].includes(currentCompany.role)
    ) {
      return currentCompany;
    }

    return (
      companies.find(
        (company) =>
          company.is_default &&
          ["accountant", "accountant_consultant"].includes(company.role),
      ) ||
      companies.find((company) =>
        ["accountant", "accountant_consultant"].includes(company.role),
      ) ||
      null
    );
  }, [companies, currentCompany]);

  const selectableDocuments = useMemo(
    () => documents.data.filter((document) => document.storage_available),
    [documents.data],
  );
  const selectableIds = useMemo(
    () => selectableDocuments.map((document) => document.id),
    [selectableDocuments],
  );
  const selectedDownloadableDocuments = useMemo(
    () =>
      documents.data.filter(
        (document) =>
          selectedIds.has(document.id) && document.storage_available,
      ),
    [documents.data, selectedIds],
  );
  const selectedOnPageCount = selectedDownloadableDocuments.length;
  const hasSelectableRows = selectableIds.length > 0;
  const allSelectableChecked =
    hasSelectableRows && selectedOnPageCount === selectableIds.length;
  const partiallySelected = selectedOnPageCount > 0 && !allSelectableChecked;
  const canDownloadFilteredDocuments =
    documents.downloadable_total > 0 && documents.downloadable_total <= 100;
  const noDownloadableFilteredDocuments = documents.downloadable_total === 0;
  const tooManyDownloadableFilteredDocuments =
    documents.downloadable_total > 100;

  useEffect(() => {
    const loadClient = async () => {
      if (companiesLoading) {
        return;
      }

      if (!cabinetCompany || !clientId) {
        setClient(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const clients = await companyService.getLinkedClients(
          cabinetCompany.id,
        );
        const found = (clients as LinkedClientWithStats[]).find(
          (company) => company.id === clientId,
        );
        setClient(found || null);
      } catch (error) {
        console.error("Error loading client:", error);
      } finally {
        setLoading(false);
      }
    };
    void loadClient();
  }, [cabinetCompany?.id, clientId, companiesLoading]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, selectedYear, selectedPeriod, selectedStatuses]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab, selectedYear, selectedPeriod, selectedStatuses, page]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = partiallySelected;
    }
  }, [partiallySelected]);

  const selectedStatusesLabel = useMemo(() => {
    if (selectedStatuses.length === 0) {
      return "Tous les statuts";
    }

    if (selectedStatuses.length === 1) {
      return (
        statusOptions.find((status) => status.value === selectedStatuses[0])
          ?.label || "Statut"
      );
    }

    return `${selectedStatuses.length} statuts`;
  }, [selectedStatuses]);
  const selectedPeriodOption = useMemo(
    () => periodOptions.find((period) => period.value === selectedPeriod),
    [selectedPeriod],
  );

  useEffect(() => {
    const loadDocuments = async () => {
      if (companiesLoading) {
        return;
      }

      if (!cabinetCompany || !clientId) {
        setDocuments(emptyDocuments);
        setDocsLoading(false);
        return;
      }

      setDocsLoading(true);
      try {
        const data = await companyService.getLinkedClientDocuments(
          cabinetCompany.id,
          clientId,
          {
            type: activeTab,
            page,
            limit: 20,
            year: selectedYear,
            period: selectedPeriod,
            statuses:
              selectedStatuses.length > 0 ? selectedStatuses : undefined,
          },
        );
        setDocuments(data);
      } catch (error) {
        console.error("Error loading documents:", error);
        setDocuments(emptyDocuments);
      } finally {
        setDocsLoading(false);
      }
    };
    void loadDocuments();
  }, [
    cabinetCompany?.id,
    clientId,
    activeTab,
    page,
    selectedYear,
    selectedPeriod,
    selectedStatuses,
    companiesLoading,
  ]);

  const handleDownload = async (document: AccountantDocument) => {
    if (!cabinetCompany || !clientId || !document.storage_available) {
      return;
    }

    setDownloadingId(document.id);
    try {
      const blob = await companyService.downloadLinkedClientDocument(
        cabinetCompany.id,
        clientId,
        document.id,
      );
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download =
        document.downloadable_filename ||
        `document-${document.invoice_number}.pdf`;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Téléchargement impossible",
        description:
          error.message || "Le document comptable n’a pas pu être téléchargé.",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const toggleStatusFilter = (status: AccountantDocumentStatus) => {
    setSelectedStatuses((previous) =>
      previous.includes(status)
        ? previous.filter((value) => value !== status)
        : [...previous, status],
    );
  };

  const toggleDocumentSelection = (documentId: string, checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(documentId);
      } else {
        next.delete(documentId);
      }
      return next;
    });
  };

  const toggleAllSelection = (checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      selectableIds.forEach((documentId) => {
        if (checked) {
          next.add(documentId);
        } else {
          next.delete(documentId);
        }
      });
      return next;
    });
  };

  const handleBulkDownload = async () => {
    if (!cabinetCompany || !clientId || !client) {
      return;
    }

    if (
      selectedDownloadableDocuments.length === 0 &&
      noDownloadableFilteredDocuments
    ) {
      toast({
        variant: "destructive",
        title: "Aucun document archivé",
        description: "Aucun PDF archivé n’est disponible pour ces filtres.",
      });
      return;
    }

    if (
      selectedDownloadableDocuments.length === 0 &&
      tooManyDownloadableFilteredDocuments
    ) {
      toast({
        variant: "destructive",
        title: "Affinez les filtres",
        description:
          "Le téléchargement groupé est limité à 100 documents archivés.",
      });
      return;
    }

    setBulkDownloading(true);
    try {
      const blob = await companyService.downloadLinkedClientDocumentsZip(
        cabinetCompany.id,
        clientId,
        {
          document_ids:
            selectedDownloadableDocuments.length > 0
              ? selectedDownloadableDocuments.map((document) => document.id)
              : undefined,
          type: activeTab,
          year: selectedYear,
          period: selectedPeriod,
          statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        },
      );

      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = buildArchiveFilename(
        client.name,
        selectedYear,
        selectedPeriodOption?.label || selectedPeriod,
      );
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Téléchargement groupé impossible",
        description:
          error.message || "Le ZIP comptable n’a pas pu être généré.",
      });
    } finally {
      setBulkDownloading(false);
    }
  };

  if (loading || companiesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!cabinetCompany) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/accountant")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <p className="text-muted-foreground">
          Aucun cabinet comptable actif n’est disponible pour cet utilisateur.
        </p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/accountant")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <p className="text-muted-foreground">Client non trouvé.</p>
      </div>
    );
  }

  const kpis = [
    {
      label: "CA annuel",
      value: formatCurrency(client.stats?.annual_revenue || 0),
      icon: Euro,
      color: "text-blue-600",
    },
    {
      label: "Payé",
      value: formatCurrency(client.stats?.total_paid || 0),
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "En attente",
      value: formatCurrency(client.stats?.pending_amount || 0),
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "En retard",
      value: formatCurrency(client.stats?.overdue_amount || 0),
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/accountant")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold">{client.name}</h1>
          <p className="text-sm text-muted-foreground">
            Pièces comptables immuables du dossier client, filtrées par année,
            mois et statut.
          </p>
          {client.siren && (
            <p className="text-sm text-muted-foreground">
              SIREN: {client.siren}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed bg-muted/20">
        <CardContent className="flex flex-col gap-4 pt-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="shrink-0 space-y-1">
            <p className="text-sm font-medium">Archivage comptable</p>
            <p className="text-sm text-muted-foreground">
              Le ZIP est généré côté backend et streamé sans fichier temporaire.
            </p>
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-end justify-end gap-x-3 gap-y-2">
            <div className="w-full min-w-0 shrink-0 space-y-1 sm:w-[9.5rem] sm:max-w-full">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Année
              </p>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  collisionPadding={12}
                  avoidCollisions={false}
                >
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full min-w-0 shrink-0 space-y-1 sm:w-44 sm:max-w-full">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Mois
              </p>
              <Select
                value={selectedPeriod}
                onValueChange={(value) =>
                  setSelectedPeriod(value as AccountantMonthPeriod)
                }
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Mois" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  collisionPadding={12}
                  avoidCollisions={false}
                >
                  {periodOptions.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full min-w-0 shrink-0 space-y-1 sm:w-48 sm:max-w-full">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Statut
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-between"
                  >
                    <span className="truncate">{selectedStatusesLabel}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  collisionPadding={12}
                  avoidCollisions={false}
                  className="w-56"
                >
                  <DropdownMenuItem
                    disabled={selectedStatuses.length === 0}
                    onSelect={(event) => {
                      event.preventDefault();
                      setSelectedStatuses([]);
                    }}
                  >
                    Tous les statuts
                  </DropdownMenuItem>
                  {statusOptions.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status.value}
                      checked={selectedStatuses.includes(status.value)}
                      onCheckedChange={() => toggleStatusFilter(status.value)}
                    >
                      {status.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AccountantDocumentType)}
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1">
          <TabsTrigger
            value="invoices"
            className="w-full gap-2 whitespace-normal px-3 py-2 text-xs sm:text-sm"
          >
            <Receipt className="h-4 w-4" />
            <span className="min-w-0 truncate">
              Factures ({client.stats?.invoice_count || 0})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="credit-notes"
            className="w-full gap-2 whitespace-normal px-3 py-2 text-xs sm:text-sm"
          >
            <FileMinus className="h-4 w-4" />
            <span className="min-w-0 truncate">
              Avoirs ({client.stats?.credit_note_count || 0})
            </span>
          </TabsTrigger>
        </TabsList>

        {(["invoices", "credit-notes"] as AccountantDocumentType[]).map(
          (tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <CardTitle className="text-base">
                      {tab === "invoices"
                        ? "Factures archivées"
                        : "Avoirs archivés"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {documents.total} pièce(s), dont{" "}
                      {documents.downloadable_total} ZIPpable(s) pour les
                      filtres actifs.
                    </p>
                  </div>
                  <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="w-fit">
                        {selectedPeriodOption?.label || selectedPeriod}{" "}
                        {selectedYear}
                      </Badge>
                      {selectedDownloadableDocuments.length > 0 && (
                        <Badge variant="secondary">
                          {selectedDownloadableDocuments.length} sélectionné(s)
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      disabled={
                        bulkDownloading ||
                        (selectedDownloadableDocuments.length === 0
                          ? !canDownloadFilteredDocuments
                          : selectedDownloadableDocuments.length === 0)
                      }
                      onClick={() => void handleBulkDownload()}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {bulkDownloading
                        ? "Téléchargement..."
                        : selectedDownloadableDocuments.length > 0
                          ? `Télécharger (${selectedDownloadableDocuments.length})`
                          : "Tout télécharger"}
                    </Button>
                    {tooManyDownloadableFilteredDocuments &&
                      selectedDownloadableDocuments.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Affinez les filtres pour rester sous 100 documents
                          archivés.
                        </p>
                      )}
                    {noDownloadableFilteredDocuments && (
                      <p className="text-xs text-muted-foreground">
                        Aucun PDF archivé n’est disponible pour ces filtres.
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {docsLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : documents.data.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      Aucune pièce comptable trouvée pour cette période.
                    </p>
                  ) : (
                    <>
                      <Table className="min-w-[760px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <input
                                ref={selectAllRef}
                                type="checkbox"
                                role="checkbox"
                                aria-label="Tout sélectionner sur la page"
                                className="h-4 w-4 rounded border border-input"
                                checked={allSelectableChecked}
                                disabled={!hasSelectableRows}
                                onChange={(event) =>
                                  toggleAllSelection(event.target.checked)
                                }
                              />
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Numéro
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Date
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-right">
                              Montant
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Statut
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Archive PDF
                            </TableHead>
                            <TableHead className="whitespace-nowrap text-right">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {documents.data.map((document) => (
                            <TableRow
                              key={document.id}
                              data-state={
                                selectedIds.has(document.id)
                                  ? "selected"
                                  : undefined
                              }
                            >
                              <TableCell>
                                <input
                                  type="checkbox"
                                  role="checkbox"
                                  aria-label={`Sélectionner ${document.invoice_number}`}
                                  className="h-4 w-4 rounded border border-input"
                                  checked={selectedIds.has(document.id)}
                                  disabled={!document.storage_available}
                                  onChange={(event) =>
                                    toggleDocumentSelection(
                                      document.id,
                                      event.target.checked,
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell className="whitespace-nowrap font-medium">
                                {document.invoice_number}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {formatDate(
                                  document.issue_date || document.created_at,
                                )}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-right">
                                {formatCurrency(
                                  Math.abs(Number(document.total || 0)),
                                )}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge
                                  className={
                                    invoiceStatusColors[document.status]
                                  }
                                >
                                  {invoiceStatusLabels[document.status]}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {document.storage_available ? (
                                  <Badge variant="secondary">Disponible</Badge>
                                ) : (
                                  <Badge variant="outline">Non archivé</Badge>
                                )}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 sm:px-3"
                                  aria-label={`Télécharger ${document.invoice_number}`}
                                  disabled={
                                    !document.storage_available ||
                                    downloadingId === document.id
                                  }
                                  onClick={() => void handleDownload(document)}
                                >
                                  <Download className="h-4 w-4 sm:mr-2" />
                                  <span className="hidden sm:inline">
                                    {downloadingId === document.id
                                      ? "Téléchargement..."
                                      : "Télécharger"}
                                  </span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {documents.total_pages > 1 && (
                        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-muted-foreground">
                            Page {documents.page} sur {documents.total_pages}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={documents.page <= 1}
                              onClick={() =>
                                setPage((previous) => Math.max(1, previous - 1))
                              }
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={documents.page >= documents.total_pages}
                              onClick={() =>
                                setPage((previous) => previous + 1)
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ),
        )}
      </Tabs>
    </div>
  );
}
