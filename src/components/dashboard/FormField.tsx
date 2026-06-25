"use client";

import { useTranslations } from "next-intl";

interface Props {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
  id?: string;
}

export function FormField({ label, optional, error, children, id }: Props) {
  const t = useTranslations("common");

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-rehub-900 mb-1.5"
      >
        {label}
        {optional && (
          <span className="text-rehub-900/50 font-normal ml-1">
            {t("optionalMarker")}
          </span>
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
