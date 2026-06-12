// Reemplaza estos dos valores con los de tu dashboard:
// cloudinary.com → Settings → Upload Presets → "+ Add upload preset" (mode: Unsigned)
const CLOUD_NAME = 'diuaog5qb';
const UPLOAD_PRESET = 'jzxx6pk1';

export async function uploadImage(localUri: string): Promise<string> {
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', { uri: localUri, type: mime, name: `avatar.${ext}` } as any);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'oryon360/avatars');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Error Cloudinary (${res.status})`);
  }
  const data = await res.json();
  return data.secure_url as string;
}
