
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FormErrorProps {
  message: string | null | undefined;
  className?: string;
  showIcon?: boolean;
}

export function FormError({ message, className = '', showIcon = true }: FormErrorProps) {
  if (!message) return null;
  
  return (
    <div className={`w-full bg-red-900/20 border border-red-900/30 rounded-md p-3 mb-4 flex items-start ${className}`}>
      {showIcon && <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />}
      <div className="text-red-500 text-sm font-medium">{message}</div>
    </div>
  );
}
