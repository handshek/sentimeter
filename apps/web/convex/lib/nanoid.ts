const DEFAULT_ALPHABET =
  "_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function nanoid(size: number) {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error("nanoid: size must be a positive integer");
  }

  const bytes = crypto.getRandomValues(new Uint8Array(size));
  let id = "";
  for (let i = 0; i < size; i++) {
    const byte = bytes[i]!;
    id += DEFAULT_ALPHABET.charAt(byte & 63);
  }
  return id;
}
