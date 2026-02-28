"use client";

interface Props {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
  id?: string;
}

export function FormField({ label, optional, error, children, id }: Props) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-rehub-dark"
      >
        {label}
        {optional && (
          <span className="text-rehub-dark/50 font-normal"> (opcional)</span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
