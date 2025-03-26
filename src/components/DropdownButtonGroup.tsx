// components/DropdownButtonGroup.tsx
import React, { useState, useRef, useEffect } from 'react';

interface Option {
  label: string;
  value: string;
}

interface DropdownButtonGroupProps {
  widths : string,
  options: Option[];
  selectedValue?: string;
  onChange?: (value: string) => void;
}

const DropdownButtonGroup: React.FC<DropdownButtonGroupProps> = ({
  widths,
  options,
  selectedValue,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === selectedValue);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', width: widths }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '8px 16px',
          border: '1px solid #ccc',
          borderRadius: '80px',
          background: '#d9ff00',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
           fontSize:"1rem",
           color:"#000"
        }}
      >
        <span>{selectedOption ? selectedOption.label : 'Select Token'}</span>
        <span style={{ marginLeft: '8px' }}>▼</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 10,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            marginTop: '4px',
            overflow: 'hidden',
           
          }}
        >
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange && onChange(option.value);
                setOpen(false);
              }}
              style={{
                width: '100%',
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownButtonGroup;
