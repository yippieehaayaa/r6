import type { QrAssetQuery } from "@r6/schemas";
import type { Request, Response } from "express";
import { env } from "../../config";
import { qrCodesService } from "./qr-codes.service";

function setAssetHeaders(
  res: Response,
  contentType: string,
  fileName: string,
  cacheSeconds: number,
) {
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
  res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}`);
}

export async function createQrCode(req: Request, res: Response): Promise<void> {
  const responseBody = await qrCodesService.create(req.body);
  res.status(201).json(responseBody);
}

export async function getQrCodeMetadata(
  req: Request,
  res: Response,
): Promise<void> {
  const responseBody = await qrCodesService.getMetadata(
    req.params.id as string,
  );
  res.status(200).json(responseBody);
}

export async function updateQrCodeTarget(
  req: Request,
  res: Response,
): Promise<void> {
  const responseBody = await qrCodesService.updateTarget(
    req.params.id as string,
    req.body,
  );
  res.status(200).json(responseBody);
}

export async function getQrCodeAsset(
  req: Request,
  res: Response,
): Promise<void> {
  const asset = await qrCodesService.getAsset(
    req.params.id as string,
    req.query as unknown as QrAssetQuery,
  );

  setAssetHeaders(
    res,
    asset.contentType,
    asset.fileName,
    env.ASSET_CACHE_SECONDS,
  );
  res.status(200).send(asset.bytes);
}

export async function resolveQrCode(
  req: Request,
  res: Response,
): Promise<void> {
  const target = await qrCodesService.getRedirectTarget(
    req.params.id as string,
  );
  res.redirect(302, target);
}
