import * as seasonsRepo from "./seasons.repository";

export type {
  CreateSeasonInput,
  ListSeasonsInput,
  UpdateSeasonInput,
} from "./seasons.repository";

export const createSeason = (input: seasonsRepo.CreateSeasonInput) =>
  seasonsRepo.createSeason(input);

export const listSeasons = (input: seasonsRepo.ListSeasonsInput) =>
  seasonsRepo.listSeasons(input);

export const getSeasonById = (id: string) => seasonsRepo.getSeasonById(id);

export const getSeasonBySlug = (slug: string) =>
  seasonsRepo.getSeasonBySlug(slug);

export const updateSeason = (
  id: string,
  input: seasonsRepo.UpdateSeasonInput,
) => seasonsRepo.updateSeason(id, input);

export const deleteSeason = (id: string) => seasonsRepo.deleteSeason(id);
