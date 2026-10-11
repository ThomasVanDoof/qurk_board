
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
        { status: 401 },
      );
    }

    const user = await findUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "No se encontró el usuario." }, { status: 404 });
    }

    return NextResponse.json({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt ?? null,
    });
  } catch (error) {
    console.error("Error al obtener el perfil:", error);

    return NextResponse.json({ error: "No se pudo cargar el perfil." }, { status: 500 });
  }
}
