import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { UILibraryProvider } from "@commutr/ui/ui-lib";
import { store } from "./store";

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <UILibraryProvider>{children}</UILibraryProvider>
    </BrowserRouter>
  </Provider>
);
