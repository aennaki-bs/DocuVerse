
import React from 'react';
import { useMultiStepForm } from '@/context/form';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, Check, FileEdit, User, Building2, Lock, Shield, ExternalLink, Phone, MapPin, AtSign, CreditCard, Globe2 } from 'lucide-react';

const StepFourSummary = () => {
  const { 
    formData, 
    prevStep, 
    registerUser, 
    stepValidation, 
    setCurrentStep 
  } = useMultiStepForm();
  
  const handleSubmit = async () => {
    const success = await registerUser();
    if (success) {
      toast.success('Registration successful! Please check your email for verification.');
    }
  };
  
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-semibold mb-2">Review Your Information</h3>
        <p className="text-sm text-gray-400">Please verify all information before submitting</p>
      </div>
      <ScrollArea className="h-[calc(100vh-400px)] pr-4">
        <div className="space-y-6">
          {/* Account Type Card */}
          <Card className="border border-blue-900/30 bg-gradient-to-b from-[#161b22]/80 to-[#1c2128]/80 shadow-lg hover:shadow-blue-900/10 transition-all">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-blue-900/20">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600/20 p-2 rounded-full">
                  {formData.userType === 'personal' ? 
                    <User className="h-4 w-4 text-blue-400" /> : 
                    <Building2 className="h-4 w-4 text-blue-400" />
                  }
                </div>
                <CardTitle className="text-sm font-medium">Account Type</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-blue-900/20" 
                onClick={() => goToStep(1)}
              >
                <FileEdit className="h-4 w-4 text-blue-400" />
              </Button>
            </CardHeader>
            <CardContent className="py-3 px-4">
              <p className="text-sm capitalize font-medium">{formData.userType}</p>
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card className="border border-blue-900/30 bg-gradient-to-b from-[#161b22]/80 to-[#1c2128]/80 shadow-lg hover:shadow-blue-900/10 transition-all">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-blue-900/20">
              <div className="flex items-center gap-2">
                <div className="bg-purple-600/20 p-2 rounded-full">
                  <User className="h-4 w-4 text-purple-400" />
                </div>
                <CardTitle className="text-sm font-medium">Personal Information</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-blue-900/20" 
                onClick={() => goToStep(1)}
              >
                <FileEdit className="h-4 w-4 text-blue-400" />
              </Button>
            </CardHeader>
            <CardContent className="py-3 px-4">
              {formData.userType === 'personal' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <User className="h-3 w-3" /> First Name
                    </p>
                    <p className="text-sm font-medium">{formData.firstName || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <User className="h-3 w-3" /> Last Name
                    </p>
                    <p className="text-sm font-medium">{formData.lastName || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <CreditCard className="h-3 w-3" /> ID
                    </p>
                    <p className="text-sm font-medium">{formData.cin || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone
                    </p>
                    <p className="text-sm font-medium">{formData.personalPhone || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address
                    </p>
                    <p className="text-sm font-medium">{formData.personalAddress || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Globe2 className="h-3 w-3" /> City
                    </p>
                    <p className="text-sm font-medium">{formData.city || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Globe2 className="h-3 w-3" /> Country
                    </p>
                    <p className="text-sm font-medium">{formData.country || 'Not provided'}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Company Name
                    </p>
                    <p className="text-sm font-medium">{formData.companyName || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <User className="h-3 w-3" /> First Name
                    </p>
                    <p className="text-sm font-medium">{formData.firstName || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <User className="h-3 w-3" /> Last Name
                    </p>
                    <p className="text-sm font-medium">{formData.lastName || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <CreditCard className="h-3 w-3" /> Company RC
                    </p>
                    <p className="text-sm font-medium">{formData.companyRC || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Company Phone
                    </p>
                    <p className="text-sm font-medium">{formData.companyPhone || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Company Address
                    </p>
                    <p className="text-sm font-medium">{formData.companyAddress || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <AtSign className="h-3 w-3" /> Company Email
                    </p>
                    <p className="text-sm font-medium">{formData.companyEmail || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Company Website
                    </p>
                    <p className="text-sm font-medium">{formData.companyWebsite || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Credentials Card */}
          <Card className="border border-blue-900/30 bg-gradient-to-b from-[#161b22]/80 to-[#1c2128]/80 shadow-lg hover:shadow-blue-900/10 transition-all">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-blue-900/20">
              <div className="flex items-center gap-2">
                <div className="bg-green-600/20 p-2 rounded-full">
                  <Lock className="h-4 w-4 text-green-400" />
                </div>
                <CardTitle className="text-sm font-medium">Account Credentials</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-blue-900/20" 
                onClick={() => goToStep(2)}
              >
                <FileEdit className="h-4 w-4 text-blue-400" />
              </Button>
            </CardHeader>
            <CardContent className="py-3 px-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <User className="h-3 w-3" /> Username
                  </p>
                  <p className="text-sm font-medium">{formData.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <AtSign className="h-3 w-3" /> Email
                  </p>
                  <p className="text-sm font-medium">{formData.email}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Password
                  </p>
                  <p className="text-sm font-medium">••••••••••</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Access Card */}
          <Card className="border border-blue-900/30 bg-gradient-to-b from-[#161b22]/80 to-[#1c2128]/80 shadow-lg hover:shadow-blue-900/10 transition-all">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-blue-900/20">
              <div className="flex items-center gap-2">
                <div className="bg-amber-600/20 p-2 rounded-full">
                  <Shield className="h-4 w-4 text-amber-400" />
                </div>
                <CardTitle className="text-sm font-medium">Admin Access</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 hover:bg-blue-900/20" 
                onClick={() => goToStep(3)}
              >
                <FileEdit className="h-4 w-4 text-blue-400" />
              </Button>
            </CardHeader>
            <CardContent className="py-3 px-4">
              <p className="text-sm font-medium">
                {formData.adminSecretKey ? 'Admin access key provided' : 'No admin access'}
              </p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          className="flex-1"
          variant="outline"
          onClick={prevStep}
          disabled={stepValidation.isLoading}
        >
          <ChevronLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
          onClick={handleSubmit}
          disabled={stepValidation.isLoading}
        >
          {stepValidation.isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              Complete Registration
              <Check className="ml-1.5 h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
      {stepValidation.errors.registration && (
        <p className="text-xs text-red-500 text-center mt-2">
          {stepValidation.errors.registration}
        </p>
      )}
    </div>
  );
};

export default StepFourSummary;
