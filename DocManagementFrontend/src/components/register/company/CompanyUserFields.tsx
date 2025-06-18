import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Briefcase, Phone, Globe, CheckCircle2 } from 'lucide-react';

interface CompanyUserFieldsProps {
  formData: {
    companyName?: string;
    companyRC?: string;
    companyPhone?: string;
    companyWebsite?: string;
  };
  localErrors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CompanyUserFields: React.FC<CompanyUserFieldsProps> = ({
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
      {/* Company Name */}
      <div className="space-y-1">
        <Label htmlFor="companyName">Company Name</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="companyName"
            name="companyName"
            placeholder="Company Name"
            className="pl-10 pr-10"
            error={formData.companyName && !!localErrors.companyName}
            value={formData.companyName || ''}
            onChange={handleChange}
          />
          {isFieldValid('companyName', formData.companyName) && (
            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.companyName && (
          <p className="text-xs text-red-500">{localErrors.companyName}</p>
        )}
      </div>
      
      {/* Company RC */}
      <div className="space-y-1">
        <Label htmlFor="companyRC">Company RC</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="companyRC"
            name="companyRC"
            placeholder="Company Registration Number"
            className="pl-10 pr-10"
            error={formData.companyRC && !!localErrors.companyRC}
            value={formData.companyRC || ''}
            onChange={handleChange}
          />
          {isFieldValid('companyRC', formData.companyRC) && (
            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.companyRC && (
          <p className="text-xs text-red-500">{localErrors.companyRC}</p>
        )}
      </div>
      
      {/* Company Phone */}
      <div className="space-y-1">
        <Label htmlFor="companyPhone">Company Phone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="companyPhone"
            name="companyPhone"
            placeholder="Company Phone Number"
            className="pl-10 pr-10"
            error={formData.companyPhone && !!localErrors.companyPhone}
            value={formData.companyPhone || ''}
            onChange={handleChange}
          />
          {isFieldValid('companyPhone', formData.companyPhone) && (
            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.companyPhone && (
          <p className="text-xs text-red-500">{localErrors.companyPhone}</p>
        )}
      </div>
      
      {/* Company Website - Optional */}
      <div className="space-y-1">
        <Label htmlFor="companyWebsite">Company Website</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="companyWebsite"
            name="companyWebsite"
            placeholder="Company Website"
            className="pl-10 pr-10"
            error={formData.companyWebsite && !!localErrors.companyWebsite}
            value={formData.companyWebsite || ''}
            onChange={handleChange}
          />
          {isFieldValid('companyWebsite', formData.companyWebsite) && (
            <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.companyWebsite && (
          <p className="text-xs text-red-500">{localErrors.companyWebsite}</p>
        )}
      </div>
    </div>
  );
};

export default CompanyUserFields;
