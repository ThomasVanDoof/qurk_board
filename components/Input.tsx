import type { InputHTMLAttributes } from "react";

type InputProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({ label, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-[#344E41]">
        {label}
      </label>

      <input
        id={inputId}
        {...props}
        className={
          className ??
          "rounded-md border border-[#657A5B] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#3A5A40] focus:ring-1 focus:ring-[#3A5A40]"
        }
      />
    </div>
  );
}
