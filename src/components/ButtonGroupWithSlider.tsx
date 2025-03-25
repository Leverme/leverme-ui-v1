// components/ButtonGroupWithSlider.tsx
import React from 'react';

interface Option {
  label: string;
  value: string;
}

interface ButtonGroupWithSliderProps {
  options: Option[];
  selectedValue?: string;
  onChange?: (value: string) => void;
  // 滑动选择框相关属性
  sliderMin: number;
  sliderMax: number;
  sliderValue: number;
  onSliderChange?: (value: number) => void;
}

const ButtonGroupWithSlider: React.FC<ButtonGroupWithSliderProps> = ({
  options,
  selectedValue,
  onChange,
  sliderMin,
  sliderMax,
  sliderValue,
  onSliderChange,
}) => {
  return (
    <div style={{ display: 'inline-block',width: '100%' }}>
      <div
        style={{
          display: 'inline-flex',
          border: '1px solid #ccc',
          borderRadius: '80px', 
          overflow: 'hidden',
          width: '100%'
        }}
      >
        {options.map((option, index) => {
          const isSelected = option.value === selectedValue;
          return (
            <button
              key={option.value}
              onClick={() => onChange && onChange(option.value)}
              style={{
                padding: '8px 16px',
                border: 'none',
                color: isSelected ? '#000' : ' #f0f0f0',
                backgroundColor: isSelected ? '#d9ff00' : 'transparent',
                cursor: 'pointer',
                flex: 1,
                borderRight: index < options.length - 1 ? '1px solid #ccc' : 'none',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: '2px' }}>
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={0.1} 
          value={sliderValue}
          onChange={(e) => onSliderChange && onSliderChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            WebkitAppearance: 'none',
            background: '#d9ff00',
            height: '4px',
            borderRadius: '2px',
            outline: 'none',
          }}
        />
       
      </div>
    </div>
  );
};

export default ButtonGroupWithSlider;
