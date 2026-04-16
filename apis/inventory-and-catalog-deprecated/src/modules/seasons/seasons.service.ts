import * as seasonsRepo from "./seasons.repository";

export type {
  CreateSeasonInput,
  ListSeasonsInput,
  UpdateSeasonInput,
} from "./seasons.repository";

export const createSeason = (
  tenantSlug: string,
  input: seasonsRepo.CreateSeasonInput,
) => seasonsRepo.createSeason(tenantSlug, input);

export const listSeasons = (
  tenantSlug: string,
  input: seasonsRepo.ListSeasonsInput,
) => seasonsRepo.listSeasons(tenantSlug, input);

export const getSeasonById = (tenantSlug: string, id: string) =>
  seasonsRepo.getSeasonById(tenantSlug, id);

export const getSeasonBySlug = (tenantSlug: string, slug: string) =>
  seasonsRepo.getSeasonBySlug(tenantSlug, slug);

export const updateSeason = (
  tenantSlug: string,
  id: string,
  input: seasonsRepo.UpdateSeasonInput,
) => seasonsRepo.updateSeason(tenantSlug, id, input);

export const deleteSeason = (tenantSlug: string, id: string) =>
  seasonsRepo.deleteSeason(tenantSlug, id);
