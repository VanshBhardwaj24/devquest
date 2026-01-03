/**
 * Enhanced Navigation Dropdown Subcomponent
 * Provides interactive dropdown menus with XP rewards and engagement tracking
 */

import React, { useState, useRef, useEffect } from 'react';
import { useUniversalXP } from '../../hooks/useUniversalXP';

interface NavigationDropdownProps {
  title: string;
  items: Array<{
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
    action?: () => void;
    xpReward?: number;
    xpSource?: string;
    showXPGain?: boolean;
    disabled?: boolean;
  }>;
  trigger?: React.ReactNode;
  position?: 'left' | 'right' | 'center';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animation?: boolean;
}

export const NavigationDropdown: React.FC<NavigationDropdownProps> = ({
  title,
  items,
  trigger,
  position = 'left',
  size = 'md',
  className = '',
  animation = true,
}) => {
  const { addXP, updateStreak } = useUniversalXP();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const handleItemClick = (item: typeof items[0]) => {
    // Award XP for dropdown interaction
    if (item.xpReward && item.xpReward > 0) {
      addXP(item.xpReward, `${item.xpSource || 'dropdown'}_${item.label.toLowerCase().replace(/\s+/g, '_')}`, {
        showNotification: item.showXPGain,
        trackActivity: true,
      });
      
      updateStreak('general');
      
      setInteractionCount(prev => prev + 1);
      setSelectedItem(item.label);
      
      if (item.showXPGain) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 1500);
      }
      
      // Execute action if provided
      if (item.action) {
        item.action();
      }
    }
    
    setIsOpen(false);
  };

  const handleMouseEnter = (itemLabel: string) => {
    setHoveredItem(itemLabel);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const sizeClasses = {
    sm: 'w-48',
    md: 'w-56',
    l: 'w-64',
  };

  const positionClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${sizeClasses[size]} ${animation ? 'hover:shadow-lg' : ''}`}
      >
        {trigger || (
          <>
            <span className="text-gray-700">{title}</span>
            <span className="text-gray-400">▼</span>
          </>
        )}
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg ${sizeClasses[size]} ${positionClasses[position]} overflow-hidden`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <div className="text-xs text-gray-500">
              {interactionCount} interactions
            </div>
          </div>
          
          {/* Items */}
          <div className="py-2">
            {items.map((item, index) => (
              <div
                key={item.label}
                className={`px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                  hoveredItem === item.label ? 'bg-indigo-50' : ''
                }`}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex items-center space-x-3">
                  {/* Icon */}
                  {item.icon && (
                    <span className="text-lg">{item.icon}</span>
                  )}
                  
                  {/* Label */}
                  <span className="flex-1 text-sm text-gray-700">{item.label}</span>
                  
                  {/* Badge */}
                  {item.badge && (
                    <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                
                {/* XP Indicator */}
                {item.xpReward && item.xpReward > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    +{item.xpReward} XP
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              {items.length} items available
            </div>
          </div>
        </div>
      )}
      
      {/* XP Reward Animation */}
      {showReward && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce z-50">
          <span className="font-bold">+{items.find(item => selectedItem === item.label)?.xpReward || 0} XP!</span>
        </div>
      )}
      
      {/* Engagement Indicator */}
      {interactionCount > 0 && (
        <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
          {interactionCount}
        </div>
      )}
      
      {/* Hover Effect */}
      {isOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-10 pointer-events-none" />
      )}
    </div>
  );
};

export default NavigationDropdown;
