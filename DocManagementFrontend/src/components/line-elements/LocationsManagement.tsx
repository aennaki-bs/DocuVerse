import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import locationService from "@/services/locationService";
import {
  LocationDto,
  CreateLocationRequest,
  UpdateLocationRequest,
} from "@/models/location";

interface LocationsManagementProps {
  searchTerm?: string;
}

const LocationsManagement = ({ searchTerm = "" }: LocationsManagementProps) => {
  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationDto | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<CreateLocationRequest>({
    locationCode: "",
    description: "",
  });

  const queryClient = useQueryClient();

  // Load locations
  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const data = await locationService.getAll();
      setLocations(data);
    } catch (error) {
      console.error("Failed to load locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // Filter locations based on search term
  const filteredLocations = locations.filter((location) => {
    const searchQuery = (searchTerm || localSearchTerm).toLowerCase();
    return (
      location.locationCode.toLowerCase().includes(searchQuery) ||
      location.description.toLowerCase().includes(searchQuery)
    );
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      locationCode: "",
      description: "",
    });
  };

  // Handle create
  const handleCreate = async () => {
    if (!formData.locationCode.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await locationService.create(formData);
      toast.success("Location created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      loadLocations();
    } catch (error: any) {
      console.error("Failed to create location:", error);
      toast.error(error.response?.data?.message || "Failed to create location");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = async () => {
    if (!selectedLocation || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const updateRequest: UpdateLocationRequest = {
        description: formData.description,
      };
      await locationService.update(selectedLocation.locationCode, updateRequest);
      toast.success("Location updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedLocation(null);
      loadLocations();
    } catch (error: any) {
      console.error("Failed to update location:", error);
      toast.error(error.response?.data?.message || "Failed to update location");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedLocation) return;

    try {
      setIsSubmitting(true);
      await locationService.delete(selectedLocation.locationCode);
      toast.success("Location deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedLocation(null);
      loadLocations();
    } catch (error: any) {
      console.error("Failed to delete location:", error);
      toast.error(error.response?.data?.message || "Failed to delete location");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (location: LocationDto) => {
    setSelectedLocation(location);
    setFormData({
      locationCode: location.locationCode,
      description: location.description,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (location: LocationDto) => {
    setSelectedLocation(location);
    setIsDeleteDialogOpen(true);
  };

  // Handle checkbox selection
  const handleSelectLocation = (locationCode: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationCode)
        ? prev.filter(code => code !== locationCode)
        : [...prev, locationCode]
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedLocations.length === filteredLocations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(filteredLocations.map(location => location.locationCode));
    }
  };

  // Check if all locations are selected
  const isAllSelected = filteredLocations.length > 0 && selectedLocations.length === filteredLocations.length;
  const isIndeterminate = selectedLocations.length > 0 && selectedLocations.length < filteredLocations.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-blue-300">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <MapPin className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Locations</h2>
            <p className="text-blue-300 text-sm">
              Manage warehouse and storage locations for items
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white"
          disabled
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Search */}
      {!searchTerm && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
          <Input
            placeholder="Search locations..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10 bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50"
          />
        </div>
      )}



      {/* Selection Info */}
      {selectedLocations.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {selectedLocations.length} selected
            </Badge>
            <span className="text-blue-300 text-sm">
              {selectedLocations.length === 1 ? "location" : "locations"} selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLocations([])}
              className="border-blue-400/30 text-blue-300 hover:bg-blue-900/40"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <Card className="bg-blue-950/20 border-blue-500/20">
        <CardContent className="p-0">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-8 text-blue-400">
              {locations.length === 0
                ? "No locations found. Create your first location to get started."
                : "No locations match your search criteria."}
            </div>
          ) : (
            <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
              {/* Fixed Header - Never Scrolls */}
              <div className="min-w-[850px] border-b border-blue-900/30">
                <Table className="table-fixed w-full">
                  <TableHeader className="bg-gradient-to-r from-[#1a2c6b] to-[#0a1033]">
                    <TableRow className="border-blue-500/20 hover:bg-transparent">
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el && "indeterminate" in el) {
                              (el as any).indeterminate = isIndeterminate;
                            }
                          }}
                          onCheckedChange={handleSelectAll}
                          className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </TableHead>
                      <TableHead className="text-blue-300 w-[200px]">Location Code</TableHead>
                      <TableHead className="text-blue-300 w-[400px]">Description</TableHead>
                      <TableHead className="text-blue-300 text-right w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>

              {/* Scrollable Body - Only Content Scrolls */}
              <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                <div className="min-w-[850px]">
                  <Table className="table-fixed w-full">
                    <TableBody>
                      {filteredLocations.map((location) => (
                        <TableRow
                          key={location.locationCode}
                          className={`border-blue-500/20 hover:bg-blue-950/30 ${
                            selectedLocations.includes(location.locationCode)
                              ? "bg-blue-900/40 border-l-4 border-l-blue-500"
                              : ""
                          }`}
                        >
                          <TableCell className="w-[50px]">
                            <Checkbox
                              checked={selectedLocations.includes(location.locationCode)}
                              onCheckedChange={() => handleSelectLocation(location.locationCode)}
                              className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-white w-[200px]">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className="bg-orange-900/30 border-orange-500/30 text-orange-300"
                              >
                                {location.locationCode}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-blue-200 w-[400px]">
                            {location.description}
                          </TableCell>
                          <TableCell className="text-right w-[200px]">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(location)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(location)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/40"
                                disabled
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-[#0a1033] border-blue-900/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-orange-400" />
              Create New Location
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="locationCode" className="text-blue-200">
                Location Code <span className="text-red-400">*</span>
              </Label>
              <Input
                id="locationCode"
                value={formData.locationCode}
                onChange={(e) =>
                  setFormData({ ...formData, locationCode: e.target.value })
                }
                placeholder="Enter location code (e.g., WH001)"
                className="bg-blue-950/40 border-blue-400/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-blue-200">
                Description <span className="text-red-400">*</span>
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter location description"
                className="bg-blue-950/40 border-blue-400/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-blue-400/30 text-blue-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Location"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#0a1033] border-blue-900/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Edit className="h-5 w-5 mr-2 text-orange-400" />
              Edit Location
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editLocationCode" className="text-blue-200">
                Location Code
              </Label>
              <Input
                id="editLocationCode"
                value={formData.locationCode}
                disabled
                className="bg-blue-950/20 border-blue-400/20 text-blue-300"
              />
              <p className="text-xs text-blue-400">
                Location code cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription" className="text-blue-200">
                Description <span className="text-red-400">*</span>
              </Label>
              <Input
                id="editDescription"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter location description"
                className="bg-blue-950/40 border-blue-400/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-blue-400/30 text-blue-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Location"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#0a1033] border-blue-900/30">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-red-400" />
              Delete Location
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-blue-200">
              Are you sure you want to delete the location{" "}
              <span className="font-semibold text-orange-400">
                {selectedLocation?.locationCode}
              </span>
              ?
            </p>
            <p className="text-sm text-red-400">
              This action cannot be undone. Any items using this location may be affected.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-blue-400/30 text-blue-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Location"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationsManagement; 