const projects = [
  {
    id: 1,
    name: "My First Project",
    description: "A place to organize my ideas and plans.",
  },
  {
    id: 2,
    name: "School Project",
    description: "Planning and organizing my school work.",
  },
  {
    id: 3,
    name: "Vacation Plans",
    description: "Ideas and plans for my next vacation.",
  },
];

export default function Projects() {
  return (
    <main className="min-h-screen bg-[#DAD7CD] text-[#344E41]">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between bg-[#344E41] px-8 py-4 text-white">
        {/* Logo */}
        <a href="/" className="text-xl font-bold">
          Qurk Board
        </a>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="/" className="transition hover:text-[#A3B18A]">
            Home
          </a>

          <a href="/board" className="transition hover:text-[#A3B18A]">
            Board
          </a>

          <a href="/register" className="transition hover:text-[#A3B18A]">
            Register
          </a>

          {/* Profile Dropdown */}
          <details className="relative">
            <summary className="cursor-pointer list-none transition hover:text-[#A3B18A]">
              Profile ▾
            </summary>

            <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-[#A3B18A] bg-white p-2 text-[#344E41] shadow-lg">
              <a
                href="/profile"
                className="block rounded-md px-3 py-2 transition hover:bg-[#DAD7CD]"
              >
                Profile
              </a>

              <a
                href="/projects"
                className="block rounded-md bg-[#DAD7CD] px-3 py-2 font-medium"
              >
                Projects
              </a>
            </div>
          </details>
        </div>
      </nav>

      {/* Projects Section */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#344E41]">
              My Projects
            </h1>

            <p className="mt-2 text-[#3A5A40]">
              View and organize all of your Qurk Board projects.
            </p>
          </div>

          <a
            href="/create"
            className="rounded-lg bg-[#588157] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-[#3A5A40]"
          >
            + New Project
          </a>
        </div>

        {/* Project Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <a
              key={project.id}
              href={`/board/${project.id}`}
              className="group rounded-xl border border-[#A3B18A] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#588157] hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[#A3B18A] text-xl font-bold text-[#344E41]">
                Q
              </div>

              <h2 className="text-xl font-bold text-[#344E41] group-hover:text-[#588157]">
                {project.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#3A5A40]">
                {project.description}
              </p>

              <div className="mt-6 text-sm font-medium text-[#588157]">
                Open Project →
              </div>
            </a>
          ))}

          {/* New Project Card */}
          <a
            href="/create"
            className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#A3B18A] bg-[#DAD7CD] p-6 text-center transition hover:border-[#588157] hover:bg-[#A3B18A]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#588157] text-2xl text-white">
              +
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#344E41]">
              Create a New Project
            </h2>

            <p className="mt-2 text-sm text-[#3A5A40]">
              Start organizing a new idea or plan.
            </p>
          </a>
        </div>
      </section>
    </main>
  );
}