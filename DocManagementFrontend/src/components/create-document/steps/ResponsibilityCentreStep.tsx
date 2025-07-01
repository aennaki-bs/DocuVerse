import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Info,
  CheckCircle,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ResponsibilityCentreSelect } from "@/components/responsibility-centre/ResponsibilityCentreSelect";
import { ResponsibilityCentreSimple } from "@/models/responsibilityCentre";
import { useTranslation } from "@/hooks/useTranslation";

interface ResponsibilityCentreStepProps {
  selectedCentreId?: number;
  onCentreChange: (centreId: number | undefined) => void;
  userHasCentre?: boolean;
  userCentreName?: string;
  isLoading?: boolean;
  responsibilityCentres?: ResponsibilityCentreSimple[];
  onRetryFetch?: () => void;
}

const TroubleshootingTips = () => {
  const { t } = useTranslation();
  
  return (
    <div className="mt-4 p-4 bg-gray-900/60 rounded-md border border-gray-700">
      <h4 className="text-blue-300 font-medium mb-2 flex items-center">
        <Info className="h-4 w-4 mr-1" /> {t("documents.troubleshootingTips")}
      </h4>
      <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
        <li>{t("documents.checkInternetConnection")}</li>
        <li>{t("documents.ensureProperPermissions")}</li>
        <li>{t("documents.tryLoggingOutAndIn")}</li>
        <li>{t("documents.contactAdministrator")}</li>
      </ul>
    </div>
  );
};

export const ResponsibilityCentreStep: React.FC<
  ResponsibilityCentreStepProps
> = ({
  selectedCentreId,
  onCentreChange,
  userHasCentre = false,
  userCentreName,
  isLoading = false,
  responsibilityCentres = [],
  onRetryFetch,
}) => {
  const { t } = useTranslation();
  const hasNoCentres = !isLoading && responsibilityCentres.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <Building2 className="h-12 w-12 text-blue-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">{t("documents.responsibilityCentre")}</h2>
        <p className="text-gray-400">
          {userHasCentre
            ? t("documents.documentWillBeAssignedToYourCentre")
            : t("documents.selectResponsibilityCentreForDocument")}
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              <span className="text-blue-300 font-medium">
                {t("documents.loadingResponsibilityCentreInfo")}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content when not loading */}
      {!isLoading && (
        <>
          {userHasCentre ? (
            // User has a responsibility centre - just show info card
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                  {t("documents.yourResponsibilityCentre")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-900/20 p-4 rounded-md">
                  <div className="flex items-center">
                    <Building2 className="h-6 w-6 text-blue-400 mr-3" />
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {userCentreName}
                      </div>
                      <p className="text-blue-300 text-sm mt-1">
                        {t("documents.documentWillBeAutomaticallyAssigned")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // User doesn't have a responsibility centre - show selection
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  {t("documents.selectResponsibilityCentre")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 bg-amber-900/20 border-amber-800/30">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-amber-300">
                    {t("documents.accountNotAssignedSelectCentre")}
                  </AlertDescription>
                </Alert>

                {hasNoCentres ? (
                  <div className="space-y-4">
                    <Alert className="bg-amber-900/20 border-amber-800/30">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <AlertDescription className="text-amber-300 flex flex-col space-y-2">
                        <span>
                          {t("documents.unableToLoadCentres")}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="self-start bg-amber-900/30 border-amber-700 text-amber-200 hover:bg-amber-800/50"
                          onClick={onRetryFetch}
                        >
                          <RefreshCw className="h-3 w-3 mr-2" />
                          {t("documents.retryLoading")}
                        </Button>
                      </AlertDescription>
                    </Alert>
                    <TroubleshootingTips />
                  </div>
                ) : (
                  <>
                    <ResponsibilityCentreSelect
                      value={selectedCentreId}
                      onValueChange={onCentreChange}
                      placeholder={t("documents.selectResponsibilityCentre")}
                      required={true}
                    />

                    {selectedCentreId && (
                      <Card className="bg-green-900/20 border-green-800/30 mt-4">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-green-400">
                              <CheckCircle className="h-4 w-4" />
                              <span className="font-medium">
                                {t("documents.documentWillBeAssignedToSelected")}
                              </span>
                            </div>
                            {/* <div className="text-xs text-green-300 bg-green-900/30 px-2 py-1 rounded">
                              You can change this selection above
                            </div> */}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
};
