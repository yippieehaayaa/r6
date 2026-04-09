import { DamageRecordNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getDamage = async (id: string) => {
  const record = await prisma.stockMovement.findFirst({
    where: { id, type: "DAMAGE" },
  });

  if (!record) throw new DamageRecordNotFoundError();

  return record;
};

export default getDamage;
