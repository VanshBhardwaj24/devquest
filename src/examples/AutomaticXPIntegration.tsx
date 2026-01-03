/**
 * Complete Automatic XP Integration Example
 * Shows how to make EVERY component use XP logic automatically
 */

import React from 'react';
import { AutoXPProvider, useAutoXP, withAutoXP } from '../components/AutoXPProvider';
import { useUniversalXP } from '../hooks/useUniversalXP';

// Regular component - will automatically get XP logic when wrapped
function RegularButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {children}
    </button>
  );
}

// Enhanced component with custom XP logic
function EnhancedCard({ title, content }: { title: string; content: string }) {
  const { awardAutoXP, trackCustomAction } = useAutoXPHook({
    defaultXPReward: 10,
    showGlobalXPGain: true,
  });
  
  const handleCardClick = () => {
    // Custom XP action
    trackCustomAction('card_interaction', 'Medium', 2);
  };
  
  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg cursor-pointer transition-all"
    >
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <p className="text-gray-600">{content}</p>
    </div>
  );
}

// Component using HOC for automatic XP
const AutoXPButton = withAutoXP(RegularButton, {
  defaultXPReward: 15,
  showGlobalXPGain: true,
});

// Form component with automatic XP
function AutoXPForm() {
  const { awardAutoXP } = useAutoXPHook({
    defaultXPReward: 25,
    showGlobalXPGain: false,
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission automatically gets XP from AutoXPProvider
    console.log('Form submitted!');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        type="text" 
        placeholder="Enter your name"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      />
      <textarea 
        placeholder="Enter your message"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        rows={3}
      />
      <button 
        type="submit"
        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
      >
        Submit
      </button>
    </form>
  );
}

// Navigation component with automatic XP
function AutoXPNavigation() {
  const { awardAutoXP } = useAutoXPHook({
    defaultXPReward: 5,
    showGlobalXPGain: true,
  });
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Profile', path: '/profile' },
  ];
  
  return (
    <nav className="bg-gray-100 p-4 rounded-lg">
      <ul className="flex space-x-4">
        {navItems.map((item, index) => (
          <li key={item.name}>
            <a 
              href={item.path}
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => awardAutoXP(1.5, `nav_${item.name.toLowerCase()}`)}
            >
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// List component with automatic XP
function AutoXPList({ items }: { items: string[] }) {
  const { awardAutoXP } = useAutoXPHook({
    defaultXPReward: 3,
    showGlobalXPGain: false,
  });
  
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li 
          key={item}
          onClick={() => awardAutoXP(1, `list_item_${index}`)}
          className="p-2 bg-white rounded shadow hover:shadow-md cursor-pointer"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

// Modal component with automatic XP
function AutoXPModal({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const { awardAutoXP } = useAutoXPHook({
    defaultXPReward: 10,
    showGlobalXPGain: true,
  });
  
  useEffect(() => {
    if (isOpen) {
      awardAutoXP(2, 'modal_open');
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Search component with automatic XP
function AutoXPSearch() {
  const { awardAutoXP } = useAutoXPHook({
    defaultXPReward: 2,
    showGlobalXPGain: false,
  });
  
  const handleSearch = (query: string) => {
    if (query.length > 2) {
      awardAutoXP(1, 'search_performed');
    }
  };
  
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

// File upload component with automatic XP
function AutoXPFileUpload() {
  const { awardAutoXP } = useAutoXPHook({
    defaultXPReward: 15,
    showGlobalXPGain: true,
  });
  
  const handleFileUpload = (file: File) => {
    if (file) {
      const sizeXP = Math.min(Math.floor(file.size / 10000), 50); // 1 XP per 10KB, max 50 XP
      awardAutoXP(sizeXP, 'file_upload');
    }
  };
  
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className="hidden"
      />
      <div className="text-center">
        <div className="text-4xl mb-2">📁</div>
        <p className="text-gray-600">Click to upload a file</p>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Choose File
        </button>
      </div>
    </div>
  );
}

// Main app component showing complete integration
export function AutomaticXPIntegrationExample() {
  const { isEnabled, globalXPConfig, updateConfig } = useAutoXP();
  
  return (
    <AutoXPProvider defaultConfig={{ showGlobalXPGain: true }}>
      <div className="min-h-screen bg-gray-50 p-8">
        {/* Header with XP controls */}
        <header className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Automatic XP Integration</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Auto XP: <span className={`font-bold ${isEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {isEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <button
                onClick={() => isEnabled ? updateConfig({ showGlobalXPGain: !globalXPConfig.showGlobalXPGain }) : updateConfig({ showGlobalXPGain: true })}
                className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
              >
                {globalXPConfig.showGlobalXPGain ? 'Hide XP' : 'Show XP'}
              </button>
              <button
                onClick={isEnabled ? updateConfig({ defaultXPReward: globalXPConfig.defaultXPReward + 5 }) : updateConfig({ defaultXPReward: 5 })}
                className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
              >
                XP: {globalXPConfig.defaultXPReward}
              </button>
            </div>
          </div>
        </header>

        {/* Grid of components with automatic XP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Regular Button with HOC */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">AutoXP Button (HOC)</h3>
            <AutoXPButton onClick={() => console.log('Button clicked!')}>
              Click Me (Auto XP)
            </AutoXPButton>
            <p className="text-sm text-gray-600 mt-2">
              Automatically gets {globalXPConfig.defaultXPReward + 5} XP per click
            </p>
          </div>

          {/* Enhanced Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Enhanced Card</h3>
            <EnhancedCard 
              title="Interactive Card"
              content="This card automatically awards XP when clicked. Try it!"
            />
            <p className="text-sm text-gray-600 mt-2">
              Custom XP logic with visual feedback
            </p>
          </div>

          {/* AutoXP Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">AutoXP Form</h3>
            <AutoXPForm />
            <p className="text-sm text-gray-600 mt-2">
              {globalXPConfig.defaultXPReward} XP for submission
            </p>
          </div>

          {/* AutoXP Navigation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">AutoXP Navigation</h3>
            <AutoXPNavigation />
            <p className="text-sm text-gray-600 mt-2">
              {globalXPConfig.defaultXPReward} XP per navigation
            </p>
          </div>

          {/* AutoXP List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">AutoXP List</h3>
            <AutoXPList items={['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']} />
            <p className="text-sm text-gray-600 mt-2">
              {globalXPConfig.defaultXPReward - 2} XP per item
            </p>
          </div>

          {/* AutoXP Modal */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">AutoXP Modal</h3>
            <button
              onClick={() => {/* Modal opening logic */}}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Open Modal
            </button>
            <AutoXPModal
              isOpen={false}
              onClose={() => {/* Modal closing logic */}}
              title="AutoXP Modal"
              children={<p>This modal automatically awards XP when opened!</p>}
            />
            <p className="text-sm text-gray-600 mt-2">
              {globalXPConfig.defaultXPReward} XP for opening
            </p>
          </div>

          {/* AutoXP Search */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">AutoXP Search</h3>
            <AutoXPSearch />
            <p className="text-sm text-gray-600 mt-2">
              1 XP per search (3+ characters)
            </p>
          </div>

          {/* AutoXP File Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">AutoXP File Upload</h3>
            <AutoXPFileUpload />
            <p className="text-sm text-gray-600 mt-2">
              Up to 50 XP based on file size
            </p>
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">AutoXP Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-indigo-600">
                {globalXPConfig.defaultXPReward}
              </p>
              <p className="text-sm text-gray-600">Default XP</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600">
                {globalXPConfig.showGlobalXPGain ? 'ON' : 'OFF'}
              </p>
              <p className="text-sm text-gray-600">Show XP</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-purple-600">
                {globalXPConfig.trackAllInteractions ? 'ON' : 'OFF'}
              </p>
              <p className="text-sm text-gray-600">Track All</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-600">
                {globalXPConfig.trackPageViews ? 'ON' : 'OFF'}
              </p>
              <p className="text-sm text-gray-600">Track Pages</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">How It Works</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <strong>🎯 Automatic XP:</strong> Every component wrapped with AutoXP automatically awards XP for interactions
            </div>
            <div>
              <strong>🔧 HOC Integration:</strong> Use `withAutoXP()` to add XP logic to any component without modification
            </div>
            <div>
              <strong>🪝 Hook Integration:</strong> Use `useAutoXPHook()` for custom XP logic in components
            </div>
            <div>
              <strong>🌍 Global Tracking:</strong> The provider tracks all interactions globally when enabled
            </div>
            <div>
              <strong>⚡ Visual Feedback:</strong> XP gains are shown when enabled in the config
            </div>
            <div>
              <strong>🎮 Streak Updates:</strong> All interactions automatically update streaks
            </div>
          </div>
        </div>
      </div>
    </AutoXPProvider>
  );
}

export default AutomaticXPIntegrationExample;
