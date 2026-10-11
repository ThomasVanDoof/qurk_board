"use client";

import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";

type BoardNote = {
  id: string;
  text: string;
  pinned: boolean;
  updatedAt: number;
  x: number;
  y: number;
  persisted?: boolean;
};

type NotePosition = { x: number; y: number };
type BoardConnection = { id: string; from: string; to: string };
type NoteSize = { width: number; height: number };
type ApiItem = {
  id: string;
  projectId: string | null;
  title: string;
  details: string;
  createdAt: string;
  updatedAt: string;
};
type ItemsResponse = { items: ApiItem[] };
type ItemResponse = { item: ApiItem };
type ProjectResponse = { project: { id: string; name: string } };

const storageKey = "qurk-board-notes";
const connectionStorageKey = "qurk-board-connections";
const maxNoteLength = 500;

function boardStorageKey(key: string, projectId: string | null) {
  return projectId ? `${key}:${projectId}` : key;
}

function splitNoteText(text: string) {
  return { title: text.slice(0, 120), details: text.slice(120) };
}

async function readApiResponse<T>(response: Response): Promise<T> {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
        ? body.error
        : "The board could not be saved. Please try again.";
    throw new Error(message);
  }
  return body as T;
}

function noteFromItem(
  item: ApiItem,
  cachedNote?: BoardNote,
  fallbackPosition: NotePosition = { x: 16, y: 20 },
): BoardNote {
  return {
    id: item.id,
    text: item.title + item.details,
    pinned: cachedNote?.pinned ?? false,
    updatedAt: Date.parse(item.updatedAt) || Date.now(),
    x: cachedNote?.x ?? fallbackPosition.x,
    y: cachedNote?.y ?? fallbackPosition.y,
    persisted: true,
  };
}

function nextNotePosition(index: number, canvasWidth: number): NotePosition {
  const columns = Math.max(1, Math.floor((canvasWidth - 32) / 286));
  return {
    x: 16 + (index % columns) * 286,
    y: 20 + Math.floor(index / columns) * 250,
  };
}

function noteShape(length: number) {
  if (length < 70) return "note--small";
  if (length < 220) return "note--medium";
  return "note--large";
}

function connectorPath(source: NotePosition & NoteSize, target: NotePosition & NoteSize) {
  const sourceCenterX = source.x + source.width / 2;
  const sourceCenterY = source.y + source.height / 2;
  const targetCenterX = target.x + target.width / 2;
  const targetCenterY = target.y + target.height / 2;
  const horizontal =
    Math.abs(targetCenterX - sourceCenterX) >= Math.abs(targetCenterY - sourceCenterY);
  let points: NotePosition[];

  if (horizontal) {
    const direction = targetCenterX >= sourceCenterX ? 1 : -1;
    const start = { x: source.x + (direction > 0 ? source.width : 0), y: sourceCenterY };
    const end = { x: target.x + (direction > 0 ? 0 : target.width), y: targetCenterY };
    const middleX = (start.x + end.x) / 2;
    points = [start, { x: middleX, y: start.y }, { x: middleX, y: end.y }, end];
  } else {
    const direction = targetCenterY >= sourceCenterY ? 1 : -1;
    const start = { x: sourceCenterX, y: source.y + (direction > 0 ? source.height : 0) };
    const end = { x: targetCenterX, y: target.y + (direction > 0 ? 0 : target.height) };
    const middleY = (start.y + end.y) / 2;
    points = [start, { x: start.x, y: middleY }, { x: end.x, y: middleY }, end];
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const corner = points[index];
    const next = points[index + 1];
    const incomingLength = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    const outgoingLength = Math.hypot(next.x - corner.x, next.y - corner.y);
    const radius = Math.min(18, incomingLength / 2, outgoingLength / 2);
    const before = {
      x: corner.x - Math.sign(corner.x - previous.x) * radius,
      y: corner.y - Math.sign(corner.y - previous.y) * radius,
    };
    const after = {
      x: corner.x + Math.sign(next.x - corner.x) * radius,
      y: corner.y + Math.sign(next.y - corner.y) * radius,
    };
    path += ` L ${before.x} ${before.y} Q ${corner.x} ${corner.y} ${after.x} ${after.y}`;
  }
  return `${path} L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
}

export default function BoardPage() {
  const [notes, setNotes] = useState<BoardNote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [projectId] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("projectId"),
  );
  const [projectName, setProjectName] = useState<string | null>(null);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [composerPosition, setComposerPosition] = useState<NotePosition>({ x: 16, y: 20 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [confirmingClearAll, setConfirmingClearAll] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [connections, setConnections] = useState<BoardConnection[]>([]);
  const [connectionMode, setConnectionMode] = useState<"connect" | "disconnect" | null>(null);
  const [selectedConnectionNoteId, setSelectedConnectionNoteId] = useState<string | null>(null);
  const [noteSizes, setNoteSizes] = useState<Record<string, NoteSize>>({});
  const [filter, setFilter] = useState<"all" | "pinned">("all");
  const [query, setQuery] = useState("");
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [availableCanvasHeight, setAvailableCanvasHeight] = useState(640);
  const canvasRef = useRef<HTMLDivElement>(null);
  const noteElementsRef = useRef(new Map<string, HTMLElement>());
  const dragRef = useRef<{
    noteId: string;
    offsetX: number;
    offsetY: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sidebar = document.querySelector<HTMLElement>(".board-sidebar");
    const measure = () => {
      setCanvasWidth(canvas.clientWidth);
      const sidebarHeight =
        window.innerWidth <= 680 ? (sidebar?.getBoundingClientRect().height ?? 0) : 0;
      setAvailableCanvasHeight(Math.max(0, window.innerHeight - sidebarHeight));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    if (sidebar) observer.observe(sidebar);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const notesKey = boardStorageKey(storageKey, projectId);
    const connectionsKey = boardStorageKey(connectionStorageKey, projectId);
    queueMicrotask(() => {
      try {
        const savedNotes = window.localStorage.getItem(notesKey);
        if (savedNotes) {
          const parsed: unknown = JSON.parse(savedNotes);
          if (Array.isArray(parsed)) {
            setNotes(
              parsed
                .map((entry, index) => {
                  const note = entry as Partial<BoardNote>;
                  const fallback = nextNotePosition(index, 800);
                  return {
                    id: typeof note.id === "string" ? note.id : crypto.randomUUID(),
                    text: typeof note.text === "string" ? note.text : "",
                    pinned: note.pinned === true,
                    updatedAt: typeof note.updatedAt === "number" ? note.updatedAt : Date.now(),
                    x: typeof note.x === "number" ? note.x : fallback.x,
                    y: typeof note.y === "number" ? note.y : fallback.y,
                    persisted: note.persisted === true,
                  };
                })
                .filter((note) => note.text.trim().length > 0),
            );
          }
        }
      } catch {
        window.localStorage.removeItem(notesKey);
      }

      try {
        const savedConnections = window.localStorage.getItem(connectionsKey);
        if (savedConnections) {
          const parsed: unknown = JSON.parse(savedConnections);
          if (Array.isArray(parsed)) {
            setConnections(
              parsed.filter(
                (entry): entry is BoardConnection =>
                  typeof entry?.id === "string" &&
                  typeof entry.from === "string" &&
                  typeof entry.to === "string",
              ),
            );
          }
        }
      } catch {
        window.localStorage.removeItem(connectionsKey);
      } finally {
        setLoaded(true);
      }
    });
  }, [projectId]);

  useEffect(() => {
    if (!loaded) return;
    let active = true;

    async function loadDatabaseNotes() {
      try {
        if (projectId) {
          const projectResponse = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
          const data = await readApiResponse<ProjectResponse>(projectResponse);
          if (active) setProjectName(data.project.name);
        }
        const itemUrl = projectId
          ? `/api/items?projectId=${encodeURIComponent(projectId)}`
          : "/api/items";
        const response = await fetch(itemUrl, { cache: "no-store" });
        const data = await readApiResponse<ItemsResponse>(response);
        if (!active) return;
        setNotes((current) => {
          const cachedById = new Map(current.map((note) => [note.id, note]));
          const databaseNotes = data.items.map((item, index) =>
            noteFromItem(item, cachedById.get(item.id), nextNotePosition(index, canvasWidth)),
          );
          const databaseIds = new Set(databaseNotes.map((note) => note.id));
          return [...databaseNotes, ...current.filter((note) => !databaseIds.has(note.id))];
        });
        setBoardError(null);
      } catch (error) {
        if (active)
          setBoardError(error instanceof Error ? error.message : "Unable to load saved notes.");
      }
    }

    void loadDatabaseNotes();
    return () => {
      active = false;
    };
  }, [canvasWidth, loaded, projectId]);

  useEffect(() => {
    if (!loaded || activeDragId) return;
    try {
      window.localStorage.setItem(boardStorageKey(storageKey, projectId), JSON.stringify(notes));
    } catch {}
  }, [activeDragId, loaded, notes, projectId]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(
        boardStorageKey(connectionStorageKey, projectId),
        JSON.stringify(connections),
      );
    } catch {}
  }, [connections, loaded, projectId]);

  function openComposer() {
    const position = nextNotePosition(notes.length, canvasWidth);
    setComposerPosition({
      x: Math.min(position.x, Math.max(8, canvasWidth - 276)),
      y: position.y,
    });
    setIsComposing(true);
    setFilter("all");
    setTimeout(() => document.getElementById("new-note-text")?.focus(), 0);
  }

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setBoardError(null);
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...splitNoteText(text), projectId: projectId ?? null }),
      });
      const { item } = await readApiResponse<ItemResponse>(response);
      setNotes((current) => [
        noteFromItem(item, {
          ...composerPosition,
          id: item.id,
          text,
          pinned: false,
          updatedAt: Date.now(),
        }),
        ...current,
      ]);
      setDraft("");
      setIsComposing(false);
    } catch (error) {
      setBoardError(error instanceof Error ? error.message : "Unable to create note.");
    }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>, noteId: string) {
    event.preventDefault();
    const text = editDraft.trim();
    if (!text) return;

    const note = notes.find((item) => item.id === noteId);
    if (!note) return;
    setBoardError(null);
    try {
      if (note.persisted) {
        const response = await fetch(`/api/items/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(splitNoteText(text)),
        });
        await readApiResponse<ItemResponse>(response);
      }
      setNotes((current) =>
        current.map((item) =>
          item.id === noteId ? { ...item, text, updatedAt: Date.now() } : item,
        ),
      );
      setEditingId(null);
    } catch (error) {
      setBoardError(error instanceof Error ? error.message : "Unable to update note.");
    }
  }

  async function deleteNote(noteId: string) {
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;
    setBoardError(null);
    try {
      if (note.persisted) {
        const response = await fetch(`/api/items/${noteId}`, { method: "DELETE" });
        if (!response.ok) await readApiResponse<never>(response);
      }
      setNotes((current) => current.filter((item) => item.id !== noteId));
      setConnections((current) =>
        current.filter((connection) => connection.from !== noteId && connection.to !== noteId),
      );
      setSelectedConnectionNoteId((current) => (current === noteId ? null : current));
      setConfirmingDeleteId(null);
    } catch (error) {
      setBoardError(error instanceof Error ? error.message : "Unable to delete note.");
    }
  }

  async function clearBoard() {
    setBoardError(null);
    try {
      await Promise.all(
        notes
          .filter((note) => note.persisted)
          .map(async (note) => {
            const response = await fetch(`/api/items/${note.id}`, { method: "DELETE" });
            if (!response.ok) await readApiResponse<never>(response);
          }),
      );
      setNotes([]);
      setConnections([]);
      setConfirmingClearAll(false);
      setEditingId(null);
    } catch (error) {
      setBoardError(error instanceof Error ? error.message : "Unable to clear the board.");
    }
  }

  function togglePinned(noteId: string) {
    setNotes((current) =>
      current.map((note) => (note.id === noteId ? { ...note, pinned: !note.pinned } : note)),
    );
  }

  function toggleConnectionMode(mode: "connect" | "disconnect") {
    setConnectionMode((current) => (current === mode ? null : mode));
    setSelectedConnectionNoteId(null);
  }

  function chooseConnectionNote(noteId: string) {
    if (!connectionMode) return;
    if (!selectedConnectionNoteId) {
      setSelectedConnectionNoteId(noteId);
      return;
    }
    if (selectedConnectionNoteId === noteId) {
      setSelectedConnectionNoteId(null);
      return;
    }

    if (connectionMode === "connect") {
      const alreadyConnected = connections.some(
        (connection) =>
          (connection.from === selectedConnectionNoteId && connection.to === noteId) ||
          (connection.from === noteId && connection.to === selectedConnectionNoteId),
      );
      if (!alreadyConnected) {
        setConnections((current) => [
          ...current,
          { id: crypto.randomUUID(), from: selectedConnectionNoteId, to: noteId },
        ]);
      }
    } else {
      setConnections((current) =>
        current.filter(
          (connection) =>
            !(
              (connection.from === selectedConnectionNoteId && connection.to === noteId) ||
              (connection.from === noteId && connection.to === selectedConnectionNoteId)
            ),
        ),
      );
    }
    setSelectedConnectionNoteId(null);
  }

  function startDragging(event: PointerEvent<HTMLButtonElement>, noteId: string) {
    if (event.button !== 0 || !canvasRef.current) return;
    const noteElement = event.currentTarget.closest(".note-card");
    if (!noteElement) return;
    const bounds = noteElement.getBoundingClientRect();
    dragRef.current = {
      noteId,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
      x: notes.find((note) => note.id === noteId)?.x ?? 0,
      y: notes.find((note) => note.id === noteId)?.y ?? 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveDragId(noteId);
  }

  function moveNote(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    const noteElement = event.currentTarget.closest(".note-card");
    if (!drag || !canvas || !noteElement || !event.currentTarget.hasPointerCapture(event.pointerId))
      return;
    const canvasBounds = canvas.getBoundingClientRect();
    const noteBounds = noteElement.getBoundingClientRect();
    const x = Math.min(
      Math.max(8, event.clientX - canvasBounds.left - drag.offsetX),
      Math.max(8, canvas.clientWidth - noteBounds.width - 8),
    );
    const y = Math.min(
      Math.max(8, event.clientY - canvasBounds.top - drag.offsetY),
      Math.max(8, canvas.clientHeight - noteBounds.height - 8),
    );
    dragRef.current = { ...drag, x, y };
    setNotes((current) =>
      current.map((note) => (note.id === drag.noteId ? { ...note, x, y } : note)),
    );
  }

  function stopDragging(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag) {
      const updatedNotes = notes.map((note) =>
        note.id === drag.noteId ? { ...note, x: drag.x, y: drag.y } : note,
      );
      setNotes(updatedNotes);
      try {
        window.localStorage.setItem(
          boardStorageKey(storageKey, projectId),
          JSON.stringify(updatedNotes),
        );
      } catch {}
    }
    dragRef.current = null;
    setActiveDragId(null);
  }

  const visibleNotes = notes.filter((note) => {
    const matchesFilter = filter === "all" || note.pinned;
    return matchesFilter && note.text.toLowerCase().includes(query.toLowerCase());
  });
  const visibleNoteIds = new Set(visibleNotes.map((note) => note.id));
  const visibleConnections = connections.filter(
    (connection) => visibleNoteIds.has(connection.from) && visibleNoteIds.has(connection.to),
  );
  const canvasHeight = Math.max(
    640,
    availableCanvasHeight,
    ...notes.map((note) => note.y + 270),
    isComposing ? composerPosition.y + 270 : 0,
  );

  const visibleNoteKey = visibleNotes.map((note) => note.id).join("|");
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setNoteSizes((current) => {
        let changed = false;
        const next = { ...current };
        for (const entry of entries) {
          const noteId = (entry.target as HTMLElement).dataset.noteId;
          if (!noteId) continue;
          const size = {
            width: (entry.target as HTMLElement).offsetWidth,
            height: (entry.target as HTMLElement).offsetHeight,
          };
          if (current[noteId]?.width !== size.width || current[noteId]?.height !== size.height) {
            next[noteId] = size;
            changed = true;
          }
        }
        return changed ? next : current;
      });
    });
    for (const element of noteElementsRef.current.values()) observer.observe(element);
    return () => observer.disconnect();
  }, [visibleNoteKey, editingId, editDraft]);

  return (
    <main className="board-shell">
      <aside className="board-sidebar" aria-label="Board tools">
        <a
          className="board-brand"
          href={loaded && projectId ? "/projects" : "/board"}
          aria-label="Board navigation"
        >
          <span className="brand-placeholder">
            {loaded
              ? (projectName ?? (projectId ? "Project board" : "Personal board"))
              : "Loading board"}
          </span>
        </a>
        <div className="sidebar-workspace">
          <p className="sidebar-label">
            {!loaded ? "LOADING BOARD" : projectId ? "PROJECT BOARD" : "PERSONAL SPACE"}
          </p>
          <p className="board-count">
            {notes.length} {notes.length === 1 ? "note" : "notes"} on your board
          </p>
        </div>
        {boardError && (
          <p role="alert" className="rounded bg-black/20 px-3 py-2 text-xs text-[#ffd0a8]">
            {boardError}
          </p>
        )}
        <button type="button" className="create-button" onClick={openComposer}>
          New note
        </button>
        <nav className="sidebar-nav" aria-label="Board views">
          <p className="sidebar-label">YOUR BOARD</p>
          <button
            type="button"
            className={filter === "all" ? "sidebar-link is-active" : "sidebar-link"}
            onClick={() => setFilter("all")}
          >
            All notes <span className="sidebar-link-count">{notes.length}</span>
          </button>
          <button
            type="button"
            className={filter === "pinned" ? "sidebar-link is-active" : "sidebar-link"}
            onClick={() => setFilter("pinned")}
          >
            Pinned{" "}
            <span className="sidebar-link-count">{notes.filter((note) => note.pinned).length}</span>
          </button>
        </nav>
        <label className="search-field sidebar-search">
          <input
            aria-label="Search notes"
            placeholder="Find a note"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="sidebar-bottom">
          <div className="connection-tools" aria-label="Note connections">
            <button
              type="button"
              className={
                connectionMode === "connect" ? "connection-tool is-active" : "connection-tool"
              }
              aria-pressed={connectionMode === "connect"}
              onClick={() => toggleConnectionMode("connect")}
            >
              Connect notes
            </button>
            <button
              type="button"
              className={
                connectionMode === "disconnect" ? "connection-tool is-active" : "connection-tool"
              }
              aria-pressed={connectionMode === "disconnect"}
              disabled={connections.length === 0}
              onClick={() => toggleConnectionMode("disconnect")}
            >
              Remove link
            </button>
          </div>
          {confirmingClearAll ? (
            <div className="clear-confirm" role="group" aria-label="Confirm clearing board">
              <span>Delete all {notes.length} notes?</span>
              <button type="button" onClick={() => setConfirmingClearAll(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="confirm-clear-button"
                onClick={() => {
                  void clearBoard();
                }}
              >
                Delete
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="sidebar-delete"
              disabled={notes.length === 0}
              onClick={() => setConfirmingClearAll(true)}
            >
              Clear board
            </button>
          )}
          <p className="sidebar-hint">
            {connectionMode
              ? selectedConnectionNoteId
                ? "Choose another note to finish."
                : "Choose two notes on the board."
              : "Drag a note by its handle to move it."}
          </p>
        </div>
      </aside>

      <section className="board-workspace" aria-label="Cork board">
        <div ref={canvasRef} className="board-canvas" style={{ minHeight: `${canvasHeight}px` }}>
          {loaded && visibleConnections.length > 0 && (
            <svg
              className="board-connectors"
              viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="connection-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
              </defs>
              {visibleConnections.map((connection) => {
                const source = visibleNotes.find((note) => note.id === connection.from);
                const target = visibleNotes.find((note) => note.id === connection.to);
                if (!source || !target) return null;
                const sourceSize = noteSizes[source.id] ?? { width: 260, height: 150 };
                const targetSize = noteSizes[target.id] ?? { width: 260, height: 150 };
                return (
                  <path
                    key={connection.id}
                    d={connectorPath(
                      {
                        x: Math.min(source.x, Math.max(8, canvasWidth - 276)),
                        y: source.y,
                        ...sourceSize,
                      },
                      {
                        x: Math.min(target.x, Math.max(8, canvasWidth - 276)),
                        y: target.y,
                        ...targetSize,
                      },
                    )}
                    markerEnd="url(#connection-arrow)"
                  />
                );
              })}
            </svg>
          )}

          {isComposing && (
            <form
              className={`note-composer ${noteShape(draft.length)}`}
              style={{ left: composerPosition.x, top: composerPosition.y }}
              onSubmit={createNote}
            >
              <div className="composer-topline">
                <span className="paper-label">NEW THOUGHT</span>
                <button
                  className="text-button close-composer"
                  type="button"
                  onClick={() => {
                    setIsComposing(false);
                    setDraft("");
                  }}
                >
                  Cancel
                </button>
              </div>
              <textarea
                id="new-note-text"
                aria-label="Note text"
                placeholder="What’s on your mind?"
                maxLength={maxNoteLength}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <div className="composer-footer">
                <span>
                  {draft.length}/{maxNoteLength}
                </span>
                <button className="save-button" type="submit" disabled={!draft.trim()}>
                  Add to board
                </button>
              </div>
            </form>
          )}

          {loaded &&
            visibleNotes.map((note, index) => (
              <article
                key={note.id}
                data-note-id={note.id}
                ref={(element) => {
                  if (element) noteElementsRef.current.set(note.id, element);
                  else noteElementsRef.current.delete(note.id);
                }}
                className={`note-card ${noteShape(note.text.length)}${activeDragId === note.id ? " is-dragging" : ""}${selectedConnectionNoteId === note.id ? " is-connection-selected" : ""}`}
                style={{
                  left: Math.min(note.x, Math.max(8, canvasWidth - 276)),
                  top: note.y,
                  zIndex: activeDragId === note.id ? notes.length + 2 : index + 1,
                }}
              >
                <div className="note-card-topline">
                  <button
                    className="move-handle"
                    type="button"
                    aria-label="Drag to move note"
                    title="Drag to move"
                    onPointerDown={(event) => startDragging(event, note.id)}
                    onPointerMove={moveNote}
                    onPointerUp={stopDragging}
                    onPointerCancel={stopDragging}
                  >
                    <span className="move-label">Move</span>
                    <span className="paper-label">
                      NOTE {String(notes.indexOf(note) + 1).padStart(2, "0")}
                    </span>
                  </button>
                  <div className="note-actions">
                    <button
                      className={
                        note.pinned ? "note-action-button is-pinned" : "note-action-button"
                      }
                      type="button"
                      onClick={() => togglePinned(note.id)}
                    >
                      {note.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      className="note-action-button"
                      type="button"
                      onClick={() => {
                        setEditingId(note.id);
                        setEditDraft(note.text);
                        setConfirmingDeleteId(null);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="note-action-button delete-action"
                      type="button"
                      onClick={() => setConfirmingDeleteId(note.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {editingId === note.id ? (
                  <form className="note-edit-form" onSubmit={(event) => saveEdit(event, note.id)}>
                    <textarea
                      aria-label="Edit note text"
                      maxLength={maxNoteLength}
                      value={editDraft}
                      onChange={(event) => setEditDraft(event.target.value)}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="save-button" disabled={!editDraft.trim()}>
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="note-text">{note.text}</p>
                )}
                {connectionMode && (
                  <button
                    className="connection-select-button"
                    type="button"
                    aria-pressed={selectedConnectionNoteId === note.id}
                    onClick={() => chooseConnectionNote(note.id)}
                  >
                    {selectedConnectionNoteId === note.id
                      ? "Selected"
                      : connectionMode === "connect"
                        ? "Choose note"
                        : "Select note"}
                  </button>
                )}
                {confirmingDeleteId === note.id && (
                  <div className="delete-confirm" role="group" aria-label="Confirm note deletion">
                    <span>Remove this note?</span>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setConfirmingDeleteId(null)}
                    >
                      Keep it
                    </button>
                    <button
                      type="button"
                      className="delete-confirm-button"
                      onClick={() => {
                        void deleteNote(note.id);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </article>
            ))}
          {loaded && visibleNotes.length === 0 && !isComposing && (
            <div className="canvas-empty">
              <p>
                {query
                  ? "No notes match this search."
                  : filter === "pinned"
                    ? "No pinned notes yet."
                    : "Your board is clear. Add a note to begin."}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
