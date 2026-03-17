import {
  type CreateDynamicQr,
  type DynamicQrMetadata,
  type DynamicQrResponse,
  DynamicQrResponseSchema,
  type QrAssetQuery,
  QrOutputOptionsSchema,
  type UpdateDynamicQrTarget,
} from "@r6/schemas";
import QRCode from "qrcode";
import sharp from "sharp";
import { env } from "../../config";
import { BadRequestError, NotFoundError } from "../../shared/errors";
import {
  normalizeLogoSourceToPngBuffer,
  toDataUrl,
} from "../../utils/image-source";
import { createPngPdf } from "../../utils/pdf";
import { slugify } from "../../utils/text";
import {
  type QrCodesRepository,
  qrCodesRepository,
} from "./qr-codes.repository";
import type {
  DynamicQrRecord,
  QrAssetResult,
  QrRecordContext,
} from "./qr-codes.types";

function nowIsoString(): string {
  return new Date().toISOString();
}

function injectLogoIntoSvg(
  svgContent: string,
  logoDataUrl: string,
  sizePx: number,
): string {
  const logoSize = Math.max(64, Math.round(sizePx * 0.24));
  const framePadding = Math.round(logoSize * 0.2);
  const frameSize = logoSize + framePadding * 2;
  const frameX = Math.round((sizePx - frameSize) / 2);
  const frameY = Math.round((sizePx - frameSize) / 2);
  const logoX = Math.round((sizePx - logoSize) / 2);
  const logoY = Math.round((sizePx - logoSize) / 2);

  const overlay = [
    `<rect x="${frameX}" y="${frameY}" width="${frameSize}" height="${frameSize}"`,
    'rx="16" ry="16" fill="white" stroke="#E3E7EE" stroke-width="2" />',
    `<image href="${logoDataUrl}" x="${logoX}" y="${logoY}"`,
    `width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" />`,
  ].join(" ");

  return svgContent.replace("</svg>", `${overlay}</svg>`);
}

async function embedLogoIntoPng(
  qrBuffer: Buffer,
  logoPngBuffer: Buffer,
  sizePx: number,
): Promise<Buffer> {
  const logoSize = Math.max(64, Math.round(sizePx * 0.24));
  const framePadding = Math.round(logoSize * 0.2);
  const frameSize = logoSize + framePadding * 2;

  const frameSvg = Buffer.from(
    `<svg width="${frameSize}" height="${frameSize}" viewBox="0 0 ${frameSize} ${frameSize}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${frameSize}" height="${frameSize}" rx="16" ry="16" fill="white"/>
      <rect x="1.5" y="1.5" width="${frameSize - 3}" height="${frameSize - 3}" rx="15" ry="15" fill="none" stroke="#DEE4EC" stroke-width="3"/>
    </svg>`,
  );

  const logoBuffer = await sharp(logoPngBuffer)
    .resize(logoSize, logoSize, { fit: "contain" })
    .png()
    .toBuffer();

  return sharp(qrBuffer)
    .composite([
      { input: frameSvg, gravity: "center" },
      { input: logoBuffer, gravity: "center" },
    ])
    .png()
    .toBuffer();
}

export class QrCodesService {
  constructor(
    private readonly repository: QrCodesRepository = qrCodesRepository,
  ) {}

  async create(input: CreateDynamicQr): Promise<DynamicQrResponse> {
    const createdAt = nowIsoString();
    const outputDefaults = QrOutputOptionsSchema.parse(input.output ?? {});

    const logoPngBuffer = input.logo
      ? await normalizeLogoSourceToPngBuffer(input.logo, {
          maxBytes: env.LOGO_MAX_BYTES,
          timeoutMs: env.REMOTE_LOGO_TIMEOUT_MS,
        })
      : undefined;

    const record = await this.repository.create({
      companyName: input.companyName.trim(),
      qrTargetUrl: input.qrTargetUrl,
      profileLabel: input.profileLabel,
      issuedDate: new Date(input.issuedDate ?? createdAt),
      logoPngBuffer,
      metadata: input.metadata,
      outputDefaults,
    });

    return this.toResponse(record);
  }

  async getMetadata(id: string): Promise<DynamicQrResponse> {
    const record = await this.requireRecord(id);
    return this.toResponse(record);
  }

  async updateTarget(
    id: string,
    input: UpdateDynamicQrTarget,
  ): Promise<DynamicQrResponse> {
    const updatedRecord = await this.repository.updateTarget(
      id,
      input.qrTargetUrl,
    );

    if (!updatedRecord) {
      throw new NotFoundError(`QR code "${id}" was not found`);
    }

    return this.toResponse(updatedRecord);
  }

  async getRedirectTarget(id: string): Promise<string> {
    const record = await this.requireRecord(id);
    return record.qrTargetUrl;
  }

  async has(id: string): Promise<boolean> {
    return this.repository.exists(id);
  }

  async getRecordContext(id: string): Promise<QrRecordContext> {
    const record = await this.requireRecord(id);
    return {
      record,
      metadata: this.toMetadata(record),
    };
  }

  async getPngBuffer(
    id: string,
    options: Pick<QrAssetQuery, "sizePx" | "margin">,
  ): Promise<Buffer> {
    const record = await this.requireRecord(id);
    const sizePx = options.sizePx ?? record.outputDefaults.sizePx;
    const margin = options.margin ?? record.outputDefaults.margin;
    return this.renderPng(record, sizePx, margin);
  }

  async getAsset(id: string, query: QrAssetQuery): Promise<QrAssetResult> {
    const record = await this.requireRecord(id);
    const format = query.format ?? record.outputDefaults.format;
    const sizePx = query.sizePx ?? record.outputDefaults.sizePx;
    const margin = query.margin ?? record.outputDefaults.margin;

    const baseName = `${slugify(record.companyName)}-qr-${record.id.slice(0, 8)}`;

    if (format === "PNG") {
      return {
        bytes: await this.renderPng(record, sizePx, margin),
        contentType: "image/png",
        extension: "png",
        fileName: `${baseName}.png`,
        format,
      };
    }

    if (format === "SVG") {
      const svg = await this.renderSvg(record, sizePx, margin);
      return {
        bytes: Buffer.from(svg, "utf-8"),
        contentType: "image/svg+xml",
        extension: "svg",
        fileName: `${baseName}.svg`,
        format,
      };
    }

    if (format === "PDF") {
      const pngBuffer = await this.renderPng(record, sizePx, margin);
      const inches = Math.max(sizePx / 300, 1);
      const pdfBuffer = await createPngPdf({
        pngBuffer,
        widthInches: inches,
        heightInches: inches,
        title: `${record.companyName} QR`,
      });

      return {
        bytes: pdfBuffer,
        contentType: "application/pdf",
        extension: "pdf",
        fileName: `${baseName}.pdf`,
        format,
      };
    }

    throw new BadRequestError(`Unsupported QR format: ${format}`);
  }

  private buildQrPayloadUrl(id: string): string {
    return `${env.PUBLIC_BASE_URL}/r/${id}`;
  }

  private async requireRecord(id: string): Promise<DynamicQrRecord> {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundError(`QR code "${id}" was not found`);
    }

    return record;
  }

  private toMetadata(record: DynamicQrRecord): DynamicQrMetadata {
    return {
      id: record.id,
      companyName: record.companyName,
      qrTargetUrl: record.qrTargetUrl,
      qrPayloadUrl: this.buildQrPayloadUrl(record.id),
      profileLabel: record.profileLabel,
      issuedDate: record.issuedDate,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      logoIncluded: Boolean(record.logoPngBuffer),
      outputDefaults: record.outputDefaults,
      metadata: record.metadata,
    };
  }

  private toResponse(record: DynamicQrRecord): DynamicQrResponse {
    return DynamicQrResponseSchema.parse({
      data: this.toMetadata(record),
      links: {
        self: `${env.PUBLIC_BASE_URL}/v1/qr-codes/${record.id}`,
        resolve: this.buildQrPayloadUrl(record.id),
        asset: `${env.PUBLIC_BASE_URL}/v1/qr-codes/${record.id}/asset`,
      },
    });
  }

  private async renderPng(
    record: DynamicQrRecord,
    sizePx: number,
    margin: number,
  ): Promise<Buffer> {
    const qrBuffer = await QRCode.toBuffer(this.buildQrPayloadUrl(record.id), {
      type: "png",
      width: sizePx,
      margin,
      errorCorrectionLevel: record.outputDefaults.errorCorrectionLevel,
      color: {
        dark: "#111827",
        light: "#FFFFFFFF",
      },
    });

    if (!record.logoPngBuffer) {
      return qrBuffer;
    }

    return embedLogoIntoPng(qrBuffer, record.logoPngBuffer, sizePx);
  }

  private async renderSvg(
    record: DynamicQrRecord,
    sizePx: number,
    margin: number,
  ): Promise<string> {
    const svg = await QRCode.toString(this.buildQrPayloadUrl(record.id), {
      type: "svg",
      width: sizePx,
      margin,
      errorCorrectionLevel: record.outputDefaults.errorCorrectionLevel,
      color: {
        dark: "#111827",
        light: "#FFFFFFFF",
      },
    });

    if (!record.logoPngBuffer) {
      return svg;
    }

    return injectLogoIntoSvg(
      svg,
      toDataUrl(record.logoPngBuffer, "image/png"),
      sizePx,
    );
  }
}

export const qrCodesService = new QrCodesService();
