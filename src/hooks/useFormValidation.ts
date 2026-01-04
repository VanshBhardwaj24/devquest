/**
 * Form Validation Hook
 * Provides comprehensive form validation with real-time feedback
 */

import { useState, useCallback, useMemo } from 'react';
import { validateInput } from '../utils/errorHandlingEnhanced';
import { logger } from '../utils/logger';

export type ValidationRule = {
    type: 'string' | 'number' | 'boolean' | 'email';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => { valid: boolean; error?: string };
};

export type ValidationRules<T> = {
    [K in keyof T]?: ValidationRule;
};

export type ValidationErrors<T> = {
    [K in keyof T]?: string;
};

export type TouchedFields<T> = {
    [K in keyof T]?: boolean;
};

interface UseFormValidationResult<T> {
    values: T;
    errors: ValidationErrors<T>;
    touched: TouchedFields<T>;
    isValid: boolean;
    isDirty: boolean;
    setValue: <K extends keyof T>(field: K, value: T[K]) => void;
    setValues: (values: Partial<T>) => void;
    setError: <K extends keyof T>(field: K, error: string) => void;
    clearError: <K extends keyof T>(field: K) => void;
    setTouched: <K extends keyof T>(field: K, touched: boolean) => void;
    validateField: <K extends keyof T>(field: K) => boolean;
    validateAll: () => boolean;
    reset: () => void;
    handleChange: <K extends keyof T>(field: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleBlur: <K extends keyof T>(field: K) => () => void;
    getFieldProps: <K extends keyof T>(field: K) => {
        value: T[K];
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
        onBlur: () => void;
        error: string | undefined;
        touched: boolean;
    };
}

/**
 * Comprehensive form validation hook
 */
export function useFormValidation<T extends Record<string, unknown>>(
    initialValues: T,
    rules: ValidationRules<T>,
    options: {
        validateOnChange?: boolean;
        validateOnBlur?: boolean;
        context?: string;
    } = {}
): UseFormValidationResult<T> {
    const {
        validateOnChange = true,
        validateOnBlur = true,
        context = 'Form'
    } = options;

    const [values, setValuesState] = useState<T>(initialValues);
    const [errors, setErrors] = useState<ValidationErrors<T>>({});
    const [touched, setTouchedState] = useState<TouchedFields<T>>({});

    // Check if form is dirty
    const isDirty = useMemo(() => {
        return Object.keys(values).some(
            key => values[key as keyof T] !== initialValues[key as keyof T]
        );
    }, [values, initialValues]);

    // Check if form is valid
    const isValid = useMemo(() => {
        return Object.keys(errors).length === 0;
    }, [errors]);

    /**
     * Validate a single field
     */
    const validateField = useCallback(<K extends keyof T>(field: K): boolean => {
        const rule = rules[field];
        if (!rule) return true;

        const value = values[field];

        // Use custom validation if provided
        if (rule.custom) {
            const result = rule.custom(value);
            if (!result.valid) {
                setErrors(prev => ({ ...prev, [field]: result.error || 'Invalid value' }));
                return false;
            }
        } else {
            // Use built-in validation
            const result = validateInput(value, rule.type, {
                required: rule.required,
                min: rule.min,
                max: rule.max,
                pattern: rule.pattern,
            });

            if (!result.valid) {
                setErrors(prev => ({ ...prev, [field]: result.error }));
                return false;
            }
        }

        // Clear error if valid
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });

        return true;
    }, [values, rules]);

    /**
     * Validate all fields
     */
    const validateAll = useCallback((): boolean => {
        let allValid = true;
        const newErrors: ValidationErrors<T> = {};

        Object.keys(rules).forEach(key => {
            const field = key as keyof T;
            const rule = rules[field];
            if (!rule) return;

            const value = values[field];

            // Use custom validation if provided
            if (rule.custom) {
                const result = rule.custom(value);
                if (!result.valid) {
                    newErrors[field] = result.error || 'Invalid value';
                    allValid = false;
                }
            } else {
                // Use built-in validation
                const result = validateInput(value, rule.type, {
                    required: rule.required,
                    min: rule.min,
                    max: rule.max,
                    pattern: rule.pattern,
                });

                if (!result.valid) {
                    newErrors[field] = result.error;
                    allValid = false;
                }
            }
        });

        setErrors(newErrors);

        if (!allValid) {
            logger.warn('Form validation failed', context, { errors: newErrors });
        }

        return allValid;
    }, [values, rules, context]);

    /**
     * Set a single field value
     */
    const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
        setValuesState(prev => ({ ...prev, [field]: value }));

        if (validateOnChange) {
            // Validate after state update
            setTimeout(() => validateField(field), 0);
        }
    }, [validateOnChange, validateField]);

    /**
     * Set multiple field values
     */
    const setValues = useCallback((newValues: Partial<T>) => {
        setValuesState(prev => ({ ...prev, ...newValues }));

        if (validateOnChange) {
            setTimeout(() => validateAll(), 0);
        }
    }, [validateOnChange, validateAll]);

    /**
     * Set field error
     */
    const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
        setErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    /**
     * Clear field error
     */
    const clearError = useCallback(<K extends keyof T>(field: K) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    /**
     * Set field touched state
     */
    const setTouched = useCallback(<K extends keyof T>(field: K, isTouched: boolean) => {
        setTouchedState(prev => ({ ...prev, [field]: isTouched }));
    }, []);

    /**
     * Handle input change
     */
    const handleChange = useCallback(<K extends keyof T>(field: K) => {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : e.target.value;

            setValue(field, value as T[K]);
        };
    }, [setValue]);

    /**
     * Handle input blur
     */
    const handleBlur = useCallback(<K extends keyof T>(field: K) => {
        return () => {
            setTouched(field, true);

            if (validateOnBlur) {
                validateField(field);
            }
        };
    }, [setTouched, validateOnBlur, validateField]);

    /**
     * Get all props for a field
     */
    const getFieldProps = useCallback(<K extends keyof T>(field: K) => {
        return {
            value: values[field],
            onChange: handleChange(field),
            onBlur: handleBlur(field),
            error: errors[field],
            touched: touched[field] || false,
        };
    }, [values, errors, touched, handleChange, handleBlur]);

    /**
     * Reset form
     */
    const reset = useCallback(() => {
        setValuesState(initialValues);
        setErrors({});
        setTouchedState({});
        logger.debug('Form reset', context);
    }, [initialValues, context]);

    return {
        values,
        errors,
        touched,
        isValid,
        isDirty,
        setValue,
        setValues,
        setError,
        clearError,
        setTouched,
        validateField,
        validateAll,
        reset,
        handleChange,
        handleBlur,
        getFieldProps,
    };
}
