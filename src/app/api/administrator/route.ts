import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

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
/* const createClerkUser = async (data: any) => {
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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Request method: ${req.method}`); 
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  console.log("Request body:", req.body); // Log del cuerpo de la solicitud


  const { email, password, firstName, lastName, inviteCode } = req.body;

  // Validar que se pase un código de invitación
  if (!inviteCode) {
    return res.status(400).json({ message: "Código de invitación requerido" });
    
  }


  // Verificar que el código de invitación sea válido
  if (inviteCode !== process.env.ADMIN_INVITE_CODE) {
    return res.status(403).json({ message: "Código de invitación inválido" });
  }

  try {
    // Crear el usuario en Clerk con el rol de administrador
    const user = await createClerkUser({
      email_address: email,
      password,
      first_name: firstName,
      last_name: lastName,
      public_metadata: { role: "org:admin" },
    });
    console.log("Usuario creado:", user);
    return res.status(201).json({
      message: "Usuario creado exitosamente",
      user,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Error al crear usuario" });
  }
}
*/