import type { HoseDetailsFormProps, HoseCondition } from './types';

const CONDITIONS: HoseCondition[] = ['Good', 'Fair', 'Poor', 'Unknown'];

const CONDITION_HINTS: Record<HoseCondition, string> = {
  Good: 'Usable, minimal wear',
  Fair: 'Some wear, still functional',
  Poor: 'Damaged or unsafe',
  Unknown: 'Not sure yet',
};

export const HoseDetailsForm: React.FC<HoseDetailsFormProps> = ({
  condition,
  length,
  notes,
  onChange,
  onError,
}) => {
  const handleConditionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCondition = e.target.value as HoseCondition;
    onChange({ condition: newCondition, length, notes });
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;

    if (value < 0) {
      onError?.('Length must be positive');
      return;
    }

    onChange({ condition, length: value, notes });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ condition, length, notes: e.target.value });
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
          Hose details
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Tell us about the hose's condition and size.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="form-label" htmlFor="hose-condition">
            Condition
          </label>
          <select
            id="hose-condition"
            value={condition}
            onChange={handleConditionChange}
            className="form-input"
          >
            {CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond} — {CONDITION_HINTS[cond]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="hose-length">
            Length (feet)
          </label>
          <input
            id="hose-length"
            type="number"
            value={length || ''}
            onChange={handleLengthChange}
            placeholder="e.g. 50"
            className="form-input"
            min="0"
            step="1"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="hose-notes">
            Additional notes <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
          </label>
          <textarea
            id="hose-notes"
            value={notes}
            onChange={handleNotesChange}
            placeholder="e.g. Red handle, damaged at one end"
            className="form-input resize-none"
            rows={3}
          />
        </div>

        <div className="info-box">
          <strong>Summary</strong>
          <p className="mt-0.5">
            {length > 0 ? `${length} ft · ` : 'Length not specified · '}
            {condition} condition
            {notes && ` · ${notes.length > 60 ? notes.substring(0, 60) + '…' : notes}`}
          </p>
        </div>
      </div>
    </div>
  );
};
