import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2, Tag, X, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumericInput } from '@/components/ui/numeric-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { productService, categoryService } from '@/services/api';
import { useOperationalCompany } from '@/hooks/useOperationalCompany';
import type { ProductCategory, ProductTaxLine, CreateProductData } from '@/types';
import { cn, dedupeById, upsertById } from '@/lib/utils';

const FR_VAT_RATES = [20, 10, 5.5, 2.1, 0] as const;

export function ProductCreate() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { operationalCompany: currentCompany } = useOperationalCompany();

    const [formName, setFormName] = useState('');
    const [formReference, setFormReference] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formUnitPrice, setFormUnitPrice] = useState(0);
    const [formVatRate, setFormVatRate] = useState(20);
    const [formCategoryId, setFormCategoryId] = useState<string | null>(null);
    const [formHasMultiTax, setFormHasMultiTax] = useState(false);
    const [formTaxLines, setFormTaxLines] = useState<ProductTaxLine[]>([]);

    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [categoryInputValue, setCategoryInputValue] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentCompany) {
            categoryService.getAll(currentCompany.id).then(res => setCategories(dedupeById(res.categories))).catch(() => {});
        }
    }, [currentCompany]);

    const calculatedTTC = formHasMultiTax
        ? formTaxLines.reduce((sum, tl) => sum + tl.amount * (1 + tl.tax_rate / 100), 0)
        : formUnitPrice * (1 + formVatRate / 100);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

    const addTaxLine = () => {
        if (formTaxLines.length >= 4) return;
        setFormTaxLines(prev => [...prev, { label: '', amount: 0, tax_rate: 20, position: prev.length }]);
    };

    const removeTaxLine = (index: number) => {
        setFormTaxLines(prev => prev.filter((_, i) => i !== index).map((tl, i) => ({ ...tl, position: i })));
    };

    const updateTaxLine = (index: number, field: keyof ProductTaxLine, value: any) => {
        setFormTaxLines(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(categoryInputValue.toLowerCase())
    );
    const normalizedCategoryInput = categoryInputValue.trim().toLowerCase();

    const handleCreateCategory = async () => {
        if (!categoryInputValue.trim() || isCreatingCategory || !currentCompany) return;
        const existing = categories.find(c => c.name.trim().toLowerCase() === normalizedCategoryInput);
        if (existing) {
            setFormCategoryId(existing.id);
            setCategoryInputValue('');
            return;
        }
        try {
            setIsCreatingCategory(true);
            const newCategory = await categoryService.create(currentCompany.id, { name: categoryInputValue.trim() });
            setCategories(prev => upsertById(prev, newCategory));
            setFormCategoryId(newCategory.id);
            setCategoryInputValue('');
            toast({ title: 'Catégorie créée', description: `"${newCategory.name}" a été créée` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erreur', description: error.message || 'Impossible de créer la catégorie' });
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCategories.length === 1) {
                setFormCategoryId(filteredCategories[0].id);
                setCategoryInputValue('');
            } else if (categoryInputValue.trim()) {
                handleCreateCategory();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCompany) return;

        if (!formName.trim()) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Le nom du produit est obligatoire' });
            return;
        }

        if (formHasMultiTax && formTaxLines.length === 0) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Ajoutez au moins une ligne de taxe' });
            return;
        }

        try {
            setIsSubmitting(true);
            const data: CreateProductData = {
                name: formName,
                reference: formReference || undefined,
                description: formDescription || undefined,
                unit_price: formUnitPrice,
                vat_rate: formVatRate,
                category_id: formCategoryId || undefined,
                is_active: true,
                has_multi_tax: formHasMultiTax,
                tax_lines: formHasMultiTax ? formTaxLines : undefined,
            };
            await productService.create(currentCompany.id, data);
            toast({ title: 'Produit créé', description: 'Le produit a été créé avec succès' });
            navigate('/products');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erreur', description: error.message || 'Impossible de créer le produit' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Nouveau produit</h1>
                    <p className="text-muted-foreground">Ajoutez un nouveau produit ou service à votre catalogue.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informations du produit</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="product-name">Nom du produit *</Label>
                                <Input
                                    id="product-name"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Ex: Prestation de conseil"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-reference">Référence</Label>
                                <Input
                                    id="product-reference"
                                    value={formReference}
                                    onChange={(e) => setFormReference(e.target.value)}
                                    placeholder="Ex: PREST-001"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-description">Description</Label>
                            <Textarea
                                id="product-description"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                placeholder="Description du produit ou service..."
                                rows={3}
                            />
                        </div>

                        {/* Catégorie */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Catégorie
                            </Label>
                            <div className="space-y-3">
                                {formCategoryId && (
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                        <div
                                            className="h-3 w-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: categories.find(c => c.id === formCategoryId)?.color }}
                                        />
                                        <span className="font-medium text-sm flex-1">
                                            {categories.find(c => c.id === formCategoryId)?.name}
                                        </span>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive" onClick={() => setFormCategoryId(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={categoryInputValue}
                                        onChange={(e) => setCategoryInputValue(e.target.value)}
                                        onKeyDown={handleCategoryKeyDown}
                                        placeholder={formCategoryId ? "Changer de catégorie..." : "Saisir ou créer une catégorie..."}
                                        className="pl-9"
                                        disabled={isCreatingCategory}
                                    />
                                    {isCreatingCategory && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />}
                                </div>
                                {categoryInputValue && (
                                    <div className="rounded-md border bg-popover p-1 shadow-md">
                                        <ScrollArea className="max-h-32">
                                            {filteredCategories.map((category) => (
                                                <button
                                                    key={category.id}
                                                    type="button"
                                                    className={cn("flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent", formCategoryId === category.id && "bg-accent")}
                                                    onClick={() => { setFormCategoryId(category.id); setCategoryInputValue(''); }}
                                                >
                                                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                                                    {category.name}
                                                    {formCategoryId === category.id && <Check className="ml-auto h-4 w-4" />}
                                                </button>
                                            ))}
                                            {categoryInputValue.trim() && !categories.some(c => c.name.trim().toLowerCase() === normalizedCategoryInput) && (
                                                <button type="button" className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-primary" onClick={handleCreateCategory}>
                                                    <Plus className="h-4 w-4" />
                                                    Créer "{categoryInputValue}"
                                                </button>
                                            )}
                                        </ScrollArea>
                                    </div>
                                )}
                                {!categoryInputValue && categories.length > 0 && !formCategoryId && (
                                    <div className="flex flex-wrap gap-1">
                                        {categories.slice(0, 6).map((category) => (
                                            <Badge key={category.id} variant="outline" className="cursor-pointer hover:bg-accent" style={{ borderColor: category.color, color: category.color }} onClick={() => setFormCategoryId(category.id)}>
                                                {category.name}
                                            </Badge>
                                        ))}
                                        {categories.length > 6 && <Badge variant="outline" className="text-muted-foreground">+{categories.length - 6}</Badge>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Toggle multi-TVA */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="multi-tax-toggle" className="text-sm font-medium">
                                Produit multi-TVA
                            </Label>
                            <Switch
                                id="multi-tax-toggle"
                                checked={formHasMultiTax}
                                onCheckedChange={(checked) => {
                                    setFormHasMultiTax(checked);
                                    if (checked && formTaxLines.length === 0) {
                                        setFormTaxLines([{ label: '', amount: formUnitPrice, tax_rate: formVatRate, position: 0 }]);
                                    }
                                }}
                            />
                        </div>

                        {!formHasMultiTax ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="product-price">Prix unitaire HT (€) *</Label>
                                    <NumericInput
                                        id="product-price"
                                        value={formUnitPrice}
                                        onValueChange={setFormUnitPrice}
                                        min={0}
                                        step={0.01}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="product-vat">Taux de TVA</Label>
                                    <Select
                                        value={String(formVatRate)}
                                        onValueChange={(v) => setFormVatRate(parseFloat(v))}
                                    >
                                        <SelectTrigger id="product-vat">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FR_VAT_RATES.map((rate) => (
                                                <SelectItem key={rate} value={String(rate)}>
                                                    {rate}%
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Lignes de taxe</Label>
                                {formTaxLines.map((tl, idx) => (
                                    <div key={idx} className="flex items-end gap-2">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs text-muted-foreground">Label</Label>
                                            <Input
                                                value={tl.label || ''}
                                                onChange={(e) => updateTaxLine(idx, 'label', e.target.value)}
                                                placeholder="Ex: Main d'oeuvre"
                                            />
                                        </div>
                                        <div className="w-[110px] space-y-1">
                                            <Label className="text-xs text-muted-foreground">Montant HT</Label>
                                            <NumericInput
                                                min={0}
                                                step={0.01}
                                                value={tl.amount}
                                                onValueChange={(value) => updateTaxLine(idx, 'amount', value)}
                                            />
                                        </div>
                                        <div className="w-[100px] space-y-1">
                                            <Label className="text-xs text-muted-foreground">TVA</Label>
                                            <Select
                                                value={String(tl.tax_rate)}
                                                onValueChange={(v) => updateTaxLine(idx, 'tax_rate', parseFloat(v))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {FR_VAT_RATES.map((rate) => (
                                                        <SelectItem key={rate} value={String(rate)}>
                                                            {rate}%
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeTaxLine(idx)} disabled={formTaxLines.length <= 1}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                {formTaxLines.length < 4 && (
                                    <Button type="button" variant="outline" size="sm" onClick={addTaxLine}>
                                        <Plus className="mr-1 h-3 w-3" />
                                        Ajouter ligne TVA
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Prix TTC calculé */}
                        <div className="rounded-lg bg-muted p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Prix TTC</span>
                                <span className="text-lg font-semibold">{formatPrice(calculatedTTC)}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/products')} disabled={isSubmitting}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Créer le produit
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
