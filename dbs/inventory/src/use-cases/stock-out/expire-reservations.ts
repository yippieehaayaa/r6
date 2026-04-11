import { prisma } from "../../client.js";
import type { ExpireReservationsResult } from "./types.js";

const expireReservations = async (): Promise<ExpireReservationsResult> => {
  const now = new Date();

  const expiredReservations = await prisma.stockReservation.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: now },
    },
  });

  const expired: ExpireReservationsResult["expired"] = [];

  for (const reservation of expiredReservations) {
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.stockReservation.findUnique({
        where: { id: reservation.id },
      });
      if (!current || current.status !== "ACTIVE") {
        return null;
      }

      const updatedReservation = await tx.stockReservation.update({
        where: { id: reservation.id },
        data: {
          status: "EXPIRED",
          releasedAt: now,
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          tenantId: reservation.tenantId,
          type: "RESERVATION_RELEASE",
          quantity: reservation.quantity,
          referenceId: reservation.referenceId,
          referenceType: reservation.referenceType,
          performedBy: "SYSTEM",
          variantId: reservation.variantId,
          warehouseId: reservation.warehouseId,
        },
      });

      if (!current.tenantId) {
        throw new Error(`Reservation ${reservation.id} has no tenantId`);
      }

      const inventoryItem = await tx.inventoryItem.update({
        where: {
          tenantId_variantId_warehouseId: {
            tenantId: current.tenantId,
            variantId: reservation.variantId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: { quantityReserved: { decrement: reservation.quantity } },
      });

      return { reservation: updatedReservation, movement, inventoryItem };
    });

    if (result) {
      expired.push(result);
    }
  }

  return { expired };
};

export { expireReservations };
