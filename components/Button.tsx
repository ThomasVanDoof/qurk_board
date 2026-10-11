type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export default function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-md bg-[#527a51] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3A5A40] disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {children}
    </button>
  );
}
