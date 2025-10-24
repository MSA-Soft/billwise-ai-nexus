import { useState, useCallback } from 'react';
import { z } from 'zod';

interface ValidationError {
  field: string;
  message: string;
}

interface UseFormValidationReturn<T> {
  errors: ValidationError[];
  validate: (data: T) => boolean;
  clearErrors: () => void;
  setError: (field: string, message: string) => void;
  hasErrors: boolean;
}

export const useFormValidation = <T>(
  schema: z.ZodSchema<T>
): UseFormValidationReturn<T> => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validate = useCallback((data: T): boolean => {
    try {
      schema.parse(data);
      setErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        setErrors(validationErrors);
        return false;
      }
      setErrors([{ field: 'general', message: 'Validation failed' }]);
      return false;
    }
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => [
      ...prev.filter(err => err.field !== field),
      { field, message }
    ]);
  }, []);

  return {
    errors,
    validate,
    clearErrors,
    setError,
    hasErrors: errors.length > 0,
  };
};
