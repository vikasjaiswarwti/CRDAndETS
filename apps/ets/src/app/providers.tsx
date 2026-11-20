import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store'
import { ErrorBoundary } from "../shared/components/ErrorBounadry/ErrorBoundary";
import { Toaster } from '../shared/components/ui'

import { UILibraryProvider } from '../shared/lib/ui-lib/ui-library-context'

interface Props {
    children: React.ReactNode
}

export const AppProviders = ({ children }: Props) => {
    return (
        <ErrorBoundary>
            <Provider store={store}>
                <BrowserRouter basename={import.meta.env.BASE_URL}>
                    <UILibraryProvider>
                        {children}
                        <Toaster position="top-right" />
                    </UILibraryProvider>
                </BrowserRouter>
            </Provider>
        </ErrorBoundary>
    )
}