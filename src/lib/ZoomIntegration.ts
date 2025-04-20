const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID!;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET!;
const ZOOM_REDIRECT_URI = process.env.ZOOM_REDIRECT_URI!;

export default class ZoomIntegration {
  private authHeader = 'Basic ' + Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');

  async getAccessToken(code: string) {
    const res = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: ZOOM_REDIRECT_URI,
      }),
    });

    if (!res.ok) {
      throw new Error('Error al obtener el token');
    }

    return res.json();
  }

  async refreshAccessToken(refreshToken: string) {
    const res = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) {
      throw new Error('Error al refrescar el token');
    }

    return res.json();
  }

  async createMeeting(accessToken: string, meetingData: any) {
    const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingData),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error('Error al crear la reunión: ' + text);
    }

    return res.json();
  }

  async cancelMeeting(accessToken: string, meetingId: string) {
    const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error('Error al cancelar la reunión');
    }

    return true;
  }
}
