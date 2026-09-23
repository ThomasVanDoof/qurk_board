export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
     {/* Navigation Bar */}
      <nav className="flex items-center justify-between border-b border-zinc-200 bg-white px-8 py-4">
        {/* Placeholder Logo */}
        <a href="/" className="text-xl font-bold">
          Qurk Board
        </a>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="/" className="hover:text-blue-600">
            Home
          </a>

          <a href="/board" className="hover:text-blue-600">
            Board
          </a>

          <a href="/register" className="hover:text-blue-600">
            Register
          </a>

          {/* Profile Dropdown */}
          <details className="relative">
            <summary className="cursor-pointer list-none hover:text-blue-600">
              Profile ▾
            </summary>

            <div className="absolute right-0 mt-2 w-40 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg">
              <a
                href="/profile"
                className="block rounded-md px-3 py-2 hover:bg-zinc-100"
              >
                Profile
              </a>

              <a
                href="/projects"
                className="block rounded-md px-3 py-2 hover:bg-zinc-100"
              >
                Projects
              </a>
            </div>
          </details>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Plan Your Ideas.
            <br />
            <span className="text-blue-600">See the Bigger Picture.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            Qurk Board is a visual organization tool that lets you turn your
            ideas and plans into digital notes, move them around, and connect
            them together with pathways.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/board"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Start a Board
            </a>

            <a
              href="/register"
              className="rounded-lg border border-zinc-300 bg-white px-6 py-3 font-medium transition hover:bg-zinc-100"
            >
              Create an Account
            </a>
          </div>
        </div>

               {/* Simple Visual Preview */}
        <div className="mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-yellow-300 bg-yellow-100 p-6 shadow-sm">
            <h2 className="font-bold">Write</h2>
            <p className="mt-2 text-sm text-zinc-700">
              Add notes for your ideas and next steps.
            </p>
          </div>

          <div className="rounded-lg border border-blue-300 bg-blue-100 p-6 shadow-sm">
            <h2 className="font-bold">Move</h2>
            <p className="mt-2 text-sm text-zinc-700">
              Arrange your notes wherever they make sense.
            </p>
          </div>

          <div className="rounded-lg border border-green-300 bg-green-100 p-6 shadow-sm">
            <h2 className="font-bold">Connect</h2>
            <p className="mt-2 text-sm text-zinc-700">
              Connect your ideas with arrows or digital string.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}