// src/features/dashboard/RoleDashboard.tsx
// Reads activeRole from store → resolves correct dashboard → renders it.
// No role logic here — all in dashboardRegistry.

import { Suspense } from 'react';
import { useAppSelector } from '../../app/store';
import { selectActiveRole } from '../navigation/slices/navigationSlice';

import { resolveDashboardComponent } from '../../routes/registry/Dashboardregistry';
import { ContentContainer } from '../../shared/components/ContentContainer/ContentContainer';

export const RoleDashboard = () => {
    const activeRole = useAppSelector(selectActiveRole);

    const DashboardComponent = resolveDashboardComponent(activeRole);

    return (
        <Suspense fallback={null}>

            <ContentContainer fullBleed >
                <DashboardComponent />
            </ContentContainer>

        </Suspense>
    );
};
