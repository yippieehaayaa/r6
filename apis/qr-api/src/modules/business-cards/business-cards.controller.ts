import type { BusinessCardImageQuery, BusinessCardPdfQuery } from "@r6/schemas";
import type { Request, Response } from "express";
import { env } from "../../config";
import { businessCardsService } from "./business-cards.service";

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

export async function createBusinessCard(
  req: Request,
  res: Response,
): Promise<void> {
  const responseBody = await businessCardsService.create(req.body);
  res.status(201).json(responseBody);
}

export async function getBusinessCardMetadata(
  req: Request,
  res: Response,
): Promise<void> {
  const responseBody = await businessCardsService.getMetadata(
    req.params.id as string,
  );
  res.status(200).json(responseBody);
}

export async function exportBusinessCardImage(
  req: Request,
  res: Response,
): Promise<void> {
  const asset = await businessCardsService.getImageAsset(
    req.params.id as string,
    req.query as unknown as BusinessCardImageQuery,
  );

  setAssetHeaders(
    res,
    asset.contentType,
    asset.fileName,
    env.ASSET_CACHE_SECONDS,
  );
  res.status(200).send(asset.bytes);
}

export async function exportBusinessCardPdf(
  req: Request,
  res: Response,
): Promise<void> {
  const asset = await businessCardsService.getPdfAsset(
    req.params.id as string,
    req.query as unknown as BusinessCardPdfQuery,
  );

  setAssetHeaders(
    res,
    asset.contentType,
    asset.fileName,
    env.ASSET_CACHE_SECONDS,
  );
  res.status(200).send(asset.bytes);
}
