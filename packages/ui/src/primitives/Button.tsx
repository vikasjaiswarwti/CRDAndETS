import React from 'react';
import { useUILibrary } from '../ui-lib/ui-library-context';
import type { ButtonProps } from '../ui-lib/types';

export const Button: React.FC<ButtonProps> = (props) => {
    const library = useUILibrary();
    const ButtonComponent = library.Button;
    return <ButtonComponent {...props} />;
};