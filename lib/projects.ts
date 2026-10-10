import "server-only";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";

const maxNameLength = 100;
const maxDescriptionLength = 1000;

type ProjectRecord = {
  _id: ObjectId;
  ownerId: ObjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicProject = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = { name?: string; description?: string };
export type ProjectInputErrors = { name?: string; description?: string; form?: string };

function toPublicProject(project: ProjectRecord): PublicProject {
  return {
    id: project._id.toHexString(),
    name: project.name,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseNewProject(value: unknown): {
  data?: Required<ProjectInput>;
  errors?: ProjectInputErrors;
} {
  if (!isObject(value)) return { errors: { form: "Project data must be an object." } };
  const errors: ProjectInputErrors = {};
  if (Object.keys(value).some((key) => key !== "name" && key !== "description")) {
    errors.form = "Only name and description are accepted.";
  }
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const description = value.description === undefined ? "" : value.description;
  if (!name) errors.name = "Project name is required.";
  else if (name.length > maxNameLength)
    errors.name = `Project name must be ${maxNameLength} characters or fewer.`;
  if (typeof description !== "string") errors.description = "Description must be text.";
  else if (description.length > maxDescriptionLength)
    errors.description = `Description must be ${maxDescriptionLength} characters or fewer.`;
  if (Object.keys(errors).length > 0) return { errors };
  return { data: { name, description: description as string } };
}

export function parseProjectPatch(value: unknown): {
  data?: ProjectInput;
  errors?: ProjectInputErrors;
} {
  if (!isObject(value)) return { errors: { form: "Update data must be an object." } };
  const errors: ProjectInputErrors = {};
  const data: ProjectInput = {};
  if (Object.hasOwn(value, "name")) {
    if (typeof value.name !== "string" || !value.name.trim())
      errors.name = "Project name cannot be empty.";
    else if (value.name.trim().length > maxNameLength)
      errors.name = `Project name must be ${maxNameLength} characters or fewer.`;
    else data.name = value.name.trim();
  }
  if (Object.hasOwn(value, "description")) {
    if (typeof value.description !== "string") errors.description = "Description must be text.";
    else if (value.description.length > maxDescriptionLength)
      errors.description = `Description must be ${maxDescriptionLength} characters or fewer.`;
    else data.description = value.description;
  }
  if (Object.keys(value).some((key) => key !== "name" && key !== "description")) {
    errors.form = "Only name and description can be updated.";
  }
  if (Object.keys(data).length === 0 && Object.keys(errors).length === 0) {
    errors.form = "Provide a name or description to update.";
  }
  if (Object.keys(errors).length > 0) return { errors };
  return { data };
}

export async function listProjects(ownerId: string) {
  const projects = await (
    await getDatabase()
  )
    .collection<ProjectRecord>("projects")
    .find({ ownerId: new ObjectId(ownerId) })
    .sort({ createdAt: -1, _id: -1 })
    .toArray();
  return projects.map(toPublicProject);
}

export async function createProject(ownerId: string, data: Required<ProjectInput>) {
  const now = new Date();
  const project: ProjectRecord = {
    _id: new ObjectId(),
    ownerId: new ObjectId(ownerId),
    name: data.name,
    description: data.description,
    createdAt: now,
    updatedAt: now,
  };
  await (await getDatabase()).collection<ProjectRecord>("projects").insertOne(project);
  return toPublicProject(project);
}

export async function findOwnedProject(ownerId: string, projectId: string) {
  if (!/^[a-f\d]{24}$/i.test(projectId)) return null;
  const project = await (await getDatabase()).collection<ProjectRecord>("projects").findOne({
    _id: new ObjectId(projectId),
    ownerId: new ObjectId(ownerId),
  });
  return project ? toPublicProject(project) : null;
}

export async function updateOwnedProject(ownerId: string, projectId: string, data: ProjectInput) {
  if (!/^[a-f\d]{24}$/i.test(projectId)) return null;
  const projects = (await getDatabase()).collection<ProjectRecord>("projects");
  const filter = { _id: new ObjectId(projectId), ownerId: new ObjectId(ownerId) };
  const result = await projects.updateOne(filter, { $set: { ...data, updatedAt: new Date() } });
  if (result.matchedCount === 0) return null;
  const updated = await projects.findOne(filter);
  return updated ? toPublicProject(updated) : null;
}

export async function deleteOwnedProject(ownerId: string, projectId: string) {
  if (!/^[a-f\d]{24}$/i.test(projectId)) return false;
  const result = await (await getDatabase()).collection<ProjectRecord>("projects").deleteOne({
    _id: new ObjectId(projectId),
    ownerId: new ObjectId(ownerId),
  });
  return result.deletedCount === 1;
}
