import { getCurrentUser } from "@/lib/auth/session";
import { createItem, listItems, parseNewItem } from "@/lib/items";

export const runtime = "nodejs";

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
		return Response.json({ items: await listItems(user.id) });
	} catch {
		return Response.json({ error: "Unable to load items." }, { status: 500 });
	}
}

export async function POST(request: Request) {
	let user;
	try {
		user = await getCurrentUser();
	} catch {
		return Response.json({ error: "Unable to verify the current session." }, { status: 500 });
	}
	if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
	}

	const parsed = parseNewItem(body);
	if (!parsed.data) {
		return Response.json({ error: "Check the item fields.", errors: parsed.errors }, { status: 400 });
	}

	try {
		return Response.json({ item: await createItem(user.id, parsed.data) }, { status: 201 });
	} catch {
		return Response.json({ error: "Unable to create item." }, { status: 500 });
	}
}