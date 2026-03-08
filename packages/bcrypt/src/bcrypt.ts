import bcrypt from "bcrypt";

export const generateSalt = async (rounds: number | undefined = 10) => {
  return await bcrypt.genSalt(rounds);
};

export const generateHash = async (password: string, salt: string | number) => {
  return await bcrypt.hash(password, salt);
};

export const encryptPassword = async (password: string) => {
  const salt = await generateSalt();
  const hash = await generateHash(password, salt);
  return { salt, hash };
};

export const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
