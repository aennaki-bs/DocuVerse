
import { DocumentsFilterProvider } from './hooks/useDocumentsFilter';
import DocumentsPage from './DocumentsPage';

export default function DocumentsPageWrapper() {
  return (
    <DocumentsFilterProvider>
      <DocumentsPage />
    </DocumentsFilterProvider>
  );
}
