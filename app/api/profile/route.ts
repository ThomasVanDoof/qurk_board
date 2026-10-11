
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findUserByEmail } from "@/lib/auth/findUserByEmail";
import { getDatabase } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para ver tu perfil." },
        { status: 401 }
      );
    }

    const user = await findUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { error: "No se encontró el usuario." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt ?? null,
    });
  } catch (error) {
    console.error("Error al obtener el perfil:", error);

    return NextResponse.json(
      { error: "No se pudo cargar el perfil." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para editar tu perfil." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const username =
      typeof body.username === "string" ? body.username.trim() : "";

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: "El nombre debe tener entre 3 y 30 caracteres." },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { error: "No se encontró el usuario." },
        { status: 404 }
      );
    }

    const database = await getDatabase();
    const users = database.collection("users");

    const existingUser = await users.findOne({
      username: { $regex: `^${username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ese nombre de usuario ya está en uso." },
        { status: 409 }
      );
    }

    await users.updateOne(
      { _id: user._id },
      { $set: { username } }
    );

    return NextResponse.json({
      message: "Nombre de usuario actualizado correctamente.",
      username,
    });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el perfil." },
      { status: 500 }
    );
  }
}
