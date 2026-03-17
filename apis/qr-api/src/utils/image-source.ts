import type { LogoSource } from "@r6/schemas";
import sharp from "sharp";
import { BadRequestError } from "../shared/errors";

interface LoadLogoOptions {
  maxBytes: number;
  timeoutMs: number;
}

const DATA_URL_PATTERN =
  /^data:(?<mime>[^;]+);base64,(?<payload>[A-Za-z0-9+/=]+)$/;

function parseDataUrl(dataUrl: string) {
  const match = DATA_URL_PATTERN.exec(dataUrl);

  const mimeType = match?.groups?.mime;
  const payload = match?.groups?.payload;

  if (!mimeType || !payload) {
    throw new BadRequestError("Invalid data URL logo payload");
  }

  return {
    mimeType: mimeType.toLowerCase(),
    buffer: Buffer.from(payload, "base64"),
  };
}

async function fetchRemoteLogo(
  sourceUrl: string,
  options: LoadLogoOptions,
): Promise<Buffer> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, options.timeoutMs);

  try {
    const response = await fetch(sourceUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "r6-qr-api/1.0",
      },
    });

    if (!response.ok) {
      throw new BadRequestError(
        `Unable to fetch remote logo (${response.status})`,
      );
    }

    const contentType = response.headers.get("content-type")?.toLowerCase();

    if (!contentType || !contentType.startsWith("image/")) {
      throw new BadRequestError("Remote logo URL did not return an image");
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (contentLength > options.maxBytes) {
      throw new BadRequestError(
        `Remote logo is too large. Maximum is ${options.maxBytes} bytes`,
      );
    }

    const logoArrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(logoArrayBuffer);

    if (buffer.byteLength > options.maxBytes) {
      throw new BadRequestError(
        `Remote logo is too large. Maximum is ${options.maxBytes} bytes`,
      );
    }

    return buffer;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new BadRequestError("Remote logo download timed out");
    }

    if (error instanceof BadRequestError) {
      throw error;
    }

    throw new BadRequestError("Unable to download remote logo");
  } finally {
    clearTimeout(timer);
  }
}

async function normalizeImageToPngDataUrl(
  buffer: Buffer,
  options: LoadLogoOptions,
): Promise<string> {
  if (buffer.byteLength > options.maxBytes) {
    throw new BadRequestError(
      `Logo is too large. Maximum is ${options.maxBytes} bytes`,
    );
  }

  try {
    const pngBuffer = await sharp(buffer, {
      limitInputPixels: 4_096 * 4_096,
    })
      .resize(1_024, 1_024, { fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: 100 })
      .toBuffer();

    return toDataUrl(pngBuffer, "image/png");
  } catch {
    throw new BadRequestError("Invalid logo image provided");
  }
}

export async function normalizeLogoSourceToPngDataUrl(
  source: LogoSource,
  options: LoadLogoOptions,
): Promise<string> {
  if (source.kind === "DATA_URL") {
    const parsed = parseDataUrl(source.dataUrl);
    if (!parsed.mimeType.startsWith("image/")) {
      throw new BadRequestError("Data URL logo must be an image");
    }

    return normalizeImageToPngDataUrl(parsed.buffer, options);
  }

  const remoteBuffer = await fetchRemoteLogo(source.url, options);
  return normalizeImageToPngDataUrl(remoteBuffer, options);
}

export function dataUrlToBuffer(dataUrl: string): Buffer {
  const parsed = parseDataUrl(dataUrl);
  return parsed.buffer;
}

export function toDataUrl(buffer: Buffer, mimeType: string): string {
  const payload = buffer.toString("base64");
  return `data:${mimeType};base64,${payload}`;
}
