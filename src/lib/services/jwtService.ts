import jwt from "jsonwebtoken";

interface JwtPayload {
  data: Record<string, string>; // valores cifrados
  jti: string; // ID único del token
  iat: number;
  exp: number;
}

export class JwtService {
  private readonly secret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    // Asegurarse de que el secreto esté configurado
    // Esto es importante para la seguridad del JWT
    if (!secret) throw new Error("JWT_SECRET is required");
    this.secret = secret;
  }

  sign(data: Record<string, string>, expiresInSeconds: number = 15000000): string {
    const payload: Partial<JwtPayload> = {
      data,
      jti: crypto.randomUUID(),
    };

    return jwt.sign(payload, this.secret, {
      algorithm: "HS256",
      expiresIn: expiresInSeconds,
    });
  }

  verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return decoded;
    } catch (err) {
      throw new Error("Invalid or expired JWT token");
    }
  }
}
