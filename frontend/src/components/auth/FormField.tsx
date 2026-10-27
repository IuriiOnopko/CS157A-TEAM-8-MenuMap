import React, { useState } from "react";

// Labeled input with optional error text and a show/hide toggle for passwords.
export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  hint,
  optional = false,
  rightLabel,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  rightLabel?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={name} className="text-[13.5px] font-semibold text-ink">
          {label}
          {optional && <span className="ml-1 font-normal text-muted-2">(optional)</span>}
        </label>
        {rightLabel}
      </div>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
          className={`w-full h-11 rounded-[10px] bg-card px-3.5 text-[15px] text-ink placeholder:text-muted-2/70 border-[1.5px] outline-none transition-colors
            ${isPassword ? "pr-16" : ""}
            ${error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              : "border-border-strong focus:border-sage focus:ring-4 focus:ring-sage/10"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-[12.5px] font-semibold text-muted hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${name}-error`} className="text-[12.5px] text-red-600">{error}</p>
      ) : hint ? (
        <p id={`${name}-hint`} className="text-[12.5px] text-muted-2">{hint}</p>
      ) : null}
    </div>
  );
}
