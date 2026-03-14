import type { PrismaClient } from "../../generated/client/index.js";

const BRAND_DEFS = [
  { name: "Apex Industries", slug: "apex-industries" },
  { name: "NovaTech", slug: "novatech" },
  { name: "PureForm", slug: "pureform" },
  { name: "UrbanEdge", slug: "urbanedge" },
  { name: "TerraGear", slug: "terragear" },
  { name: "CloudNine", slug: "cloudnine" },
  { name: "IronClad", slug: "ironclad" },
  { name: "SwiftLine", slug: "swiftline" },
  { name: "ZenCraft", slug: "zencraft" },
  { name: "BoldWave", slug: "boldwave" },
  { name: "KineticX", slug: "kineticx" },
  { name: "LumaCore", slug: "lumacore" },
  { name: "PixelRush", slug: "pixelrush" },
  { name: "FluxBrand", slug: "fluxbrand" },
  { name: "SkyBound", slug: "skybound" },
];

export async function seedBrands(
  prisma: PrismaClient,
  log: (msg: string) => void,
): Promise<{ id: string }[]> {
  const brands = await Promise.all(
    BRAND_DEFS.map((def) =>
      prisma.brand.upsert({
        where: { slug: def.slug },
        update: {},
        create: { name: def.name, slug: def.slug, isActive: true },
      }),
    ),
  );
  log(`${brands.length} brands`);
  return brands;
}
