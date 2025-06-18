import { Badge } from '@/components/ui/badge';

interface DocumentStatusBadgeProps {
  status: number;
}

const DocumentStatusBadge = ({ status }: DocumentStatusBadgeProps) => {
  switch(status) {
    case 0:
      return <Badge className="bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border-amber-500/30">Draft</Badge>;
    case 1:
      return <Badge className="bg-green-500/20 text-green-200 hover:bg-green-500/30 border-green-500/30">InProgress</Badge>;
    case 2:
      return <Badge className="bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 border-purple-500/30">Archived</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export default DocumentStatusBadge;
