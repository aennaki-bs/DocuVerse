import { useState } from "react";
import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import LocationsManagement from "@/components/line-elements/LocationsManagement";

const LocationsManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <PageHeader
        title="Locations Management"
        description="Manage warehouse and storage locations for items"
        icon={<MapPin className="h-6 w-6 text-orange-400" />}
      />

      {/* Main Content */}
      <Card className="bg-[#0a1033] border-blue-900/30 shadow-lg">
        <CardContent className="p-6">
          <LocationsManagement searchTerm={searchTerm} />
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationsManagementPage; 