import { type DynamicQr, Prisma } from "@prisma/client";
import { type QrOutputOptions, QrOutputOptionsSchema } from "@r6/schemas";
import { prisma, toInputJson, toRecord } from "../../shared/persistence";
import type { DynamicQrRecord } from "./qr-codes.types";

interface CreateDynamicQrRecordInput {
  companyName: string;
  qrTargetUrl: string;
  profileLabel?: string;
  issuedDate: Date;
  logoPngBuffer?: Buffer;
  metadata?: Record<string, unknown>;
  outputDefaults: QrOutputOptions;
}

function toBuffer(value: Uint8Array | null): Buffer | undefined {
  if (!value) {
    return undefined;
  }

  return Buffer.from(value);
}

function toPrismaBytes(
  value: Buffer | undefined,
): Uint8Array<ArrayBuffer> | undefined {
  if (!value) {
    return undefined;
  }

  const bytes = new Uint8Array(value.byteLength);
  bytes.set(value);
  return bytes;
}

function toPrismaJson(value: QrOutputOptions): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function mapRecord(value: DynamicQr): DynamicQrRecord {
  return {
    id: value.publicId,
    companyName: value.companyName,
    qrTargetUrl: value.qrTargetUrl,
    profileLabel: value.profileLabel ?? undefined,
    issuedDate: value.issuedDate.toISOString(),
    createdAt: value.createdAt.toISOString(),
    updatedAt: value.updatedAt.toISOString(),
    logoPngBuffer: toBuffer(value.logoPngBytes),
    metadata: toRecord(value.metadata),
    outputDefaults: QrOutputOptionsSchema.parse(value.outputDefaults),
  };
}

export class QrCodesRepository {
  async create(input: CreateDynamicQrRecordInput): Promise<DynamicQrRecord> {
    const created = await prisma.dynamicQr.create({
      data: {
        companyName: input.companyName,
        qrTargetUrl: input.qrTargetUrl,
        profileLabel: input.profileLabel,
        issuedDate: input.issuedDate,
        logoPngBytes: toPrismaBytes(input.logoPngBuffer),
        metadata: toInputJson(input.metadata),
        outputDefaults: toPrismaJson(input.outputDefaults),
      },
    });

    return mapRecord(created);
  }

  async findById(id: string): Promise<DynamicQrRecord | null> {
    const record = await prisma.dynamicQr.findUnique({
      where: { publicId: id },
    });

    if (!record) {
      return null;
    }

    return mapRecord(record);
  }

  async updateTarget(
    id: string,
    qrTargetUrl: string,
  ): Promise<DynamicQrRecord | null> {
    try {
      const updated = await prisma.dynamicQr.update({
        where: { publicId: id },
        data: { qrTargetUrl },
      });

      return mapRecord(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return null;
      }

      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    const record = await prisma.dynamicQr.findUnique({
      where: { publicId: id },
      select: { id: true },
    });

    return Boolean(record);
  }
}

export const qrCodesRepository = new QrCodesRepository();
