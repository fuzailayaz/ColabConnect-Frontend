// src/components/ui/MultiSelect.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string; // Add this line
}

export default function MultiSelect({ options, selected, onChange, placeholder = 'Select items', className = '' }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (optionValue: string) => {
    if (selected.includes(optionValue)) {
      onChange(selected.filter(item => item !== optionValue));
    } else {
      onChange([...selected, optionValue]);
    }
  };

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

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full px-4 py-2 border border-gray-100 dark:border-gray-800 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] cursor-pointer flex flex-wrap gap-2 min-h-[42px] ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
        ) : (
          selected.map(item => {
            const selectedOption = options.find(opt => opt.value === item); // Find the full option object
            return selectedOption ? (
              <span
                key={item}
                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center"
              >
                {selectedOption.label} {/* Display the label */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(item);
                  }}
                  className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ) : null;
          })
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gradient-to-br from-white to-gray-50 dark:from-[#121826] dark:to-[#1a2235] border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-1 text-sm border border-gray-100 dark:border-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-[#121826]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1e2640] flex items-center ${
                    selected.includes(option.value) ? 'bg-blue-50 dark:bg-[#131e2e]' : ''
                  }`}
                  onClick={() => toggleOption(option.value)}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    readOnly
                    className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                  />
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}