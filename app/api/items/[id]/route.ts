import { getCurrentUser } from "@/lib/auth/session";
import { deleteOwnedItem, findOwnedItem, parseItemPatch, updateOwnedItem } from "@/lib/items";

export const runtime = "nodejs";

type ItemRouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: ItemRouteContext) {
	let user;
	try {
		user = await getCurrentUser();
	} catch {
		return Response.json({ error: "Unable to verify the current session." }, { status: 500 });
	}
	if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

	try {
		const { id } = await params;
		const item = await findOwnedItem(user.id, id);
		if (!item) return Response.json({ error: "Item not found." }, { status: 404 });
		return Response.json({ item });
	} catch {
		return Response.json({ error: "Unable to load item." }, { status: 500 });
	}
}

export async function PATCH(request: Request, { params }: ItemRouteContext) {
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

	const parsed = parseItemPatch(body);
	if (!parsed.data) {
		return Response.json({ error: "Check the item fields.", errors: parsed.errors }, { status: 400 });
	}

	try {
		const { id } = await params;
		const item = await updateOwnedItem(user.id, id, parsed.data);
		if (!item) return Response.json({ error: "Item not found." }, { status: 404 });
		return Response.json({ item });
	} catch {
		return Response.json({ error: "Unable to update item." }, { status: 500 });
	}
}

export async function DELETE(_request: Request, { params }: ItemRouteContext) {
	let user;
	try {
		user = await getCurrentUser();
	} catch {
		return Response.json({ error: "Unable to verify the current session." }, { status: 500 });
	}
	if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

	try {
		const { id } = await params;
		if (!(await deleteOwnedItem(user.id, id))) {
			return Response.json({ error: "Item not found." }, { status: 404 });
		}
		return new Response(null, { status: 204 });
	} catch {
		return Response.json({ error: "Unable to delete item." }, { status: 500 });
	}
}