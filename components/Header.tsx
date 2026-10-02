import NavLinks from "./NavLinks";

export default function Header() {
  return (
    <header className="bg-[#344E41] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <h1 className="text-lg font-bold">
          Qurk Board
        </h1>

        <NavLinks />
      </div>
    </header>
  );
}