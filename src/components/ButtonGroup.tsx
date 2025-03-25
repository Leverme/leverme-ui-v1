import React from 'react';

interface Option {
  label: string;
  value: string;
}

interface ButtonGroupProps {
  options: Option[];
  selectedValue?: string;
  onChange?: (value: string) => void;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ options, selectedValue, onChange }) => {
  return (
    <div className="button-group">
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <button
            key={option.value}
            onClick={() => onChange && onChange(option.value)}
            className={isSelected ? "selected" : ""}
          >
            {option.label}
          </button>
        );
      })}
      <style jsx>{`
        .button-group {
          display: inline-flex;
          border: 1px solid #ccc;
          border-radius: 80px;
          overflow: hidden;
        }
        button {
          font-size: 1.5rem;
          padding: 8px 16px;
          border: none;
          background-color: transparent;
          color: #f0f0f0;
          cursor: pointer;
          flex: 1;
          transition: background-color 0.2s ease-in-out;
        }
        button:hover {
          background-color: #f0f0f0;
        }
        button.selected {
          background-color:#d9ff00;
          color: #000;
        }
        button:not(:last-child) {
          border-right: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
};

export default ButtonGroup;
