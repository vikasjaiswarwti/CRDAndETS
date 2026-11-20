import React from 'react';

import { useUILibrary } from '../ui-lib/ui-library-context';
import type { IconProps } from '../ui-lib/types';

export const Icon: React.FC<IconProps> = (props) => {
  const library = useUILibrary();
  const IconComponent = library.Icon;
  return <IconComponent {...props} />;
};