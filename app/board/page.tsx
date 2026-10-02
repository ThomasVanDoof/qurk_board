"use client";

import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";

type BoardNote = {
	id: string;
	text: string;
	pinned: boolean;
	updatedAt: number;
	x: number;
	y: number;
};

type NotePosition = { x: number; y: number };

const storageKey = "qurk-board-notes";
const maxNoteLength = 500;

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

export default function BoardPage() {
	const [notes, setNotes] = useState<BoardNote[]>([]);
	const [loaded, setLoaded] = useState(false);
	const [isComposing, setIsComposing] = useState(false);
	const [draft, setDraft] = useState("");
	const [composerPosition, setComposerPosition] = useState<NotePosition>({ x: 16, y: 20 });
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editDraft, setEditDraft] = useState("");
	const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
	const [confirmingClearAll, setConfirmingClearAll] = useState(false);
	const [activeDragId, setActiveDragId] = useState<string | null>(null);
	const [filter, setFilter] = useState<"all" | "pinned">("all");
	const [query, setQuery] = useState("");
	const [canvasWidth, setCanvasWidth] = useState(800);
	const [availableCanvasHeight, setAvailableCanvasHeight] = useState(640);
	const canvasRef = useRef<HTMLDivElement>(null);
	const dragRef = useRef<{ noteId: string; offsetX: number; offsetY: number; x: number; y: number } | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const sidebar = document.querySelector<HTMLElement>(".board-sidebar");
		const measure = () => {
			setCanvasWidth(canvas.clientWidth);
			const sidebarHeight = window.innerWidth <= 680 ? sidebar?.getBoundingClientRect().height ?? 0 : 0;
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
		queueMicrotask(() => {
			try {
				const savedNotes = window.localStorage.getItem(storageKey);
				if (savedNotes) {
					const parsed: unknown = JSON.parse(savedNotes);
					if (Array.isArray(parsed)) {
						setNotes(parsed.map((entry, index) => {
							const note = entry as Partial<BoardNote>;
							const fallback = nextNotePosition(index, 800);
							return {
								id: typeof note.id === "string" ? note.id : crypto.randomUUID(),
								text: typeof note.text === "string" ? note.text : "",
								pinned: note.pinned === true,
								updatedAt: typeof note.updatedAt === "number" ? note.updatedAt : Date.now(),
								x: typeof note.x === "number" ? note.x : fallback.x,
								y: typeof note.y === "number" ? note.y : fallback.y,
							};
						}).filter((note) => note.text.trim().length > 0));
					}
				}
			} catch {
				window.localStorage.removeItem(storageKey);
			} finally {
				setLoaded(true);
			}
		});
	}, []);

	useEffect(() => {
		if (!loaded || activeDragId) return;
		try {
			window.localStorage.setItem(storageKey, JSON.stringify(notes));
		} catch {
		}
	}, [activeDragId, loaded, notes]);

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

	function createNote(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const text = draft.trim();
		if (!text) return;

		setNotes((current) => [
			{ id: crypto.randomUUID(), text, pinned: false, updatedAt: Date.now(), ...composerPosition },
			...current,
		]);
		setDraft("");
		setIsComposing(false);
	}

	function saveEdit(event: FormEvent<HTMLFormElement>, noteId: string) {
		event.preventDefault();
		const text = editDraft.trim();
		if (!text) return;
		setNotes((current) =>
			current.map((note) => (note.id === noteId ? { ...note, text, updatedAt: Date.now() } : note)),
		);
		setEditingId(null);
	}

	function togglePinned(noteId: string) {
		setNotes((current) =>
			current.map((note) => (note.id === noteId ? { ...note, pinned: !note.pinned } : note)),
		);
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
		if (!drag || !canvas || !noteElement || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
		const canvasBounds = canvas.getBoundingClientRect();
		const noteBounds = noteElement.getBoundingClientRect();
		const x = Math.min(Math.max(8, event.clientX - canvasBounds.left - drag.offsetX), Math.max(8, canvas.clientWidth - noteBounds.width - 8));
		const y = Math.min(Math.max(8, event.clientY - canvasBounds.top - drag.offsetY), Math.max(8, canvas.clientHeight - noteBounds.height - 8));
		dragRef.current = { ...drag, x, y };
		setNotes((current) => current.map((note) => note.id === drag.noteId ? { ...note, x, y } : note));
	}

	function stopDragging(event: PointerEvent<HTMLButtonElement>) {
		const drag = dragRef.current;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		if (drag) {
			const updatedNotes = notes.map((note) => note.id === drag.noteId ? { ...note, x: drag.x, y: drag.y } : note);
			setNotes(updatedNotes);
			try {
				window.localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
			} catch {
			}
		}
		dragRef.current = null;
		setActiveDragId(null);
	}

	const visibleNotes = notes.filter((note) => {
		const matchesFilter = filter === "all" || note.pinned;
		return matchesFilter && note.text.toLowerCase().includes(query.toLowerCase());
	});
	const canvasHeight = Math.max(640, availableCanvasHeight, ...notes.map((note) => note.y + 270), isComposing ? composerPosition.y + 270 : 0);

	return (
		<main className="board-shell">
			<aside className="board-sidebar" aria-label="Board tools">
				<a className="board-brand" href="/board" aria-label="Board name">
					<span className="brand-placeholder">Board name</span>
				</a>
				<div className="sidebar-workspace">
					<p className="sidebar-label">PERSONAL SPACE</p>
					<p className="board-count">{notes.length} {notes.length === 1 ? "note" : "notes"} on your board</p>
				</div>
				<button type="button" className="create-button" onClick={openComposer}>
					New note
				</button>
				<nav className="sidebar-nav" aria-label="Board views">
					<p className="sidebar-label">YOUR BOARD</p>
					<button type="button" className={filter === "all" ? "sidebar-link is-active" : "sidebar-link"} onClick={() => setFilter("all")}>
						All notes <span className="sidebar-link-count">{notes.length}</span>
					</button>
					<button type="button" className={filter === "pinned" ? "sidebar-link is-active" : "sidebar-link"} onClick={() => setFilter("pinned")}>
						Pinned <span className="sidebar-link-count">{notes.filter((note) => note.pinned).length}</span>
					</button>
				</nav>
				<label className="search-field sidebar-search">
					<input aria-label="Search notes" placeholder="Find a note" value={query} onChange={(event) => setQuery(event.target.value)} />
				</label>
				<div className="sidebar-bottom">
					{confirmingClearAll ? (
						<div className="clear-confirm" role="group" aria-label="Confirm clearing board">
							<span>Delete all {notes.length} notes?</span>
							<button type="button" onClick={() => setConfirmingClearAll(false)}>Cancel</button>
							<button type="button" className="confirm-clear-button" onClick={() => { setNotes([]); setConfirmingClearAll(false); setEditingId(null); }}>Delete</button>
						</div>
					) : (
						<button type="button" className="sidebar-delete" disabled={notes.length === 0} onClick={() => setConfirmingClearAll(true)}>
							Clear board
						</button>
					)}
					<p className="sidebar-hint">Drag a note by its handle to move it.</p>
				</div>
			</aside>

			<section className="board-workspace" aria-label="Cork board">
				<div ref={canvasRef} className="board-canvas" style={{ minHeight: `${canvasHeight}px` }}>
					{isComposing && (
					<form className={`note-composer ${noteShape(draft.length)}`} style={{ left: composerPosition.x, top: composerPosition.y }} onSubmit={createNote}>
						<div className="composer-topline">
							<span className="paper-label">NEW THOUGHT</span>
							<button className="text-button close-composer" type="button" onClick={() => { setIsComposing(false); setDraft(""); }}>Cancel</button>
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
							<span>{draft.length}/{maxNoteLength}</span>
							<button className="save-button" type="submit" disabled={!draft.trim()}>Add to board</button>
						</div>
					</form>
					)}

					{loaded && visibleNotes.map((note, index) => (
							<article
								key={note.id}
								className={`note-card ${noteShape(note.text.length)}${activeDragId === note.id ? " is-dragging" : ""}`}
								style={{ left: Math.min(note.x, Math.max(8, canvasWidth - 276)), top: note.y, zIndex: activeDragId === note.id ? notes.length + 2 : index + 1 }}
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
										<span className="paper-label">NOTE {String(notes.indexOf(note) + 1).padStart(2, "0")}</span>
									</button>
									<div className="note-actions">
										<button className={note.pinned ? "note-action-button is-pinned" : "note-action-button"} type="button" onClick={() => togglePinned(note.id)}>{note.pinned ? "Unpin" : "Pin"}</button>
										<button className="note-action-button" type="button" onClick={() => { setEditingId(note.id); setEditDraft(note.text); setConfirmingDeleteId(null); }}>Edit</button>
										<button className="note-action-button delete-action" type="button" onClick={() => setConfirmingDeleteId(note.id)}>Delete</button>
									</div>
								</div>
								{editingId === note.id ? (
									<form className="note-edit-form" onSubmit={(event) => saveEdit(event, note.id)}>
										<textarea aria-label="Edit note text" maxLength={maxNoteLength} value={editDraft} onChange={(event) => setEditDraft(event.target.value)} autoFocus />
										<div className="edit-actions">
											<button type="button" className="text-button" onClick={() => setEditingId(null)}>Cancel</button>
											<button type="submit" className="save-button" disabled={!editDraft.trim()}>Save</button>
										</div>
									</form>
								) : <p className="note-text">{note.text}</p>}
								{confirmingDeleteId === note.id && (
									<div className="delete-confirm" role="group" aria-label="Confirm note deletion">
										<span>Remove this note?</span>
										<button type="button" className="text-button" onClick={() => setConfirmingDeleteId(null)}>Keep it</button>
										<button type="button" className="delete-confirm-button" onClick={() => { setNotes((current) => current.filter((item) => item.id !== note.id)); setConfirmingDeleteId(null); }}>Remove</button>
									</div>
								)}
							</article>
						))}
					{loaded && visibleNotes.length === 0 && !isComposing && (
						<div className="canvas-empty">
							<p>{query ? "No notes match this search." : filter === "pinned" ? "No pinned notes yet." : "Your board is clear. Add a note to begin."}</p>
						</div>
					)}
				</div>
			</section>
		</main>
	);
}
