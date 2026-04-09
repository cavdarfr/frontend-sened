import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { PrefillableField } from '@/hooks/useEnterpriseLookup';

/** Pays courants avec codes ISO 2. */
const COUNTRY_OPTIONS = [
  { code: 'FR', label: 'France' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CH', label: 'Suisse' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'DE', label: 'Allemagne' },
  { code: 'ES', label: 'Espagne' },
  { code: 'IT', label: 'Italie' },
  { code: 'GB', label: 'Royaume-Uni' },
  { code: 'NL', label: 'Pays-Bas' },
  { code: 'CA', label: 'Canada' },
] as const;

const KNOWN_CODES = new Set<string>(COUNTRY_OPTIONS.map((o) => o.code));

export type BusinessFieldVariant = 'company' | 'client-pro' | 'client-individual';

interface BusinessIdentityFieldsProps {
  variant: BusinessFieldVariant;
  values: {
    name?: string;
    legal_name?: string;
    company_name?: string;
    siren?: string;
    siret?: string;
    vat_number?: string;
    address?: string;
    postal_code?: string;
    city?: string;
    country?: string;
  };
  prefilledFields: Set<PrefillableField>;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

function PrefilledIndicator() {
  return (
    <Lock className="inline h-3 w-3 text-blue-500 ml-1" aria-label="Donnée récupérée" />
  );
}

function fieldClassName(isPrefilled: boolean) {
  return cn(isPrefilled && 'border-blue-200 bg-blue-50/50');
}

export function BusinessIdentityFields({
  variant,
  values,
  prefilledFields,
  onChange,
  disabled = false,
}: BusinessIdentityFieldsProps) {
  const [isCustomCountry, setIsCustomCountry] = useState(
    () => !!values.country && !KNOWN_CODES.has(values.country),
  );

  const isPrefilled = (field: PrefillableField) => prefilledFields.has(field);

  const countryValue = values.country || 'FR';
  const showCountrySelect = !isCustomCountry;

  if (variant === 'client-individual') {
    return (
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input
              value={values.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
              disabled={disabled}
              className={fieldClassName(isPrefilled('address'))}
            />
          </div>
          <div className="space-y-2">
            <Label>Code postal</Label>
            <Input
              value={values.postal_code || ''}
              onChange={(e) => onChange('postal_code', e.target.value)}
              disabled={disabled}
              maxLength={5}
              className={fieldClassName(isPrefilled('postal_code'))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ville</Label>
            <Input
              value={values.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
              disabled={disabled}
              className={fieldClassName(isPrefilled('city'))}
            />
          </div>
          <div className="space-y-2">
            <Label>Pays</Label>
            <CountryField
              value={countryValue}
              onChange={(v) => onChange('country', v)}
              disabled={disabled}
              showSelect={showCountrySelect}
              onSwitchCustom={() => setIsCustomCountry(true)}
              onSwitchSelect={() => setIsCustomCountry(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  // client-pro or company
  const nameField = variant === 'company' ? 'legal_name' : 'company_name';
  const nameLabel = variant === 'company' ? 'Raison sociale' : 'Nom de l\'entreprise';
  const nameValue = variant === 'company' ? (values.legal_name || '') : (values.company_name || '');
  const showSiret = variant === 'client-pro';

  return (
    <div className="grid gap-4">
      {/* Nom commercial (company only) */}
      {variant === 'company' && (
        <div className="space-y-2">
          <Label>Nom commercial *</Label>
          <Input
            value={values.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      )}

      {/* Raison sociale / Nom entreprise */}
      <div className="space-y-2">
        <Label>
          {nameLabel}{variant === 'client-pro' ? ' *' : ''}
          {isPrefilled(variant === 'company' ? 'legal_name' : 'company_name') && <PrefilledIndicator />}
        </Label>
        <Input
          value={nameValue}
          onChange={(e) => onChange(nameField, e.target.value)}
          disabled={disabled}
          required={variant === 'client-pro'}
          className={fieldClassName(isPrefilled(variant === 'company' ? 'legal_name' : 'company_name'))}
        />
      </div>

      {/* SIREN + SIRET + TVA */}
      <div className={cn('grid gap-4', showSiret ? 'grid-cols-3' : 'grid-cols-2')}>
        <div className="space-y-2">
          <Label>
            SIREN
            {isPrefilled('siren') && <PrefilledIndicator />}
          </Label>
          <Input
            value={values.siren || ''}
            onChange={(e) => onChange('siren', e.target.value)}
            disabled={disabled}
            maxLength={9}
            className={fieldClassName(isPrefilled('siren'))}
          />
        </div>
        {showSiret && (
          <div className="space-y-2">
            <Label>
              SIRET
              {isPrefilled('siret') && <PrefilledIndicator />}
            </Label>
            <Input
              value={values.siret || ''}
              onChange={(e) => onChange('siret', e.target.value)}
              disabled={disabled}
              maxLength={14}
              className={fieldClassName(isPrefilled('siret'))}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>
            N° TVA
            {isPrefilled('vat_number') && <PrefilledIndicator />}
          </Label>
          <Input
            value={values.vat_number || ''}
            onChange={(e) => onChange('vat_number', e.target.value)}
            disabled={disabled}
            className={fieldClassName(isPrefilled('vat_number'))}
          />
        </div>
      </div>

      {/* Adresse */}
      <div className="space-y-2">
        <Label>
          Adresse
          {isPrefilled('address') && <PrefilledIndicator />}
        </Label>
        <Input
          value={values.address || ''}
          onChange={(e) => onChange('address', e.target.value)}
          disabled={disabled}
          className={fieldClassName(isPrefilled('address'))}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>
            Code postal
            {isPrefilled('postal_code') && <PrefilledIndicator />}
          </Label>
          <Input
            value={values.postal_code || ''}
            onChange={(e) => onChange('postal_code', e.target.value)}
            disabled={disabled}
            maxLength={10}
            className={fieldClassName(isPrefilled('postal_code'))}
          />
        </div>
        <div className="space-y-2">
          <Label>
            Ville
            {isPrefilled('city') && <PrefilledIndicator />}
          </Label>
          <Input
            value={values.city || ''}
            onChange={(e) => onChange('city', e.target.value)}
            disabled={disabled}
            className={fieldClassName(isPrefilled('city'))}
          />
        </div>
        <div className="space-y-2">
          <Label>Pays</Label>
          <CountryField
            value={countryValue}
            onChange={(v) => onChange('country', v)}
            disabled={disabled}
            showSelect={showCountrySelect}
            onSwitchCustom={() => setIsCustomCountry(true)}
            onSwitchSelect={() => setIsCustomCountry(false)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Country sub-component ──────────────────────────────────────

interface CountryFieldProps {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  showSelect: boolean;
  onSwitchCustom: () => void;
  onSwitchSelect: () => void;
}

function CountryField({ value, onChange, disabled, showSelect, onSwitchCustom, onSwitchSelect }: CountryFieldProps) {
  if (!showSelect) {
    return (
      <div className="flex gap-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 2))}
          disabled={disabled}
          maxLength={2}
          placeholder="XX"
          className="w-20"
        />
        <button
          type="button"
          className="text-xs text-muted-foreground underline whitespace-nowrap self-center"
          onClick={onSwitchSelect}
        >
          Liste
        </button>
      </div>
    );
  }

  return (
    <Select value={KNOWN_CODES.has(value) ? value : '__OTHER__'} onValueChange={(v) => {
      if (v === '__OTHER__') {
        onSwitchCustom();
        onChange('');
      } else {
        onChange(v);
      }
    }} disabled={disabled}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COUNTRY_OPTIONS.map((opt) => (
          <SelectItem key={opt.code} value={opt.code}>
            {opt.label} ({opt.code})
          </SelectItem>
        ))}
        <SelectItem value="__OTHER__">Autre...</SelectItem>
      </SelectContent>
    </Select>
  );
}
