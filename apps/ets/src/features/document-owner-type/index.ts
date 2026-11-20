export { default as DocumentOwnerTypeListPage } from "./pages/Documentownertypelistpage";
export { documentOwnerTypeApi } from "./services/DocOwnerTypeApi";
export {
  documentOwnerTypeSlice,
  resetDocumentOwnerTypeUi,
} from "./slice/DocumentOwnerTypeSlice";
export type {
  DocumentOwnerType,
  CreateDocumentOwnerTypeDto,
  UpdateDocumentOwnerTypeDto,
} from "./types/documentOwnerType.types";
