import { CopyButton } from './CopyButton';

interface CopyableFieldProps {
  value: string;
  label?: string;
}

export const CopyableField: React.FC<CopyableFieldProps> = ({ value, label }) => {
  return (
    <div className="copyable-field">
      <code className="copyable-field__value">{value}</code>
      <CopyButton value={value} label={label} />
    </div>
  );
};
