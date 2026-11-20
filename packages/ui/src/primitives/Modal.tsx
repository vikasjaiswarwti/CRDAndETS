import React from 'react';

import { useUILibrary } from '../ui-lib/ui-library-context';
import type { ModalProps } from '../ui-lib/types';

export const Modal: React.FC<ModalProps> = (props) => {
    const library = useUILibrary();
    const ModalComponent = library.Modal;
    return <ModalComponent {...props} />;
};