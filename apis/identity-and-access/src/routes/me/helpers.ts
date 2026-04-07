export const toSafeIdentity = <
  T extends { hash: string; salt: string; totpSecret?: string | null },
>(
  identity: T,
) => {
  const { hash, salt, totpSecret, ...safe } = identity;
  return safe;
};
