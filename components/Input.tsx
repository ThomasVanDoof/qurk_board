import { InputHTMLAttributes } from "react";

type InputProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  label,
  id,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm font-medium text-[#344E41]"
      >
        {label}
      </label>

      <input
        id={id}
        {...props}
        className="rounded-md border border-[#A3B18A] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#588157] focus:ring-1 focus:ring-[#588157]"
      />
    </div>
  );
}