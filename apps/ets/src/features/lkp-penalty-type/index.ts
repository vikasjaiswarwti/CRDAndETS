export { default as LkpPenaltyTypeListPage } from "./pages/Lkppenaltytypelistpage";
export { lkpPenaltyTypeApi } from "./services/LkpPenaltytypeApi";
export {
  lkpPenaltyTypeSlice,
  resetLkpPenaltyTypeUi,
} from "./slice/LkpPenaltyTypeSlice";
export type {
  LkpPenaltyType,
  CreateLkpPenaltyTypeDto,
  UpdateLkpPenaltyTypeDto,
} from "./types/Lkppenaltytype.types";
