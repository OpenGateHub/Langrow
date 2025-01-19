import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, phone, email, message } = await req.json();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", 
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "hubopengate@gmail.com", 
      subject: `Nuevo mensaje de contacto de ${name}`,
      text: `
        Nombre: ${name}
        Teléfono: ${phone}
        Correo: ${email}
        Mensaje: ${message}
      `,
    };
    await transporter.verify((error, success) => {
        if (error) {
          console.error("Error al verificar el transporte:", error);
        } else {
          console.log("El servidor de correo está listo para enviar mensajes.");
        }
      });
      

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Correo enviado con éxito" });
  } catch (error: any) {
    console.error("Error enviando el correo:", error);
    return NextResponse.json(
      { success: false, message: `Error enviando el correo: ${error.message}` },
      { status: 500 }
    );
  }
}
