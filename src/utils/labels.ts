import { Account, CreditCard } from '../types';

// El usuario puede poner cualquier cosa en "nombre" (incluyendo su propio
// nombre) — para identificar la cuenta/tarjeta en la UI se prefiere el banco,
// que es lo que realmente la distingue. Las cuentas de efectivo no tienen
// banco, así que caen de vuelta al nombre.
export function accountLabel(account: Account): string {
  return account.bank || account.name;
}

export function cardLabel(card: CreditCard): string {
  return card.bank;
}
