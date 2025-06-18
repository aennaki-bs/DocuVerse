import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/AuthContext';

// Define the search result item structure
export interface SearchResultItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  path: string;
  category: string;
  keywords?: string[]; // Additional search keywords
}

export function useNavSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const isAdmin = user?.role === "Admin";
  const isSimpleUser = user?.role === "SimpleUser";

  // Define the available pages/routes for search with translations
  const availablePages = useMemo(() => {
    const allPages = [
      {
        id: 'dashboard',
        title: t('nav.dashboard'),
        description: 'Main dashboard with activity overview',
        path: '/dashboard',
        category: t('nav.dashboard'),
        icon: 'LayoutDashboard',
        keywords: ['home', 'main', 'overview', 'stats']
      },
      {
        id: 'documents',
        title: t('nav.documents'),
        description: t('documents.subtitle'),
        path: '/documents',
        category: t('nav.documents'),
        icon: 'FileText',
        keywords: ['files', 'docs', 'content']
      },
      {
        id: 'document-types',
        title: t('nav.documentTypes'),
        description: 'Manage document types and categories',
        path: '/document-types-management',
        category: t('nav.documentTypes'),
        icon: 'Layers',
        keywords: ['types', 'categories', 'templates']
      },
      {
        id: 'line-elements',
        title: t('nav.lineElements'),
        description: 'Manage line elements and components',
        path: '/line-elements-management',
        category: t('nav.lineElements'),
        icon: 'Box',
        keywords: ['elements', 'components', 'items']
      },
      {
        id: 'line-elements-types',
        title: 'Element Types',
        description: 'Manage element types',
        path: '/line-elements-management?tab=elementtypes',
        category: t('nav.lineElements'),
        icon: 'Tag',
        keywords: ['element', 'types']
      },
      {
        id: 'line-elements-items',
        title: 'Items',
        description: 'Manage line element items',
        path: '/line-elements-management?tab=items',
        category: t('nav.lineElements'),
        icon: 'Package',
        keywords: ['items', 'products']
      },
      {
        id: 'line-elements-units',
        title: 'Unit Codes',
        description: 'Manage unit codes',
        path: '/line-elements-management?tab=unitecodes',
        category: t('nav.lineElements'),
        icon: 'Hash',
        keywords: ['units', 'codes', 'measures']
      },
      {
        id: 'line-elements-accounts',
        title: 'General Accounts',
        description: 'Manage general accounts',
        path: '/line-elements-management?tab=generalaccounts',
        category: t('nav.lineElements'),
        icon: 'Calculator',
        keywords: ['accounts', 'general', 'finance']
      },
      {
        id: 'circuits',
        title: t('nav.circuits'),
        description: 'Document workflow circuits',
        path: '/circuits',
        category: t('nav.circuits'),
        icon: 'GitBranch',
        keywords: ['workflow', 'process', 'flow']
      },
      {
        id: 'approval',
        title: t('nav.approval'),
        description: 'Approval management section',
        path: '/approval-groups',
        category: t('nav.approval'),
        icon: 'UserCheck',
        keywords: ['approve', 'validation', 'review']
      },
      {
        id: 'approval-groups',
        title: 'Groups',
        description: 'Manage document approval groups',
        path: '/approval-groups',
        category: t('nav.approval'),
        icon: 'UsersRound',
        keywords: ['groups', 'teams', 'approve']
      },
      {
        id: 'approvers',
        title: 'Approvers',
        description: 'Manage document approvers',
        path: '/approvers-management',
        category: t('nav.approval'),
        icon: 'UserCog',
        keywords: ['approvers', 'reviewers', 'validators']
      },
      {
        id: 'profile',
        title: t('nav.profile'),
        description: 'View and edit your profile',
        path: '/profile',
        category: 'User',
        icon: 'User',
        keywords: ['account', 'personal', 'info']
      },
      {
        id: 'settings',
        title: t('nav.settings'),
        description: 'Application settings and preferences',
        path: '/settings',
        category: 'User',
        icon: 'Settings',
        keywords: ['preferences', 'config', 'options']
      }
    ];

    // Filter pages based on user role
    return allPages.filter(page => {
      // Admin-only pages
      if ((page.id === 'user-management' || page.id === 'responsibility-centres') && !isAdmin) {
        return false;
      }
      
      // Non-simple user pages
      if (isSimpleUser && [
        'document-types', 'line-elements', 'line-elements-types', 
        'line-elements-items', 'line-elements-units', 'line-elements-accounts',
        'circuits', 'approval', 'approval-groups', 'approvers'
      ].includes(page.id)) {
        return false;
      }

      return true;
    });
  }, [t, isAdmin, isSimpleUser]);

  // Add user-specific pages based on role
  const userSpecificPages = useMemo(() => {
    const pages = [...availablePages];

    // Add admin-only pages
    if (isAdmin) {
      pages.push(
        {
          id: 'user-management',
          title: t('nav.userManagement'),
          description: t('users.subtitle'),
          path: '/user-management',
          category: 'Admin',
          icon: 'Users',
          keywords: ['users', 'admin', 'management']
        },
        {
          id: 'responsibility-centres',
          title: t('nav.responsibilityCentres'),
          description: t('responsibilityCentres.subtitle'),
          path: '/responsibility-centres',
          category: 'Admin',
          icon: 'Building2',
          keywords: ['centres', 'responsibility', 'organization']
        }
      );
    }

    // Add approval pages for non-simple users
    if (!isSimpleUser) {
      pages.push({
        id: 'pending-approvals',
        title: t('nav.myApprovals'),
        description: 'Documents waiting for your approval',
        path: '/pending-approvals',
        category: t('nav.approval'),
        icon: 'ClipboardCheck',
        keywords: ['pending', 'waiting', 'review', 'approve']
      });
    }

    // Add common action pages
    pages.push(
      {
        id: 'create-document',
        title: t('documents.createDocument'),
        description: 'Create a new document',
        path: '/documents/create',
        category: 'Actions',
        icon: 'Plus',
        keywords: ['new', 'add', 'create']
      }
    );

    return pages;
  }, [availablePages, t, isAdmin, isSimpleUser]);

  // Enhanced search function that supports multiple languages and keywords
  const performSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    const query = searchQuery.toLowerCase().trim();
    const results = userSpecificPages.filter(page => {
      const searchableText = [
        page.title,
        page.description || '',
        page.category,
        ...(page.keywords || [])
      ].join(' ').toLowerCase();

      return searchableText.includes(query);
    });

    // Sort results by relevance (exact title matches first)
    const sortedResults = results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      // Exact matches first
      if (aTitle === query && bTitle !== query) return -1;
      if (bTitle === query && aTitle !== query) return 1;
      
      // Title starts with query
      if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
      if (bTitle.startsWith(query) && !aTitle.startsWith(query)) return 1;
      
      // Alphabetical order
      return aTitle.localeCompare(bTitle);
    });

    setSearchResults(sortedResults);
    setIsSearching(false);
  }, [searchQuery, userSpecificPages]);

  // Update search results whenever the query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  // Navigate to search result
  const navigateToResult = (path: string) => {
    setSearchQuery('');
    setSearchResults([]);
    navigate(path);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    navigateToResult,
  };
} 