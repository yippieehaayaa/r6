import type {
  BusinessCardTheme,
  CardImageFormat,
  CardPrintSpec,
} from "@r6/schemas";

export interface BusinessCardRecord {
  id: string;
  companyName: string;
  issuedDate: string;
  createdAt: string;
  qrCodeId: string;
  editionLabel: string;
  imageFormat: CardImageFormat;
  printSpec: CardPrintSpec;
  theme: BusinessCardTheme;
  companyLogoPngBuffer?: Buffer;
  metadata?: Record<string, unknown>;
}

export interface BusinessCardImageResult {
  bytes: Buffer;
  contentType: string;
  extension: "png" | "webp";
  fileName: string;
  widthPx: number;
  heightPx: number;
}

export interface BusinessCardPdfResult {
  bytes: Buffer;
  contentType: "application/pdf";
  extension: "pdf";
  fileName: string;
}

export interface CardPixelDimensions {
  widthPx: number;
  heightPx: number;
  safeMarginPx: number;
  bleedPx: number;
}
