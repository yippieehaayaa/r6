import type { BusinessCard, Prisma } from "@prisma/client";
import {
  type BusinessCardTheme,
  BusinessCardThemeSchema,
  type CardImageFormat,
  CardImageFormatSchema,
  type CardPrintSpec,
  CardPrintSpecSchema,
} from "@r6/schemas";
import { prisma, toInputJson, toRecord } from "../../shared/persistence";
import type { BusinessCardRecord } from "./business-cards.types";

interface CreateBusinessCardRecordInput {
  publicId: string;
  companyName: string;
  qrCodeId: string;
  issuedDate: Date;
  editionLabel: string;
  imageFormat: CardImageFormat;
  printSpec: CardPrintSpec;
  theme: BusinessCardTheme;
  companyLogoPngBuffer?: Buffer;
  metadata?: Record<string, unknown>;
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

function mapRecord(value: BusinessCard): BusinessCardRecord {
  return {
    id: value.publicId,
    companyName: value.companyName,
    qrCodeId: value.qrCodePublicId,
    issuedDate: value.issuedDate.toISOString(),
    createdAt: value.createdAt.toISOString(),
    editionLabel: value.editionLabel,
    imageFormat: CardImageFormatSchema.parse(value.imageFormat),
    printSpec: CardPrintSpecSchema.parse(value.printSpec),
    theme: BusinessCardThemeSchema.parse(value.theme),
    companyLogoPngBuffer: toBuffer(value.companyLogoPngBytes),
    metadata: toRecord(value.metadata),
  };
}

export class BusinessCardsRepository {
  async create(
    input: CreateBusinessCardRecordInput,
  ): Promise<BusinessCardRecord> {
    const created = await prisma.businessCard.create({
      data: {
        publicId: input.publicId,
        companyName: input.companyName,
        qrCode: {
          connect: {
            publicId: input.qrCodeId,
          },
        },
        issuedDate: input.issuedDate,
        editionLabel: input.editionLabel,
        imageFormat: input.imageFormat,
        printSpec: input.printSpec as Prisma.InputJsonValue,
        theme: input.theme as Prisma.InputJsonValue,
        companyLogoPngBytes: toPrismaBytes(input.companyLogoPngBuffer),
        metadata: toInputJson(input.metadata),
      },
    });

    return mapRecord(created);
  }

  async findById(id: string): Promise<BusinessCardRecord | null> {
    const record = await prisma.businessCard.findUnique({
      where: { publicId: id },
    });

    if (!record) {
      return null;
    }

    return mapRecord(record);
  }
}

export const businessCardsRepository = new BusinessCardsRepository();
