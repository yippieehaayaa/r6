import { randomUUID } from "node:crypto";
import {
  type BusinessCardImageQuery,
  type BusinessCardPdfQuery,
  type BusinessCardResponse,
  BusinessCardResponseSchema,
  BusinessCardThemeSchema,
  type CardImageFormat,
  CardPrintSpecSchema,
  type CreateBusinessCard,
} from "@r6/schemas";
import sharp from "sharp";
import { env } from "../../config";
import { BadRequestError, NotFoundError } from "../../shared/errors";
import {
  normalizeLogoSourceToPngDataUrl,
  toDataUrl,
} from "../../utils/image-source";
import { createPngPdf } from "../../utils/pdf";
import { escapeXml, slugify } from "../../utils/text";
import { qrCodesService } from "../qr-codes";
import { BusinessCardsStore } from "./business-cards.store";
import { resolveBusinessCardTheme } from "./business-cards.theme";
import type {
  BusinessCardImageResult,
  BusinessCardPdfResult,
  BusinessCardRecord,
  CardPixelDimensions,
} from "./business-cards.types";

function nowIsoString(): string {
  return new Date().toISOString();
}

function toCardDimensions(
  spec: BusinessCardRecord["printSpec"],
): CardPixelDimensions {
  let widthPx = Math.round(spec.widthInches * spec.dpi);
  let heightPx = Math.round(spec.heightInches * spec.dpi);

  if (spec.orientation === "PORTRAIT" && widthPx > heightPx) {
    [widthPx, heightPx] = [heightPx, widthPx];
  }

  if (spec.orientation === "LANDSCAPE" && widthPx < heightPx) {
    [widthPx, heightPx] = [heightPx, widthPx];
  }

  return {
    widthPx,
    heightPx,
    safeMarginPx: Math.max(Math.round(spec.safeMarginInches * spec.dpi), 18),
    bleedPx: Math.max(Math.round(spec.bleedInches * spec.dpi), 0),
  };
}

function formatIssuedDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(isoDate));
}

function shortUrlLabel(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return rawUrl;
  }
}

function monogramFromCompanyName(companyName: string): string {
  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);

  return initials || "R6";
}

interface BuildCardSvgParams {
  record: BusinessCardRecord;
  dimensions: CardPixelDimensions;
  qrDataUrl: string;
  qrPayloadUrl: string;
}

function buildLuxuryCardSvg(params: BuildCardSvgParams): string {
  const { record, dimensions, qrDataUrl, qrPayloadUrl } = params;

  const theme = resolveBusinessCardTheme(
    record.theme,
    `${record.companyName}:${record.id}`,
  );

  const shimmerX = Math.round(
    dimensions.widthPx * (0.18 + theme.shimmerPhase * 0.66),
  );
  const qrPanelSize = Math.round(
    Math.min(dimensions.heightPx * 0.56, dimensions.widthPx * 0.34),
  );
  const qrPanelX = dimensions.widthPx - dimensions.safeMarginPx - qrPanelSize;
  const qrPanelY = Math.round((dimensions.heightPx - qrPanelSize) / 2);
  const qrInnerPadding = Math.max(Math.round(qrPanelSize * 0.14), 20);
  const qrImageSize = qrPanelSize - qrInnerPadding * 2;

  const logoPanelSize = Math.round(dimensions.heightPx * 0.22);
  const titleX = dimensions.safeMarginPx + logoPanelSize + 24;
  const titleY = dimensions.safeMarginPx + Math.round(logoPanelSize * 0.54);
  const maxLeftWidth = qrPanelX - dimensions.safeMarginPx - 28;

  const issuedLabel = `Issued ${formatIssuedDate(record.issuedDate)}`;
  const mintedLabel = `Created ${formatIssuedDate(record.createdAt)}`;
  const urlLabel = shortUrlLabel(qrPayloadUrl);
  const monogram = monogramFromCompanyName(record.companyName);

  const logoMarkup = record.companyLogoPngDataUrl
    ? `<image href="${record.companyLogoPngDataUrl}" x="${dimensions.safeMarginPx + 18}" y="${dimensions.safeMarginPx + 18}" width="${logoPanelSize - 36}" height="${logoPanelSize - 36}" preserveAspectRatio="xMidYMid meet" />`
    : `<text x="${dimensions.safeMarginPx + logoPanelSize / 2}" y="${dimensions.safeMarginPx + logoPanelSize / 2 + 8}" text-anchor="middle" fill="${theme.palette.textPrimary}" style="font: 700 ${Math.round(logoPanelSize * 0.28)}px 'Avenir Next', 'Segoe UI', sans-serif; letter-spacing: 1px;">${escapeXml(monogram)}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.widthPx}" height="${dimensions.heightPx}" viewBox="0 0 ${dimensions.widthPx} ${dimensions.heightPx}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.palette.backgroundStart}" />
      <stop offset="100%" stop-color="${theme.palette.backgroundEnd}" />
    </linearGradient>
    <linearGradient id="foilGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.palette.metallic}" stop-opacity="${0.08 + theme.metallicStrength * 0.16}" />
      <stop offset="50%" stop-color="${theme.palette.accent}" stop-opacity="${0.1 + theme.holographicShift * 0.3}" />
      <stop offset="100%" stop-color="${theme.palette.metallic}" stop-opacity="${0.05 + theme.metallicStrength * 0.18}" />
    </linearGradient>
    <radialGradient id="glowGradient" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${theme.palette.glow}" stop-opacity="${0.15 + theme.glossStrength * 0.25}" />
      <stop offset="100%" stop-color="${theme.palette.glow}" stop-opacity="0" />
    </radialGradient>
    <filter id="noise" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" type="fractalNoise"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.035"/>
      </feComponentTransfer>
    </filter>
    <linearGradient id="panelStroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.palette.textSecondary}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${theme.palette.metallic}" stop-opacity="0.2"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="${dimensions.widthPx}" height="${dimensions.heightPx}" rx="34" fill="url(#bgGradient)" />
  <rect x="0" y="0" width="${dimensions.widthPx}" height="${dimensions.heightPx}" rx="34" fill="url(#foilGradient)" />
  <circle cx="${shimmerX}" cy="${Math.round(dimensions.heightPx * 0.26)}" r="${Math.round(dimensions.heightPx * 0.48)}" fill="url(#glowGradient)" />
  <rect x="0" y="0" width="${dimensions.widthPx}" height="${dimensions.heightPx}" rx="34" filter="url(#noise)" />

  <rect
    x="${dimensions.safeMarginPx}"
    y="${dimensions.safeMarginPx}"
    width="${logoPanelSize}"
    height="${logoPanelSize}"
    rx="${Math.round(logoPanelSize * 0.22)}"
    fill="${theme.palette.panelBackground}"
    stroke="url(#panelStroke)"
    stroke-width="2.2"
  />
  ${logoMarkup}

  <text x="${titleX}" y="${titleY}" fill="${theme.palette.textPrimary}" style="font: 700 ${Math.round(dimensions.heightPx * 0.11)}px 'Avenir Next', 'Helvetica Neue', sans-serif; letter-spacing: 0.5px;" textLength="${maxLeftWidth}" lengthAdjust="spacingAndGlyphs">${escapeXml(record.companyName)}</text>
  <text x="${titleX}" y="${titleY + Math.round(dimensions.heightPx * 0.12)}" fill="${theme.palette.textSecondary}" style="font: 500 ${Math.round(dimensions.heightPx * 0.04)}px 'Avenir Next', 'Segoe UI', sans-serif; letter-spacing: 1.2px;">NFT-INSPIRED DIGITAL BUSINESS CARD</text>

  <text x="${dimensions.safeMarginPx}" y="${dimensions.heightPx - dimensions.safeMarginPx - Math.round(dimensions.heightPx * 0.12)}" fill="${theme.palette.textSecondary}" style="font: 500 ${Math.round(dimensions.heightPx * 0.04)}px 'Avenir Next', 'Segoe UI', sans-serif; letter-spacing: 0.9px;">${escapeXml(issuedLabel)}</text>
  <text x="${dimensions.safeMarginPx}" y="${dimensions.heightPx - dimensions.safeMarginPx - Math.round(dimensions.heightPx * 0.065)}" fill="${theme.palette.textSecondary}" style="font: 500 ${Math.round(dimensions.heightPx * 0.033)}px 'Avenir Next', 'Segoe UI', sans-serif; letter-spacing: 0.8px;">${escapeXml(mintedLabel)}</text>
  <text x="${dimensions.safeMarginPx}" y="${dimensions.heightPx - dimensions.safeMarginPx - Math.round(dimensions.heightPx * 0.015)}" fill="${theme.palette.textPrimary}" style="font: 600 ${Math.round(dimensions.heightPx * 0.036)}px 'Avenir Next', 'Segoe UI', sans-serif; letter-spacing: 1.2px;">${escapeXml(record.editionLabel)}</text>

  <rect
    x="${qrPanelX}"
    y="${qrPanelY}"
    width="${qrPanelSize}"
    height="${qrPanelSize}"
    rx="${Math.round(qrPanelSize * 0.12)}"
    fill="${theme.palette.panelBackground}"
    stroke="url(#panelStroke)"
    stroke-width="2.8"
  />
  <rect
    x="${qrPanelX + qrInnerPadding * 0.45}"
    y="${qrPanelY + qrInnerPadding * 0.45}"
    width="${qrPanelSize - qrInnerPadding * 0.9}"
    height="${qrPanelSize - qrInnerPadding * 0.9}"
    rx="${Math.round(qrPanelSize * 0.1)}"
    fill="#ffffff"
    opacity="0.96"
  />
  <image
    href="${qrDataUrl}"
    x="${qrPanelX + qrInnerPadding}"
    y="${qrPanelY + qrInnerPadding}"
    width="${qrImageSize}"
    height="${qrImageSize}"
    preserveAspectRatio="xMidYMid meet"
  />
  <text x="${qrPanelX + qrPanelSize / 2}" y="${qrPanelY + qrPanelSize + Math.round(dimensions.heightPx * 0.055)}" text-anchor="middle" fill="${theme.palette.textSecondary}" style="font: 500 ${Math.round(dimensions.heightPx * 0.028)}px 'Avenir Next', 'Segoe UI', sans-serif; letter-spacing: 0.7px;">${escapeXml(urlLabel)}</text>
</svg>`;
}

interface CardRasterResult {
  buffer: Buffer;
  widthPx: number;
  heightPx: number;
  bleedColor: string;
}

export class BusinessCardsService {
  private readonly store = new BusinessCardsStore(env.STORE_MAX_RECORDS);

  async create(input: CreateBusinessCard): Promise<BusinessCardResponse> {
    const createdAt = nowIsoString();
    const printSpec = CardPrintSpecSchema.parse(input.printSpec ?? {});
    const theme = BusinessCardThemeSchema.parse(input.theme ?? {});

    let qrCodeId = input.qrCodeId;
    if (!qrCodeId) {
      if (!input.qrTargetUrl) {
        throw new BadRequestError("Either qrCodeId or qrTargetUrl is required");
      }

      const qrResponse = await qrCodesService.create({
        companyName: input.companyName,
        qrTargetUrl: input.qrTargetUrl,
        logo: input.qrLogo ?? input.companyLogo,
        output: input.qrOutput,
        issuedDate: input.issuedDate,
        metadata: {
          ...(input.metadata ?? {}),
          generatedBy: "business-card-flow",
        },
      });

      qrCodeId = qrResponse.data.id;
    }

    if (!qrCodesService.has(qrCodeId)) {
      throw new NotFoundError(`QR code "${qrCodeId}" was not found`);
    }

    const recordId = randomUUID();
    const companyLogoPngDataUrl = input.companyLogo
      ? await normalizeLogoSourceToPngDataUrl(input.companyLogo, {
          maxBytes: env.LOGO_MAX_BYTES,
          timeoutMs: env.REMOTE_LOGO_TIMEOUT_MS,
        })
      : undefined;

    const record: BusinessCardRecord = {
      id: recordId,
      companyName: input.companyName.trim(),
      issuedDate: input.issuedDate ?? createdAt,
      createdAt,
      qrCodeId,
      editionLabel:
        input.editionLabel ?? `Edition ${recordId.slice(0, 8).toUpperCase()}`,
      imageFormat: input.imageFormat,
      printSpec,
      theme,
      companyLogoPngDataUrl,
      metadata: input.metadata,
    };

    this.store.save(record);
    return this.toResponse(record);
  }

  getMetadata(id: string): BusinessCardResponse {
    const record = this.requireRecord(id);
    return this.toResponse(record);
  }

  async getImageAsset(
    id: string,
    query: BusinessCardImageQuery,
  ): Promise<BusinessCardImageResult> {
    const record = this.requireRecord(id);
    const imageFormat = query.format ?? record.imageFormat;
    const raster = await this.renderCardRaster(record, imageFormat, false);

    const baseName = `${slugify(record.companyName)}-card-${record.id.slice(0, 8)}`;

    if (imageFormat === "WEBP") {
      const webpBuffer = await sharp(raster.buffer)
        .webp({ quality: 96, alphaQuality: 100 })
        .toBuffer();

      return {
        bytes: webpBuffer,
        contentType: "image/webp",
        extension: "webp",
        fileName: `${baseName}.webp`,
        widthPx: raster.widthPx,
        heightPx: raster.heightPx,
      };
    }

    return {
      bytes: raster.buffer,
      contentType: "image/png",
      extension: "png",
      fileName: `${baseName}.png`,
      widthPx: raster.widthPx,
      heightPx: raster.heightPx,
    };
  }

  async getPdfAsset(
    id: string,
    query: BusinessCardPdfQuery,
  ): Promise<BusinessCardPdfResult> {
    const record = this.requireRecord(id);
    const raster = await this.renderCardRaster(
      record,
      "PNG",
      query.includeBleed,
    );

    const widthInches = raster.widthPx / record.printSpec.dpi;
    const heightInches = raster.heightPx / record.printSpec.dpi;
    const pdfBuffer = await createPngPdf({
      pngBuffer: raster.buffer,
      widthInches,
      heightInches,
      title: `${record.companyName} premium business card`,
    });

    return {
      bytes: pdfBuffer,
      contentType: "application/pdf",
      extension: "pdf",
      fileName: `${slugify(record.companyName)}-card-${record.id.slice(0, 8)}.pdf`,
    };
  }

  private requireRecord(id: string): BusinessCardRecord {
    const record = this.store.get(id);
    if (!record) {
      throw new NotFoundError(`Business card "${id}" was not found`);
    }

    return record;
  }

  private toResponse(record: BusinessCardRecord): BusinessCardResponse {
    const qrContext = qrCodesService.getRecordContext(record.qrCodeId);

    return BusinessCardResponseSchema.parse({
      data: {
        id: record.id,
        companyName: record.companyName,
        qrCodeId: record.qrCodeId,
        qrPayloadUrl: qrContext.metadata.qrPayloadUrl,
        issuedDate: record.issuedDate,
        createdAt: record.createdAt,
        editionLabel: record.editionLabel,
        imageFormat: record.imageFormat,
        printSpec: record.printSpec,
        theme: record.theme,
        logoIncluded: Boolean(record.companyLogoPngDataUrl),
        metadata: record.metadata,
      },
      links: {
        self: `${env.PUBLIC_BASE_URL}/v1/business-cards/${record.id}`,
        image: `${env.PUBLIC_BASE_URL}/v1/business-cards/${record.id}/image`,
        pdf: `${env.PUBLIC_BASE_URL}/v1/business-cards/${record.id}/pdf`,
      },
    });
  }

  private async renderCardRaster(
    record: BusinessCardRecord,
    format: CardImageFormat,
    includeBleed: boolean,
  ): Promise<CardRasterResult> {
    const dimensions = toCardDimensions(record.printSpec);
    const qrSizePx = Math.max(
      Math.round(
        Math.min(dimensions.heightPx * 0.36, dimensions.widthPx * 0.24),
      ),
      220,
    );
    const qrBuffer = await qrCodesService.getPngBuffer(record.qrCodeId, {
      sizePx: qrSizePx,
      margin: 1,
    });

    const qrPayloadUrl = qrCodesService.getRecordContext(record.qrCodeId)
      .metadata.qrPayloadUrl;
    const qrDataUrl = toDataUrl(qrBuffer, "image/png");
    const cardSvg = buildLuxuryCardSvg({
      record,
      dimensions,
      qrDataUrl,
      qrPayloadUrl,
    });

    const theme = resolveBusinessCardTheme(
      record.theme,
      `${record.companyName}:${record.id}`,
    );
    const svgBuffer = Buffer.from(cardSvg, "utf-8");

    let rasterBuffer: Buffer;
    if (format === "WEBP") {
      rasterBuffer = await sharp(svgBuffer, { density: record.printSpec.dpi })
        .webp({ quality: 96, alphaQuality: 100 })
        .toBuffer();
    } else {
      rasterBuffer = await sharp(svgBuffer, { density: record.printSpec.dpi })
        .png({ compressionLevel: 9 })
        .toBuffer();
    }

    let widthPx = dimensions.widthPx;
    let heightPx = dimensions.heightPx;

    if (includeBleed && dimensions.bleedPx > 0) {
      rasterBuffer = await sharp(rasterBuffer)
        .extend({
          top: dimensions.bleedPx,
          bottom: dimensions.bleedPx,
          left: dimensions.bleedPx,
          right: dimensions.bleedPx,
          background: theme.palette.bleed,
        })
        .png({ compressionLevel: 9 })
        .toBuffer();

      widthPx += dimensions.bleedPx * 2;
      heightPx += dimensions.bleedPx * 2;
    }

    return {
      buffer: rasterBuffer,
      widthPx,
      heightPx,
      bleedColor: theme.palette.bleed,
    };
  }
}

export const businessCardsService = new BusinessCardsService();
