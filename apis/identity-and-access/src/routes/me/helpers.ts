export const toSafeIdentity = <T extends { hash: string; salt: string }>(
  identity: T,
) => {
  const { hash, salt, ...safe } = identity;
  return safe;
};
