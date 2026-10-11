import { getCurrentUser } from "@/lib/auth/session";
import {
  deleteOwnedProject,
  findOwnedProject,
  parseProjectPatch,
  updateOwnedProject,
} from "@/lib/projects";

export const runtime = "nodejs";

type ProjectRouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: ProjectRouteContext) {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return Response.json({ error: "Unable to verify the current session." }, { status: 500 });
  }
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  try {
    const { id } = await params;
    const project = await findOwnedProject(user.id, id);
    if (!project) return Response.json({ error: "Project not found." }, { status: 404 });
    return Response.json({ project });
  } catch {
    return Response.json({ error: "Unable to load project." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: ProjectRouteContext) {
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
  const parsed = parseProjectPatch(body);
  if (!parsed.data) {
    return Response.json(
      { error: "Check the project fields.", errors: parsed.errors },
      { status: 400 },
    );
  }
  try {
    const { id } = await params;
    const project = await updateOwnedProject(user.id, id, parsed.data);
    if (!project) return Response.json({ error: "Project not found." }, { status: 404 });
    return Response.json({ project });
  } catch {
    return Response.json({ error: "Unable to update project." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: ProjectRouteContext) {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return Response.json({ error: "Unable to verify the current session." }, { status: 500 });
  }
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  try {
    const { id } = await params;
    if (!(await deleteOwnedProject(user.id, id))) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Unable to delete project." }, { status: 500 });
  }
}
