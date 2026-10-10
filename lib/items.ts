import "server-only";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/db";

const maxTitleLength = 120;
const maxDetailsLength = 2000;

type ItemRecord = {
  _id: ObjectId;
  ownerId: ObjectId;
  projectId?: ObjectId | null;
  title: string;
  details: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicItem = {
  id: string;
  projectId: string | null;
  title: string;
  details: string;
  createdAt: string;
  updatedAt: string;
};

export type ItemInput = { title?: string; details?: string };
export type CreateItemInput = Required<ItemInput> & { projectId: string | null };
export type ItemInputErrors = {
  title?: string;
  details?: string;
  projectId?: string;
  form?: string;
};

function toPublicItem(item: ItemRecord): PublicItem {
  return {
    id: item._id.toHexString(),
    projectId: item.projectId?.toHexString() ?? null,
    title: item.title,
    details: item.details,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseNewItem(value: unknown): {
  data?: CreateItemInput;
  errors?: ItemInputErrors;
} {
  if (!isObject(value)) return { errors: { form: "Item data must be an object." } };
  const errors: ItemInputErrors = {};
  if (Object.keys(value).some((key) => !["title", "details", "projectId"].includes(key))) {
    errors.form = "Only title, details, and projectId are accepted.";
  }
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const details = value.details === undefined ? "" : value.details;
  const projectId =
    value.projectId === undefined || value.projectId === null ? null : value.projectId;

  if (!title) errors.title = "Title is required.";
  else if (title.length > maxTitleLength)
    errors.title = `Title must be ${maxTitleLength} characters or fewer.`;
  if (typeof details !== "string") errors.details = "Details must be text.";
  else if (details.length > maxDetailsLength)
    errors.details = `Details must be ${maxDetailsLength} characters or fewer.`;
  if (projectId !== null && (typeof projectId !== "string" || !/^[a-f\d]{24}$/i.test(projectId))) {
    errors.projectId = "Project ID is invalid.";
  }

  if (Object.keys(errors).length > 0) return { errors };
  return { data: { title, details: details as string, projectId: projectId as string | null } };
}

export function parseItemPatch(value: unknown): { data?: ItemInput; errors?: ItemInputErrors } {
  if (!isObject(value)) return { errors: { form: "Update data must be an object." } };
  const errors: ItemInputErrors = {};
  const data: ItemInput = {};

  if (Object.hasOwn(value, "title")) {
    if (typeof value.title !== "string" || !value.title.trim())
      errors.title = "Title cannot be empty.";
    else if (value.title.trim().length > maxTitleLength)
      errors.title = `Title must be ${maxTitleLength} characters or fewer.`;
    else data.title = value.title.trim();
  }
  if (Object.hasOwn(value, "details")) {
    if (typeof value.details !== "string") errors.details = "Details must be text.";
    else if (value.details.length > maxDetailsLength)
      errors.details = `Details must be ${maxDetailsLength} characters or fewer.`;
    else data.details = value.details;
  }
  if (Object.keys(value).some((key) => key !== "title" && key !== "details")) {
    errors.form = "Only title and details can be updated.";
  }
  if (Object.keys(data).length === 0 && Object.keys(errors).length === 0) {
    errors.form = "Provide a title or details to update.";
  }

  if (Object.keys(errors).length > 0) return { errors };
  return { data };
}

export async function listItems(ownerId: string, projectId: string | null = null) {
  const projectFilter = projectId ? new ObjectId(projectId) : null;
  const items = await (
    await getDatabase()
  )
    .collection<ItemRecord>("items")
    .find({ ownerId: new ObjectId(ownerId), projectId: projectFilter })
    .sort({ createdAt: -1, _id: -1 })
    .toArray();
  return items.map(toPublicItem);
}

export async function createItem(ownerId: string, data: CreateItemInput) {
  const now = new Date();
  const item: ItemRecord = {
    _id: new ObjectId(),
    ownerId: new ObjectId(ownerId),
    projectId: data.projectId ? new ObjectId(data.projectId) : null,
    title: data.title,
    details: data.details,
    createdAt: now,
    updatedAt: now,
  };
  await (await getDatabase()).collection<ItemRecord>("items").insertOne(item);
  return toPublicItem(item);
}

export async function findOwnedItem(ownerId: string, itemId: string) {
  if (!/^[a-f\d]{24}$/i.test(itemId)) return null;
  const item = await (await getDatabase()).collection<ItemRecord>("items").findOne({
    _id: new ObjectId(itemId),
    ownerId: new ObjectId(ownerId),
  });
  return item ? toPublicItem(item) : null;
}

export async function updateOwnedItem(ownerId: string, itemId: string, data: ItemInput) {
  if (!/^[a-f\d]{24}$/i.test(itemId)) return null;
  const items = (await getDatabase()).collection<ItemRecord>("items");
  const result = await items.updateOne(
    { _id: new ObjectId(itemId), ownerId: new ObjectId(ownerId) },
    { $set: { ...data, updatedAt: new Date() } },
  );
  if (result.matchedCount === 0) return null;
  const updated = await items.findOne({
    _id: new ObjectId(itemId),
    ownerId: new ObjectId(ownerId),
  });
  return updated ? toPublicItem(updated) : null;
}

export async function deleteOwnedItem(ownerId: string, itemId: string) {
  if (!/^[a-f\d]{24}$/i.test(itemId)) return false;
  const result = await (await getDatabase()).collection<ItemRecord>("items").deleteOne({
    _id: new ObjectId(itemId),
    ownerId: new ObjectId(ownerId),
  });
  return result.deletedCount === 1;
}
