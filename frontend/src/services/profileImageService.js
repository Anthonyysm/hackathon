import { auth } from '../firebase';

class ProfileImageService {
  async uploadProfilePhoto(file, backendUserId, idToken) {
    if (!file) throw new Error('Arquivo inválido');
    if (!backendUserId) throw new Error('ID de usuário do backend ausente');
    const form = new FormData();
    form.append('photo', file);

    const apiBase = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : 'http://localhost:8000';

    const resp = await fetch(`${apiBase}/api/update/${backendUserId}/`, {
      method: 'PUT',
      headers: {
        Authorization: idToken ? `Bearer ${idToken}` : undefined
      },
      body: form
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Falha no upload: ${resp.status} ${txt}`);
    }
    return true;
  }
}

export const profileImageService = new ProfileImageService();
