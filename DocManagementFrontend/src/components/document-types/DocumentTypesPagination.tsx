
import { Button } from '@/components/ui/button';

interface DocumentTypesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const DocumentTypesPagination = ({
  currentPage,
  totalPages,
  onPageChange
}: DocumentTypesPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center py-3 border-t border-blue-900/20">
      <nav aria-label="Page navigation">
        <ul className="flex items-center gap-1">
          <li>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 px-2 bg-blue-900/20 border-blue-800/40 text-blue-200 hover:bg-blue-800/30" 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
          </li>
          {Array.from({ length: totalPages }).map((_, index) => (
            <li key={index}>
              <Button 
                variant={currentPage === index + 1 ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 ${currentPage === index + 1 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-blue-900/20 border-blue-800/40 text-blue-200 hover:bg-blue-800/30"
                }`}
                onClick={() => onPageChange(index + 1)}
              >
                {index + 1}
              </Button>
            </li>
          ))}
          <li>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 px-2 bg-blue-900/20 border-blue-800/40 text-blue-200 hover:bg-blue-800/30" 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DocumentTypesPagination;
