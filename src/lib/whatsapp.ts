/**
 * Link de WhatsApp a partir de um contato digitado livremente
 * (aceita "(81) 9 9999-0000", "81999990000", "+55 81 99999-0000"…).
 */
export function linkWhatsApp(
  contato?: string,
  mensagem?: string,
): string | null {
  if (!contato) return null;
  const digitos = contato.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  const numero = digitos.startsWith("55") ? digitos : `55${digitos}`;
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${numero}${texto}`;
}

/** Texto legível do contato (telefone ou e-mail), sem virar link quando vazio. */
export function ehEmail(contato?: string): boolean {
  return !!contato && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contato.trim());
}
