import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTranslate: () => void;
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange, onTranslate }) => {
  return (
    <div className="mb-8">
      <textarea
        className="w-full p-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={5}
        placeholder="Enter text to translate into sign language..."
        value={value}
        onChange={onChange}
      />
      <button
        className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-semibold transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={onTranslate}
      >
        Translate
      </button>
    </div>
  );
};

export default TextInput;

