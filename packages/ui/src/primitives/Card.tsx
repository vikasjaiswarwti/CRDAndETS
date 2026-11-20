import React from 'react';

import { useUILibrary } from '../ui-lib/ui-library-context';
import type { CardProps } from '../ui-lib/types';

export const Card: React.FC<CardProps> = (props) => {
    const library = useUILibrary();
    const CardComponent = library.Card;
    return <CardComponent {...props} />;
};