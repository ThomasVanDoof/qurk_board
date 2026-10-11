"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

type ProjectListResponse = { projects: Project[] };
type ProjectResponse = { project: Project };

async function readResponse<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
        ? body.error
        : "The request could not be completed.";
    throw new Error(message);
  }
  return body as T;
}

export default function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadProjects() {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" });
        const data = await readResponse<ProjectListResponse>(response);
        if (active) setProjects(data.projects);
      } catch (loadError) {
        if (active)
          setError(loadError instanceof Error ? loadError.message : "Unable to load projects.");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void loadProjects();
    return () => {
      active = false;
    };
  }, []);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await readResponse<ProjectResponse>(response);
      setProjects((current) => [data.project, ...current]);
      setName("");
      setDescription("");
      router.push(`/board?projectId=${encodeURIComponent(data.project.id)}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to create project.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateProject(event: FormEvent<HTMLFormElement>, projectId: string) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      const data = await readResponse<ProjectResponse>(response);
      setProjects((current) =>
        current.map((project) => (project.id === projectId ? data.project : project)),
      );
      setEditingId(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update project.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProject(project: Project) {
    if (!window.confirm(`Delete “${project.name}”?`)) return;
    setError(null);
    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!response.ok) await readResponse<never>(response);
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete project.");
    }
  }

  return (
    <main className="min-h-screen bg-[#DAD7CD] text-[#344E41]">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">My Projects</h1>
          <p className="mt-2 text-[#3A5A40]">View and organize your projects.</p>
        </header>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}

        <form
          onSubmit={createProject}
          className="mb-8 grid gap-4 rounded-lg border border-[#A3B18A] bg-white p-5 sm:grid-cols-[1fr_2fr_auto] sm:items-end"
        >
          <label className="grid gap-1 text-sm font-medium">
            Project name
            <input
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded border border-[#A3B18A] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Description
            <input
              maxLength={1000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="rounded border border-[#A3B18A] px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded bg-[#527a51] px-5 py-2 font-medium text-white hover:bg-[#3A5A40] disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Create project"}
          </button>
        </form>

        {isLoading ? (
          <p role="status">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="border-t border-[#A3B18A] py-8 text-[#3A5A40]">
            No projects yet. Create one to get started.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-lg border border-[#A3B18A] bg-white p-5 shadow-sm"
              >
                {editingId === project.id ? (
                  <form
                    onSubmit={(event) => {
                      void updateProject(event, project.id);
                    }}
                    className="grid gap-3"
                  >
                    <label className="grid gap-1 text-sm font-medium">
                      Project name
                      <input
                        required
                        maxLength={100}
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        className="rounded border border-[#A3B18A] px-3 py-2"
                      />
                    </label>
                    <label className="grid gap-1 text-sm font-medium">
                      Description
                      <textarea
                        maxLength={1000}
                        value={editDescription}
                        onChange={(event) => setEditDescription(event.target.value)}
                        className="min-h-24 rounded border border-[#A3B18A] px-3 py-2"
                      />
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded bg-[#527a51] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-2 text-sm underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">{project.name}</h2>
                    <p className="mt-2 min-h-12 whitespace-pre-wrap text-sm leading-6 text-[#3A5A40]">
                      {project.description || "No description"}
                    </p>
                    <p className="mt-4 text-xs text-[#77766B]">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-4 flex items-center gap-4 border-t border-[#DAD7CD] pt-3 text-sm font-medium">
                      <a
                        href={`/board?projectId=${encodeURIComponent(project.id)}`}
                        className="text-[#527a51] underline"
                      >
                        Open board
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(project.id);
                          setEditName(project.name);
                          setEditDescription(project.description);
                        }}
                        className="text-[#344E41] underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void deleteProject(project);
                        }}
                        className="text-red-700 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
