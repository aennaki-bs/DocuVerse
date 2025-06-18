import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Building, Globe, CheckCircle2 } from 'lucide-react';

interface CompanyAddressFieldsProps {
  formData: {
    companyAddress?: string;
    companyCity?: string;
    companyCountry?: string;
  };
  localErrors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CompanyAddressFields: React.FC<CompanyAddressFieldsProps> = ({
  formData,
  localErrors,
  handleChange
}) => {
  // Helper function to determine if a field is valid
  const isFieldValid = (fieldName: string, value?: string) => {
    return value && value.trim().length > 0 && !localErrors[fieldName];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Company Address */}
      <div className="space-y-1">
        <Label htmlFor="companyAddress">Company Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="companyAddress"
            name="companyAddress"
            placeholder="Company Address"
            className="pl-10 pr-10"
            error={formData.companyAddress && !!localErrors.companyAddress}
            value={formData.companyAddress || ''}
            onChange={handleChange}
          />
          {isFieldValid('companyAddress', formData.companyAddress) && (
            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.companyAddress && (
          <p className="text-xs text-red-500">{localErrors.companyAddress}</p>
        )}
      </div>
      
      {/* Company City */}
      <div className="space-y-1">
        <Label htmlFor="companyCity">Company City</Label>
        <div className="relative">
          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="companyCity"
            name="companyCity"
            placeholder="Company City"
            className="pl-10 pr-10"
            error={formData.companyCity && !!localErrors.companyCity}
            value={formData.companyCity || ''}
            onChange={handleChange}
          />
          {isFieldValid('companyCity', formData.companyCity) && (
            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.companyCity && (
          <p className="text-xs text-red-500">{localErrors.companyCity}</p>
        )}
      </div>
      
      {/* Company Country */}
      <div className="space-y-1">
        <Label htmlFor="companyCountry">Company Country</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="companyCountry"
            name="companyCountry"
            placeholder="Company Country"
            className="pl-10 pr-10"
            error={formData.companyCountry && !!localErrors.companyCountry}
            value={formData.companyCountry || ''}
            onChange={handleChange}
          />
          {isFieldValid('companyCountry', formData.companyCountry) && (
            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.companyCountry && (
          <p className="text-xs text-red-500">{localErrors.companyCountry}</p>
        )}
      </div>
    </div>
  );
};

export default CompanyAddressFields; 