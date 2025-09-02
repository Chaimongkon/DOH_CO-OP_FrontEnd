"use client";

import { useState, useCallback } from "react";

export interface FormValidationRule<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown, formData: T) => string | null;
}

export type FormValidationSchema<T> = {
  [K in keyof T]?: FormValidationRule<T>;
};

export interface UseFormStateOptions<T> {
  initialData: T;
  validationSchema?: FormValidationSchema<T>;
  validateOnChange?: boolean;
  clearErrorOnChange?: boolean;
  clearApiErrorOnChange?: boolean;
}

export interface UseFormStateReturn<T, E = Record<keyof T, string | undefined>> {
  formData: T;
  errors: E;
  apiError: string | null;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: <K extends keyof E>(field: K, error: string | undefined) => void;
  setErrors: (errors: Partial<E>) => void;
  setApiError: (error: string | null) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  handleChange: <K extends keyof T>(field: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  validateField: <K extends keyof T>(field: K) => string | null;
  validateForm: () => boolean;
  resetForm: () => void;
  resetErrors: () => void;
}

/**
 * Custom hook for managing form state with validation and error handling
 * Eliminates repetitive form state management code across components
 * 
 * @param options - Configuration options for form state management
 * @returns Object containing form state and utility functions
 * 
 * @example
 * const {
 *   formData,
 *   errors,
 *   apiError,
 *   isSubmitting,
 *   handleChange,
 *   validateForm,
 *   setSubmitting,
 *   setApiError
 * } = useFormState({
 *   initialData: { name: '', email: '' },
 *   validationSchema: {
 *     name: { required: true, minLength: 2 },
 *     email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
 *   }
 * });
 */
export function useFormState<T extends Record<string, unknown>, E = Record<keyof T, string | undefined>>(
  options: UseFormStateOptions<T>
): UseFormStateReturn<T, E> {
  const {
    initialData,
    validationSchema = {},
    validateOnChange = false,
    clearErrorOnChange = true,
    clearApiErrorOnChange = true,
  } = options;

  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<E>({} as E);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Check if form is valid (no errors and required fields are filled)
  const isValid = Object.keys(errors as Record<string, unknown>).length === 0 && 
    Object.entries(validationSchema || {}).every(([field, rules]) => {
      const rule = rules as FormValidationRule<T>;
      if (rule?.required) {
        const value = formData[field as keyof T];
        return value !== "" && value !== null && value !== undefined;
      }
      return true;
    });

  const validateField = useCallback(<K extends keyof T>(field: K): string | null => {
    if (!validationSchema || Object.keys(validationSchema).length === 0) return null;
    
    const value = formData[field];
    const rules = (validationSchema as FormValidationSchema<T>)[field];

    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${String(field)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return null;

    // String validations
    if (typeof value === 'string') {
      // Min length validation
      if (rules.minLength && value.length < rules.minLength) {
        return `${String(field)} must be at least ${rules.minLength} characters`;
      }

      // Max length validation
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${String(field)} must be no more than ${rules.maxLength} characters`;
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        return `${String(field)} format is invalid`;
      }
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value, formData);
    }

    return null;
  }, [formData, validationSchema]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<E> = {};
    let hasErrors = false;

    // Validate all fields with rules
    Object.keys(validationSchema).forEach((field) => {
      const error = validateField(field as keyof T);
      if (error) {
        newErrors[field as keyof E] = error as E[keyof E];
        hasErrors = true;
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return !hasErrors;
  }, [validateField, validationSchema]);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);

    // Clear field error if configured
    if (clearErrorOnChange && errors[String(field) as keyof E]) {
      setErrors(prev => ({ ...prev, [field]: undefined } as E));
    }

    // Clear API error if configured
    if (clearApiErrorOnChange && apiError) {
      setApiError(null);
    }

    // Validate field on change if configured
    if (validateOnChange) {
      const error = validateField(field);
      setErrors(prev => ({ ...prev, [field]: error } as E));
    }
  }, [clearErrorOnChange, clearApiErrorOnChange, validateOnChange, errors, apiError, validateField]);

  const setValues = useCallback((values: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...values }));
    setIsDirty(true);

    if (clearApiErrorOnChange && apiError) {
      setApiError(null);
    }
  }, [clearApiErrorOnChange, apiError]);

  const setError = useCallback(<K extends keyof E>(field: K, error: string | undefined) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setErrorsCallback = useCallback((newErrors: Partial<E>) => {
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, []);

  const handleChange = useCallback(<K extends keyof T>(field: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value as T[K];
    setValue(field, value);
  }, [setValue]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({} as E);
    setApiError(null);
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialData]);

  const resetErrors = useCallback(() => {
    setErrors({} as E);
    setApiError(null);
  }, []);

  const setSubmittingCallback = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const setApiErrorCallback = useCallback((error: string | null) => {
    setApiError(error);
  }, []);

  return {
    formData,
    errors,
    apiError,
    isSubmitting,
    isDirty,
    isValid,
    setValue,
    setValues,
    setError,
    setErrors: setErrorsCallback,
    setApiError: setApiErrorCallback,
    setSubmitting: setSubmittingCallback,
    handleChange,
    validateField,
    validateForm,
    resetForm,
    resetErrors,
  };
}

/**
 * Simplified version for basic forms without complex validation
 * 
 * @example
 * const { formData, handleChange, isSubmitting, setSubmitting } = useSimpleFormState({
 *   name: '',
 *   email: ''
 * });
 */
export function useSimpleFormState<T extends Record<string, unknown>>(
  initialData: T
) {
  const result = useFormState({
    initialData,
    validateOnChange: false,
    clearErrorOnChange: true,
  });

  // Return everything except validation-related functions
  return {
    formData: result.formData,
    errors: result.errors,
    apiError: result.apiError,
    isSubmitting: result.isSubmitting,
    isDirty: result.isDirty,
    setValue: result.setValue,
    setValues: result.setValues,
    setError: result.setError,
    setErrors: result.setErrors,
    setApiError: result.setApiError,
    setSubmitting: result.setSubmitting,
    handleChange: result.handleChange,
    resetForm: result.resetForm,
    resetErrors: result.resetErrors,
  };
}

export default useFormState;