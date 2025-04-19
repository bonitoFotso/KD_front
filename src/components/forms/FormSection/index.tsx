import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  className = 'space-y-4' 
}) => {
  return (
    <div className={className}>
      <h3 className="text-lg font-medium">{title}</h3>
      {children}
    </div>
  );
};