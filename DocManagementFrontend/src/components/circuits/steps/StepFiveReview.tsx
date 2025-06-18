
import { useCircuitForm } from '@/context/CircuitFormContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StepFiveReview() {
  const { formData, prevStep, submitForm, isSubmitting } = useCircuitForm();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const success = await submitForm();
    if (success) {
      navigate('/circuits');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Review Circuit Information</h3>
      
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-500">Title</dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">{formData.title}</dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-500">Description</dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                {formData.descriptif || 'No description provided'}
              </dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-500">Status</dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                <Badge variant={formData.isActive ? "default" : "secondary"}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </dd>
            </div>
            <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-500">Flow Type</dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                <Badge variant="outline">
                  {formData.hasOrderedFlow ? 'Sequential' : 'Parallel'}
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      {formData.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Circuit Steps ({formData.steps.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.steps.map((step, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">
                      {step.title}
                    </div>
                    <Badge variant="outline">Order: {step.orderIndex}</Badge>
                  </div>
                  {step.descriptif && (
                    <p className="text-sm text-gray-500 mt-1">{step.descriptif}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between pt-6">
        <Button 
          type="button" 
          variant="outline"
          onClick={prevStep}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        <Button 
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Circuit...' : 'Create Circuit'}
        </Button>
      </div>
    </div>
  );
}
