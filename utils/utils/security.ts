
// Utilidad de seguridad para no almacenar contraseñas en texto plano
// Usa SHA-256 para hashear los PINs

export const hashPin = async (pin: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const verifyPin = async (inputPin: string, storedPin: string | undefined): Promise<boolean> => {
  if (!storedPin) return false; // Fail safe if config is missing
  
  // Backwards compatibility: Si el PIN almacenado es corto (ej: "1234"), es legacy (texto plano).
  // Los hashes SHA-256 son de 64 caracteres.
  if (storedPin.length < 10) {
    return inputPin === storedPin;
  }
  
  const hashedInput = await hashPin(inputPin);
  return hashedInput === storedPin;
};
