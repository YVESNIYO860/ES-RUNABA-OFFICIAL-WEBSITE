const normalizeAccessKey = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

export const createResourceAccessKey = async () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const token = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  const code = `RUN-${token.match(/.{1,4}/g).join('-')}`;
  const hash = await hashResourceAccessKey(code);
  return { code, hash };
};

export const hashResourceAccessKey = async (value) => {
  const normalized = normalizeAccessKey(value);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
};

export const verifyResourceAccessKey = async (resource, value) => {
  const expectedHash = resource?.accessKeyHash || resource?.paperSettings?.accessKeyHash || '';
  if (!expectedHash) return true;
  if (!normalizeAccessKey(value)) return false;
  return (await hashResourceAccessKey(value)) === expectedHash;
};