import React from 'react';

interface UserPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const UserPromptInput: React.FC<UserPromptInputProps> = ({
  value,
  onChange,
  placeholder = "e.g., Analyze the relationship between education and income using linear regression",
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">
        Analysis Task
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      <p className="text-xs text-gray-500">
        Describe what you want to analyze or discover in the data
      </p>
    </div>
  );
};
