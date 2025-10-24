import React from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';

interface AccessibleFormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'textarea' | 'select';
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
  description?: string;
  ariaDescribedBy?: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options = [],
  disabled = false,
  className,
  description,
  ariaDescribedBy,
}) => {
  const fieldId = `${name}-field`;
  const errorId = `${name}-error`;
  const descriptionId = `${name}-description`;
  
  const describedBy = [
    error && errorId,
    description && descriptionId,
    ariaDescribedBy,
  ].filter(Boolean).join(' ');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  };

  const handleSelectChange = (value: string) => {
    onChange(value);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={fieldId} 
        className={cn(error && 'text-red-500')}
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </Label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {type === 'textarea' ? (
        <Textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={cn(error && 'border-red-500 focus:border-red-500')}
        />
      ) : type === 'select' ? (
        <Select 
          value={value as string} 
          onValueChange={handleSelectChange} 
          disabled={disabled}
        >
          <SelectTrigger 
            id={fieldId}
            aria-invalid={!!error}
            aria-describedby={describedBy || undefined}
            className={cn(error && 'border-red-500 focus:border-red-500')}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={cn(error && 'border-red-500 focus:border-red-500')}
        />
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
