import { useState } from 'react';
import type { HoseDetailsFormProps, HoseCondition } from './types';

const CONDITIONS: HoseCondition[] = ['Good', 'Fair', 'Poor', 'Unknown'];

export const HoseDetailsForm: React.FC<HoseDetailsFormProps> = ({
  condition,
  length,
  notes,
  onChange,
  onError,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleConditionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCondition = e.target.value as HoseCondition;
    onChange({ condition: newCondition, length, notes });
    setErrors({ ...errors, condition: '' });
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;

    if (value < 0) {
      const err = 'Length must be positive';
      setErrors({ ...errors, length: err });
      onError?.(err);
      return;
    }

    onChange({ condition, length: value, notes });
    setErrors({ ...errors, length: '' });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ condition, length, notes: e.target.value });
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-lg font-semibold mb-4" style={{ color: '#06445b' }}>
        Hose Details
      </h3>

      {/* Condition Dropdown */}
      <div className="mb-4">
        <label className="block text-base font-semibold mb-2" style={{ color: '#06445b' }}>
          Condition
        </label>
        <select
          value={condition}
          onChange={handleConditionChange}
          className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
        >
          {CONDITIONS.map((cond) => (
            <option key={cond} value={cond}>
              {cond}
            </option>
          ))}
        </select>
      </div>

      {/* Length Input */}
      <div className="mb-4">
        <label className="block text-base font-semibold mb-2" style={{ color: '#06445b' }}>
          Length (feet)
        </label>
        <input
          type="number"
          value={length}
          onChange={handleLengthChange}
          placeholder="e.g., 50"
          className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400"
          min="0"
          step="1"
        />
        {errors.length && <p className="text-sm mt-1" style={{ color: '#ff6b35' }}>{errors.length}</p>}
      </div>

      {/* Notes Textarea */}
      <div className="mb-4">
        <label className="block text-base font-semibold mb-2" style={{ color: '#06445b' }}>
          Additional Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="e.g., Red handle, damaged at one end"
          className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 resize-none"
          rows={3}
        />
      </div>

      {/* Summary */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: '#f0f8fb', borderLeft: '4px solid #fbb12a' }}
      >
        <p className="text-sm font-semibold mb-1">Summary:</p>
        <p className="text-sm text-gray-700">
          {length > 0 ? `${length} ft, ` : 'No length specified, '} 
          {condition} condition
          {notes && `, ${notes.substring(0, 50)}...`}
        </p>
      </div>
    </div>
  );
};
