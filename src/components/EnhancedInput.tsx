/**
 * Enhanced Input Component - Every input can award XP
 * This component automatically awards XP for user input and engagement
 */

import React, { useState, useEffect } from 'react';
import { useUniversalXP } from '../hooks/useUniversalXP';

interface EnhancedInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  xpReward?: number;
  xpSource?: string;
  actionType?: string;
  difficulty?: string;
  onInputXP?: number;
  onCompleteXP?: number;
  showXPGain?: boolean;
  minCharactersForXP?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  rows?: number; // for textarea
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  type = 'text',
  placeholder,
  value = '',
  onChange,
  xpReward = 0,
  xpSource = 'input_interaction',
  actionType = 'user_input',
  difficulty,
  onInputXP = 2,
  onCompleteXP = 10,
  showXPGain = false,
  minCharactersForXP = 5,
  className = '',
  disabled = false,
  required = false,
  maxLength,
  rows = 3,
}) => {
  const { addXP, calculateXPForAction } = useUniversalXP();
  const [inputValue, setInputValue] = useState(value);
  const [hasAwardedInputXP, setHasAwardedInputXP] = useState(false);
  const [hasAwardedCompleteXP, setHasAwardedCompleteXP] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [inputCount, setInputCount] = useState(0);

  // Sync with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }

    // Award XP for input interaction
    if (!hasAwardedInputXP && newValue.length >= minCharactersForXP) {
      const calculatedXP = onInputXP || calculateXPForAction('user_input', difficulty);
      
      if (calculatedXP > 0) {
        addXP(calculatedXP, `${xpSource}_input`, {
          showNotification: false,
          trackActivity: true,
        });
        
        setHasAwardedInputXP(true);
        setInputCount(prev => prev + 1);
        
        if (showXPGain) {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 1000);
        }
      }
    }

    // Award XP for completion
    if (!hasAwardedCompleteXP && newValue.length >= minCharactersForXP * 2) {
      const calculatedXP = onCompleteXP || calculateXPForAction('input_complete', difficulty);
      
      if (calculatedXP > 0) {
        addXP(calculatedXP, `${xpSource}_complete`, {
          showNotification: showXPGain,
          trackActivity: true,
        });
        
        setHasAwardedCompleteXP(true);
        
        if (showXPGain) {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 1500);
        }
      }
    }
  };

  // Calculate XP potential
  const inputXPPotential = onInputXP || calculateXPForAction('user_input', difficulty);
  const completeXPPotential = onCompleteXP || calculateXPForAction('input_complete', difficulty);
  const totalXPPotential = inputXPPotential + completeXPPotential;

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="relative">
      {/* XP Indicator */}
      {totalXPPotential > 0 && showXPGain && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            +{totalXPPotential} XP
          </div>
        </div>
      )}

      {/* Input Field */}
      <InputComponent
        type={type}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        rows={type === 'textarea' ? rows : undefined}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        } ${className}`}
      />

      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute top-0 right-0 mt-8 bg-green-500 text-white px-3 py-1 rounded-lg shadow-lg animate-bounce">
          <span className="text-sm font-bold">
            +{hasAwardedCompleteXP ? completeXPPotential : inputXPPotential} XP!
          </span>
        </div>
      )}

      {/* Engagement Stats */}
      {(hasAwardedInputXP || hasAwardedCompleteXP) && (
        <div className="mt-1 text-xs text-gray-500 flex justify-between">
          <span>
            {hasAwardedInputXP && '✓ Input XP awarded'}
            {hasAwardedCompleteXP && ' ✓ Completion XP awarded'}
          </span>
          <span>{inputCount} interactions</span>
        </div>
      )}

      {/* Progress Indicator */}
      {minCharactersForXP > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{inputValue.length} / {minCharactersForXP * 2}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ 
                width: `${Math.min((inputValue.length / (minCharactersForXP * 2)) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedInput;
