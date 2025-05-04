// IOS 스타일 Toggle 버튼
// import { useState } from 'react';

type ToggleProps = {
  isOn: boolean;
  onToggle: (isOn: boolean) => void;
};

export default function Toggle({ isOn, onToggle }: ToggleProps) {
  return (
    <button
      onClick={() => onToggle(!isOn)}
      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300
        ${isOn ? 'bg-primary-500' : 'bg-gray-300'}`}
    >
      <span
        className={`block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300
          ${isOn ? 'translate-x-6' : 'translate-x-0'}`}
      />
    </button>
  );
}
