import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * This is a template component that demonstrates how to properly implement
 * multilanguage support throughout the application.
 *
 * Copy this pattern to other components:
 * 1. Import useTranslation hook
 * 2. Use t() function for all text content
 * 3. Use tWithParams() for dynamic content
 * 4. Use formatDate() and formatNumber() for locale-specific formatting
 */

interface MultiLanguageTemplateProps {
  userName?: string;
  documentCount?: number;
  lastLoginDate?: string;
}

export const MultiLanguageTemplate: React.FC<MultiLanguageTemplateProps> = ({
  userName = "John Doe",
  documentCount = 42,
  lastLoginDate = "2024-01-15T10:30:00Z",
}) => {
  const { t, tWithParams, formatDate, formatNumber } = useTranslation();

  return (
    <div className="p-6 space-y-6">
      {/* Example 1: Basic text translation */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </CardContent>
      </Card>

      {/* Example 2: Dynamic content with parameters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("users.userDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{tWithParams("documents.welcomeBack", { userName })}</p>

          <div className="flex items-center gap-2">
            <span>{t("documents.totalDocuments")}:</span>
            <Badge variant="secondary">{formatNumber(documentCount)}</Badge>
          </div>

          <p>
            {t("users.lastLogin")}: {formatDate(lastLoginDate)}
          </p>
        </CardContent>
      </Card>

      {/* Example 3: Form elements */}
      <Card>
        <CardHeader>
          <CardTitle>{t("common.actions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="default">{t("common.save")}</Button>
          <Button variant="outline">{t("common.cancel")}</Button>
          <Button variant="destructive">{t("common.delete")}</Button>
        </CardContent>
      </Card>

      {/* Example 4: Status and error messages */}
      <Card>
        <CardHeader>
          <CardTitle>{t("common.status")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-green-600">
            {t("common.success")}: {t("responsibilityCentres.centreCreated")}
          </div>
          <div className="text-red-600">
            {t("common.error")}: {t("errors.networkError")}
          </div>
          <div className="text-yellow-600">
            {t("common.warning")}: {t("responsibilityCentres.cannotDelete")}
          </div>
        </CardContent>
      </Card>

      {/* Example 5: Complex conditional content */}
      <Card>
        <CardHeader>
          <CardTitle>{t("responsibilityCentres.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {documentCount === 0 ? (
            <p className="text-muted-foreground">
              {t("documents.noDocuments")}
            </p>
          ) : (
            <p>
              {tWithParams("documents.youHaveDocuments", {
                count: documentCount,
              })}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/* 
IMPLEMENTATION GUIDE FOR OTHER COMPONENTS:

1. Import the hook:
   import { useTranslation } from '@/hooks/useTranslation';

2. Initialize in component:
   const { t, tWithParams, formatDate, formatNumber } = useTranslation();

3. Replace hardcoded strings:
   - "Dashboard" → {t('dashboard.title')}
   - "Save" → {t('common.save')}
   - "Cancel" → {t('common.cancel')}

4. For dynamic content:
   - `Hello ${name}!` → {tWithParams('Hello {{name}}!', { name })}

5. For dates and numbers:
   - new Date().toLocaleDateString() → {formatDate(date)}
   - number.toLocaleString() → {formatNumber(number)}

6. For error messages:
   - "Error occurred" → {t('errors.generic')}
   - "Network error" → {t('errors.networkError')}

7. Add new translation keys to src/translations/index.ts when needed

COMPONENTS TO UPDATE:
- src/pages/Dashboard.tsx
- src/pages/UserManagement.tsx  
- src/components/navigation/SidebarNav.tsx (partially done)
- src/pages/ResponsibilityCentreManagement.tsx (partially done)
- src/pages/Login.tsx (partially done)
- src/pages/Register.tsx
- src/pages/Settings.tsx (already has some translations)
- All dialog components
- All form components
- All error handling components
*/
