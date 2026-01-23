import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-gray-600">
        {label}
      </label>
      <input
        id={id}
        className={`px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 cursor-not-allowed ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;

