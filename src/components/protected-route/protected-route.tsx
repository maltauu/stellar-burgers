import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { selectIsAuthChecked, selectUser } from '@services/slices/user';
import { useSelector } from '@services/store';

import type { TProtectedRouteProps, TProtectedRouteState } from './type';

export const ProtectedRoute = ({
  onlyUnAuth = false,
  children,
}: TProtectedRouteProps): React.JSX.Element => {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const user = useSelector(selectUser);
  const location = useLocation();
  const locationState = location.state as TProtectedRouteState | null;

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (onlyUnAuth && user) {
    return <Navigate to={locationState?.from ?? '/'} replace />;
  }

  return children;
};
