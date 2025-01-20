import { NextResponse } from "next/server";

const createClerkUser = async (data: any) => {
  const response = await fetch("https://api.clerk.dev/v1/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error al crear usuario: ${response.statusText}`);
  }

  return await response.json();
};

export async function POST(req: Request) {
  const { email, password, firstName, lastName, inviteCode } = await req.json();

  if (!inviteCode) {
    return NextResponse.json(
      { message: "Código de invitación requerido" },
      { status: 400 }
    );
  }

  if (inviteCode !== process.env.ADMIN_INVITE_CODE) {
    return NextResponse.json(
      { message: "Código de invitación inválido" },
      { status: 403 }
    );
  }

  try {
    const user = await createClerkUser({
      email_address: email,
      password,
      first_name: firstName,
      last_name: lastName,
      public_metadata: { role: "org:admin" },
    });

    return NextResponse.json(
      { message: "Usuario creado exitosamente", user },
      { status: 201 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
