import type {
  DynamicQrMetadata,
  QrAssetQuery,
  QrImageFormat,
  QrOutputOptions,
} from "@r6/schemas";

export interface DynamicQrRecord {
  id: string;
  companyName: string;
  qrTargetUrl: string;
  profileLabel?: string;
  issuedDate: string;
  createdAt: string;
  updatedAt: string;
  logoPngBuffer?: Buffer;
  metadata?: Record<string, unknown>;
  outputDefaults: QrOutputOptions;
}

export interface QrAssetResult {
  bytes: Buffer;
  contentType: string;
  extension: "png" | "svg" | "pdf";
  fileName: string;
  format: QrImageFormat;
}

export interface QrAssetRequest extends QrAssetQuery {
  id: string;
}

export interface QrRecordContext {
  record: DynamicQrRecord;
  metadata: DynamicQrMetadata;
}
