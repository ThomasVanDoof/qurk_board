type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

export default function Button({
  children,
  type = "button",
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full rounded-md bg-[#588157] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3A5A40]"
    >
      {children}
    </button>
  );
}