import type { ReactElement } from 'react';
import type { Location } from 'react-router-dom';

export type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactElement;
};

export type TProtectedRouteState = {
  from?: Location;
};
