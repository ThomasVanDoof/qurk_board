"use client";

import { useState, type PointerEvent } from "react";

const sidebarOptions = ["New item", "My items", "Pinned", "Delete"];

export default function BoardPage() {
	const [sidebarPosition, setSidebarPosition] = useState({ top: 24, left: 24 });

	function moveSidebar(event: PointerEvent<HTMLDivElement>) {
		if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
			return;
		}

		const sidebar = event.currentTarget.parentElement;
		if (!sidebar) {
			return;
		}

		const bounds = sidebar.getBoundingClientRect();
		const left = Math.min(
			Math.max(8, event.clientX - bounds.width / 2),
			window.innerWidth - bounds.width - 8,
		);
		const top = Math.min(
			Math.max(8, event.clientY - 24),
			window.innerHeight - bounds.height - 8,
		);

		setSidebarPosition({ top, left });
	}

	function stopMoving(event: PointerEvent<HTMLDivElement>) {
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	}

	return (
		<main
			className="relative min-h-screen flex-1 bg-cover bg-center bg-no-repeat"
			style={{ backgroundImage: "url('/cork_board.png')" }}
		>
			<aside
				className="absolute z-10 w-[min(15rem,calc(100vw-1rem))] overflow-hidden rounded-lg border border-stone-900/15 bg-stone-100/95 text-stone-900 shadow-xl backdrop-blur-sm"
				style={sidebarPosition}
			>
				<div
					className="flex touch-none cursor-grab items-center justify-between border-b border-stone-900/10 bg-stone-800 px-4 py-3 text-stone-50 active:cursor-grabbing"
					onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
					onPointerMove={moveSidebar}
					onPointerUp={stopMoving}
					onPointerCancel={stopMoving}
				>
					<span className="text-sm font-semibold tracking-wide">Board tools</span>
					<span aria-hidden="true" className="text-lg leading-none text-stone-300">*</span>
				</div>
				<nav aria-label="Board options" className="p-2">
					{sidebarOptions.map((option) => (
						<button
							key={option}
							type="button"
							className="w-full rounded-md px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-stone-700"
						>
							{option}
						</button>
					))}
				</nav>
			</aside>
		</main>
	);
}
