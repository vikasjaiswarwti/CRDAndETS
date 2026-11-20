// features/navigation/components/fallbacks/FeatureErrorFallback.tsx
// Props: ErrorFallbackProps (error, resetError) + featureName + onRetry.
// useLogger called unconditionally — no Rules of Hooks violation.

import React from "react";
import type { ErrorFallbackProps } from "../../../../shared/components/ErrorBounadry/ErrorFallback";
import { useLogger } from "../../../../shared/hooks/useLogger";
import { Button } from "../../../../shared/components/ui/Button";

interface FeatureErrorFallbackProps extends ErrorFallbackProps {
    featureName: string;
    onRetry?: () => void;
}

export const FeatureErrorFallback: React.FC<FeatureErrorFallbackProps> = ({
    error,
    resetError,
    featureName,
    onRetry,
}) => {
    const logger = useLogger(`${featureName}ErrorFallback`);

    React.useEffect(() => {
        logger.error(`Error in ${featureName} feature`, { errorMessage: error?.message });
    }, [logger, error, featureName]);

    const handleRetry = () => {
        logger.debug(`User retried ${featureName} feature`);
        if (onRetry) {
            onRetry();
        } else {
            resetError();
        }
    };

    return (
        <div className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Error in {featureName}</h3>
            <p className="text-gray-600 mb-4">This section failed to load. Please try again.</p>
            <Button variant="primary" onClick={handleRetry}>
                Retry
            </Button>
        </div>
    );
};