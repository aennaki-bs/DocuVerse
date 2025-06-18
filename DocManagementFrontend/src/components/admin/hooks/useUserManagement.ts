import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import adminService, { UserDto } from '@/services/adminService';

export type UserSortField = 'firstName' | 'lastName' | 'username' | 'email' | 'role' | 'isActive' | 'createdAt';
export type UserSortDirection = 'asc' | 'desc';

export function useUserManagement() {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [editEmailUser, setEditEmailUser] = useState<UserDto | null | null>(null);
  const [viewingUserLogs, setViewingUserLogs] = useState<number | null>(null);
  const [deletingUser, setDeletingUser] = useState<number | null>(null);
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [roleFilter, setRoleFilter] = useState('any');
  const [statusFilter, setStatusFilter] = useState('any');
  const [roleChangeOpen, setRoleChangeOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [sortBy, setSortBy] = useState<UserSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<UserSortDirection>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { data: users, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getAllUsers,
  });

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = (filteredUsers: UserDto[]) => {
    if (selectedUsers.length === filteredUsers?.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers?.map(user => user.id) || []);
    }
  };

  const handleUserEdited = () => {
    refetch();
    setEditingUser(null);
  };

  const handleUserEmailEdited = () => {
    refetch();
    setEditEmailUser(null);
  };

  const handleUserDeleted = () => {
    refetch();
    setDeletingUser(null);
    setSelectedUsers([]);
  };

  const handleMultipleDeleted = () => {
    refetch();
    setSelectedUsers([]);
    setDeleteMultipleOpen(false);
  };

  const getRoleName = (role: any) => {
    if (!role) return '';
    if (typeof role === 'string') return role;
    if (typeof role === 'object' && role.roleName) return role.roleName;
    return '';
  };

  const filteredUsers = users?.filter(user => {
    if (statusFilter !== 'any') {
      const isActive = statusFilter === 'active';
      if (user.isActive !== isActive) return false;
    }
    if (roleFilter !== 'any' && getRoleName(user.role) !== roleFilter) return false;
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    switch (searchField) {
      case 'username':
        return user.username.toLowerCase().includes(searchLower);
      case 'email':
        return user.email.toLowerCase().includes(searchLower);
      case 'firstName':
        return user.firstName.toLowerCase().includes(searchLower);
      case 'lastName':
        return user.lastName.toLowerCase().includes(searchLower);
      case 'role':
        return getRoleName(user.role).toLowerCase().includes(searchLower);
      case 'fullName':
        return (
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
          `${user.lastName} ${user.firstName}`.toLowerCase().includes(searchLower)
        );
      case 'all':
      default:
        return (
          user.username.toLowerCase().includes(searchLower) ||
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          getRoleName(user.role).toLowerCase().includes(searchLower) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
        );
    }
  }) || [];

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];
    if (sortBy === 'role') {
      aValue = getRoleName(a.role);
      bValue = getRoleName(b.role);
    }
    if (sortBy === 'isActive') {
      aValue = a.isActive ? 1 : 0;
      bValue = b.isActive ? 1 : 0;
    }
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: UserSortField) => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return {
    selectedUsers,
    editingUser,
    editEmailUser,
    viewingUserLogs,
    deletingUser,
    deleteMultipleOpen,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    roleChangeOpen,
    selectedRole,
    users: sortedUsers,
    isLoading,
    isError,
    refetch,
    setEditingUser,
    setEditEmailUser,
    setViewingUserLogs,
    setDeletingUser,
    setDeleteMultipleOpen,
    setRoleChangeOpen,
    setSelectedRole,
    handleSort,
    sortBy,
    sortDirection,
    handleSelectUser,
    handleSelectAll,
    handleUserEdited,
    handleUserEmailEdited,
    handleUserDeleted,
    handleMultipleDeleted,
  };
}
