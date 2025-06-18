
import { useNavigate } from 'react-router-dom';
import { CircleCheck, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CircuitNavigation() {
  const navigate = useNavigate();
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/circuits')}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GitBranch className="mr-2 h-5 w-5" /> Circuit Management
          </CardTitle>
          <CardDescription>
            Create and manage document workflow circuits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Define approval processes and workflows for your documents
          </p>
          <Button variant="ghost" className="mt-4 w-full">Go to Circuits</Button>
        </CardContent>
      </Card>
      
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/pending-approvals')}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CircleCheck className="mr-2 h-5 w-5" /> Pending Approvals
          </CardTitle>
          <CardDescription>
            Documents waiting for your approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Review and approve documents assigned to you or your role
          </p>
          <Button variant="ghost" className="mt-4 w-full">View Pending Approvals</Button>
        </CardContent>
      </Card>
    </div>
  );
}
