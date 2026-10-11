export default function Home() {
  return (
    <main className="min-h-screen bg-[#DAD7CD] text-[#344E41]">
      {/* Hero Section */}
      <section className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-3xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#588157] text-3xl font-bold text-white shadow-md">
            Q
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-[#344E41] sm:text-6xl">
            Plan Your Ideas.
            <br />
            <span className="text-[#588157]">See the Bigger Picture.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#3A5A40]">
            Qurk Board is a visual organization tool that lets you turn your ideas and plans into
            digital notes, move them around, and connect them together with pathways.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/board"
              className="rounded-lg bg-[#588157] px-6 py-3 font-medium text-white shadow-sm transition hover:bg-[#3A5A40]"
            >
              Start a Board
            </a>{" "}
            <a
              href="/register"
              className="rounded-lg border border-[#A3B18A] bg-white px-6 py-3 font-medium text-[#344E41] shadow-sm transition hover:bg-[#A3B18A]"
            >
              Create an Account
            </a>{" "}
          </div>
        </div>

      {/* Feature Cards */}
      <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-[#A3B18A] bg-white p-6 text-left shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#A3B18A] font-bold text-[#344E41]">
            1
          </div>

          <h2 className="text-xl font-bold text-[#344E41]">Write</h2>

          <p className="mt-2 leading-6 text-[#3A5A40]">
            Add notes for your ideas, tasks, plans, and next steps.
          </p>
        </div>

        <div className="rounded-xl border border-[#A3B18A] bg-white p-6 text-left shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#588157] font-bold text-white">
            2
          </div>

          <h2 className="text-xl font-bold text-[#344E41]">Move</h2>

          <p className="mt-2 leading-6 text-[#3A5A40]">
            Arrange your notes around the board so you can see your plan.
          </p>
        </div>

        <div className="rounded-xl border border-[#A3B18A] bg-white p-6 text-left shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#3A5A40] font-bold text-white">
            3
          </div>

          <h2 className="text-xl font-bold text-[#344E41]">Connect</h2>

          <p className="mt-2 leading-6 text-[#3A5A40]">
            Connect your ideas with arrows or digital string to show how everything fits together.
          </p>
        </div>
      </div>
    </main>
  );
}
