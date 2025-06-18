// import React, { useState, useEffect, useMemo } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Plus,
//   Edit,
//   Trash2,
//   Search,
//   Users,
//   AlertTriangle,
//   ChevronUp,
//   ChevronDown,
// } from "lucide-react";
// import { toast } from "sonner";
// import { Badge } from "@/components/ui/badge";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Textarea } from "@/components/ui/textarea";
// import customerService from "@/services/customerService";
// import { Customer, UpdateCustomerRequest } from "@/models/customer";
// import CreateCustomerWizard from "./CreateCustomerWizard";

// export default function CustomerManagement() {
//   const queryClient = useQueryClient();

//   // State management
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortField, setSortField] = useState<keyof Customer>("code");
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
//   const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
//   const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

//   // Form state for editing
//   const [editFormData, setEditFormData] = useState({
//     name: "",
//     address: "",
//     city: "",
//     country: "",
//   });

//   // Fetch customers
//   const {
//     data: customers = [],
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["customers"],
//     queryFn: customerService.getAll,
//   });

//   // Update customer mutation
//   const updateMutation = useMutation({
//     mutationFn: ({
//       code,
//       data,
//     }: {
//       code: string;
//       data: UpdateCustomerRequest;
//     }) => customerService.update(code, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["customers"] });
//       setIsEditDialogOpen(false);
//       setEditingCustomer(null);
//       resetEditFormData();
//       toast.success("Customer updated successfully");
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || "Failed to update customer");
//     },
//   });

//   // Delete customer mutation
//   const deleteMutation = useMutation({
//     mutationFn: customerService.delete,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["customers"] });
//       toast.success("Customer deleted successfully");
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || "Failed to delete customer");
//     },
//   });

//   // Filtered and sorted customers
//   const filteredAndSortedCustomers = useMemo(() => {
//     let filtered = customers.filter(
//       (customer) =>
//         customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         customer.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         customer.address.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     return filtered.sort((a, b) => {
//       const aValue = a[sortField];
//       const bValue = b[sortField];

//       if (sortDirection === "asc") {
//         return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
//       } else {
//         return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
//       }
//     });
//   }, [customers, searchTerm, sortField, sortDirection]);

//   // Utility functions
//   const resetEditFormData = () => {
//     setEditFormData({
//       name: "",
//       address: "",
//       city: "",
//       country: "",
//     });
//   };

//   const handleSort = (field: keyof Customer) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//     } else {
//       setSortField(field);
//       setSortDirection("asc");
//     }
//   };

//   const renderSortIcon = (field: keyof Customer) => {
//     if (sortField !== field) return null;
//     return sortDirection === "asc" ? (
//       <ChevronUp className="h-4 w-4" />
//     ) : (
//       <ChevronDown className="h-4 w-4" />
//     );
//   };

//   const headerClass = (field: keyof Customer) =>
//     `cursor-pointer hover:bg-blue-800/30 text-blue-200 font-medium ${
//       sortField === field ? "bg-blue-700/40" : ""
//     }`;

//   const handleSelectCustomer = (code: string) => {
//     setSelectedCustomers((prev) =>
//       prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectedCustomers.length === filteredAndSortedCustomers.length) {
//       setSelectedCustomers([]);
//     } else {
//       setSelectedCustomers(filteredAndSortedCustomers.map((c) => c.code));
//     }
//   };

//   const openCreateWizard = () => {
//     setIsCreateWizardOpen(true);
//   };

//   const openEditDialog = (customer: Customer) => {
//     setEditingCustomer(customer);
//     setEditFormData({
//       name: customer.name,
//       address: customer.address,
//       city: customer.city,
//       country: customer.country,
//     });
//     setIsEditDialogOpen(true);
//   };

//   const handleUpdate = async () => {
//     if (!editingCustomer) return;

//     try {
//       const updateRequest: UpdateCustomerRequest = {
//         name: editFormData.name.trim(),
//         address: editFormData.address.trim(),
//         city: editFormData.city.trim(),
//         country: editFormData.country.trim(),
//       };
//       await updateMutation.mutateAsync({
//         code: editingCustomer.code,
//         data: updateRequest,
//       });
//     } catch (error) {
//       // Error handled in mutation
//     }
//   };

//   const handleDelete = async (code: string) => {
//     try {
//       await deleteMutation.mutateAsync(code);
//     } catch (error) {
//       // Error handled in mutation
//     }
//   };

//   const canDeleteSelected = selectedCustomers.length > 0;

//   const handleBulkDelete = async () => {
//     try {
//       for (const code of selectedCustomers) {
//         await customerService.delete(code);
//       }
//       queryClient.invalidateQueries({ queryKey: ["customers"] });
//       setSelectedCustomers([]);
//       toast.success(
//         `${selectedCustomers.length} customers deleted successfully`
//       );
//     } catch (error: any) {
//       toast.error("Failed to delete some customers");
//     }
//   };

//   if (isLoading) {
//     return <div className="p-6 text-blue-200">Loading customers...</div>;
//   }

//   if (error) {
//     return <div className="p-6 text-red-400">Error loading customers</div>;
//   }

//   return (
//     <div className="space-y-6 bg-red-500 h-full">
//       {/* Header */}
//       <div className="flex items-center justify-between h-1/12">
//         <div className="flex items-center gap-3">
//           <Users className="h-8 w-8 text-blue-400" />
//           <div>
//             <h1 className="text-3xl font-bold text-blue-100">
//               Customer Management
//             </h1>
//             <p className="text-blue-300/80">
//               Manage customer information and relationships
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           {selectedCustomers.length > 0 && (
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <div>
//                     <AlertDialog>
//                       <AlertDialogTrigger asChild>
//                         <Button
//                           variant="destructive"
//                           size="sm"
//                           disabled={!canDeleteSelected}
//                           className="opacity-90 hover:opacity-100"
//                         >
//                           <Trash2 className="h-4 w-4 mr-1" />
//                           Delete Selected ({selectedCustomers.length})
//                         </Button>
//                       </AlertDialogTrigger>
//                       <AlertDialogContent className="bg-gray-900 border-gray-700">
//                         <AlertDialogHeader>
//                           <AlertDialogTitle className="text-red-400 flex items-center gap-2">
//                             <AlertTriangle className="h-5 w-5" />
//                             Confirm Bulk Deletion
//                           </AlertDialogTitle>
//                           <AlertDialogDescription className="text-gray-300">
//                             Are you sure you want to delete{" "}
//                             {selectedCustomers.length} selected customers? This
//                             action cannot be undone.
//                             {!canDeleteSelected && (
//                               <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-300">
//                                 Some selected customers have associated
//                                 documents and cannot be deleted.
//                               </div>
//                             )}
//                           </AlertDialogDescription>
//                         </AlertDialogHeader>
//                         <AlertDialogFooter>
//                           <AlertDialogCancel className="bg-gray-700 text-gray-200 hover:bg-gray-600">
//                             Cancel
//                           </AlertDialogCancel>
//                           <AlertDialogAction
//                             onClick={handleBulkDelete}
//                             className="bg-red-600 text-white hover:bg-red-700"
//                             disabled={!canDeleteSelected}
//                           >
//                             Delete {selectedCustomers.length} Customers
//                           </AlertDialogAction>
//                         </AlertDialogFooter>
//                       </AlertDialogContent>
//                     </AlertDialog>
//                   </div>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   {canDeleteSelected
//                     ? `Delete ${selectedCustomers.length} selected customers`
//                     : "Select customers to delete"}
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           )}
//           <Button
//             onClick={openCreateWizard}
//             className="bg-blue-600 text-white hover:bg-blue-700"
//           >
//             <Plus className="h-4 w-4 mr-2" />
//             Add Customer
//           </Button>
//         </div>
//       </div>

//       {/* Search */}
//       {/* <div className="flex items-center gap-4">
//         <div className="relative flex-1 max-w-sm">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
//           <Input
//             placeholder="Search customers..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10 bg-blue-950/50 border-blue-800 text-blue-100 placeholder-blue-400"
//           />
//         </div>
//         <div className="text-sm text-blue-300">
//           {filteredAndSortedCustomers.length} of {customers.length} customers
//         </div>
//       </div> */}

//       {/* Table */}
//       {/* <div className="rounded-lg border border-blue-900/30 bg-blue-950/20 backdrop-blur-sm overflow-hidden">
//         <Table>
//           <TableHeader>
//             <TableRow className="border-blue-900/30 hover:bg-blue-900/20">
//               <TableHead className="w-12 text-blue-200 font-medium">
//                 <Checkbox
//                   checked={
//                     selectedCustomers.length ===
//                       filteredAndSortedCustomers.length &&
//                     filteredAndSortedCustomers.length > 0
//                   }
//                   onCheckedChange={handleSelectAll}
//                   className="border-blue-400 data-[state=checked]:bg-blue-600"
//                 />
//               </TableHead>
//               <TableHead
//                 className={headerClass("code")}
//                 onClick={() => handleSort("code")}
//               >
//                 <div className="flex items-center">
//                   Code {renderSortIcon("code")}
//                 </div>
//               </TableHead>
//               <TableHead
//                 className={headerClass("name")}
//                 onClick={() => handleSort("name")}
//               >
//                 <div className="flex items-center">
//                   Name {renderSortIcon("name")}
//                 </div>
//               </TableHead>
//               <TableHead
//                 className={headerClass("city")}
//                 onClick={() => handleSort("city")}
//               >
//                 <div className="flex items-center">
//                   City {renderSortIcon("city")}
//                 </div>
//               </TableHead>
//               <TableHead
//                 className={headerClass("country")}
//                 onClick={() => handleSort("country")}
//               >
//                 <div className="flex items-center">
//                   Country {renderSortIcon("country")}
//                 </div>
//               </TableHead>
//               <TableHead
//                 className={headerClass("address")}
//                 onClick={() => handleSort("address")}
//               >
//                 <div className="flex items-center">
//                   Address {renderSortIcon("address")}
//                 </div>
//               </TableHead>
//               <TableHead className="w-16 text-blue-200 font-medium text-right pr-4">
//                 Actions
//               </TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredAndSortedCustomers.map((customer) => (
//               <TableRow
//                 key={customer.code}
//                 className="border-blue-900/30 hover:bg-blue-900/10"
//               >
//                 <TableCell>
//                   <Checkbox
//                     checked={selectedCustomers.includes(customer.code)}
//                     onCheckedChange={() => handleSelectCustomer(customer.code)}
//                     className="border-blue-400 data-[state=checked]:bg-blue-600"
//                   />
//                 </TableCell>
//                 <TableCell className="font-mono text-blue-200">
//                   {customer.code}
//                 </TableCell>
//                 <TableCell className="font-medium text-blue-100">
//                   {customer.name}
//                 </TableCell>
//                 <TableCell className="text-blue-200">
//                   {customer.city || "-"}
//                 </TableCell>
//                 <TableCell className="text-blue-200">
//                   {customer.country || "-"}
//                 </TableCell>
//                 <TableCell className="text-blue-200">
//                   {customer.address || "-"}
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <div className="flex items-center justify-end gap-1">
//                     <TooltipProvider>
//                       <Tooltip>
//                         <TooltipTrigger asChild>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => openEditDialog(customer)}
//                             className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-800/30"
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                         </TooltipTrigger>
//                         <TooltipContent>Edit customer</TooltipContent>
//                       </Tooltip>
//                     </TooltipProvider>

//                     <TooltipProvider>
//                       <Tooltip>
//                         <TooltipTrigger asChild>
//                           <div>
//                             <AlertDialog>
//                               <AlertDialogTrigger asChild>
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-800/30"
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               </AlertDialogTrigger>
//                               <AlertDialogContent className="bg-gray-900 border-gray-700">
//                                 <AlertDialogHeader>
//                                   <AlertDialogTitle className="text-red-400 flex items-center gap-2">
//                                     <AlertTriangle className="h-5 w-5" />
//                                     Confirm Deletion
//                                   </AlertDialogTitle>
//                                   <AlertDialogDescription className="text-gray-300">
//                                     Are you sure you want to delete customer "
//                                     {customer.name}" ({customer.code})? This
//                                     action cannot be undone.
//                                   </AlertDialogDescription>
//                                 </AlertDialogHeader>
//                                 <AlertDialogFooter>
//                                   <AlertDialogCancel className="bg-gray-700 text-gray-200 hover:bg-gray-600">
//                                     Cancel
//                                   </AlertDialogCancel>
//                                   <AlertDialogAction
//                                     onClick={() => handleDelete(customer.code)}
//                                     className="bg-red-600 text-white hover:bg-red-700"
//                                   >
//                                     Delete Customer
//                                   </AlertDialogAction>
//                                 </AlertDialogFooter>
//                               </AlertDialogContent>
//                             </AlertDialog>
//                           </div>
//                         </TooltipTrigger>
//                         <TooltipContent>Delete customer</TooltipContent>
//                       </Tooltip>
//                     </TooltipProvider>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div> */}

//       {/* Create Customer Wizard */}
//       <CreateCustomerWizard
//         isOpen={isCreateWizardOpen}
//         onClose={() => setIsCreateWizardOpen(false)}
//       />

//       {/* Edit Customer Dialog */}
//       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//         <DialogContent className="bg-gray-900 border-gray-700 text-white">
//           <DialogHeader>
//             <DialogTitle className="text-blue-400 flex items-center gap-2">
//               <Edit className="h-5 w-5" />
//               Edit Customer: {editingCustomer?.code}
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4">
//             <div>
//               <Label className="text-blue-200">Customer Code</Label>
//               <Input
//                 value={editingCustomer?.code || ""}
//                 disabled
//                 className="bg-gray-800 border-gray-600 text-gray-400"
//               />
//             </div>
//             <div>
//               <Label htmlFor="edit-name" className="text-blue-200">
//                 Customer Name *
//               </Label>
//               <Input
//                 id="edit-name"
//                 value={editFormData.name}
//                 onChange={(e) =>
//                   setEditFormData({ ...editFormData, name: e.target.value })
//                 }
//                 placeholder="Enter customer name"
//                 className="bg-gray-800 border-gray-600 text-white"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="edit-address" className="text-blue-200">
//                 Address
//               </Label>
//               <Textarea
//                 id="edit-address"
//                 value={editFormData.address}
//                 onChange={(e) =>
//                   setEditFormData({ ...editFormData, address: e.target.value })
//                 }
//                 placeholder="Enter customer address"
//                 className="bg-gray-800 border-gray-600 text-white"
//                 rows={3}
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="edit-city" className="text-blue-200">
//                   City
//                 </Label>
//                 <Input
//                   id="edit-city"
//                   value={editFormData.city}
//                   onChange={(e) =>
//                     setEditFormData({ ...editFormData, city: e.target.value })
//                   }
//                   placeholder="Enter city"
//                   className="bg-gray-800 border-gray-600 text-white"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="edit-country" className="text-blue-200">
//                   Country
//                 </Label>
//                 <Input
//                   id="edit-country"
//                   value={editFormData.country}
//                   onChange={(e) =>
//                     setEditFormData({
//                       ...editFormData,
//                       country: e.target.value,
//                     })
//                   }
//                   placeholder="Enter country"
//                   className="bg-gray-800 border-gray-600 text-white"
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="flex justify-end gap-2 pt-4">
//             <Button
//               variant="outline"
//               onClick={() => setIsEditDialogOpen(false)}
//               className="border-gray-600 text-gray-300 hover:bg-gray-800"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleUpdate}
//               disabled={!editFormData.name || updateMutation.isPending}
//               className="bg-blue-600 text-white hover:bg-blue-700"
//             >
//               {updateMutation.isPending ? "Updating..." : "Update Customer"}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
