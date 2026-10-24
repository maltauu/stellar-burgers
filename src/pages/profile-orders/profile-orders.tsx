import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import {
  fetchProfileOrders,
  selectProfileOrders,
} from '@services/slices/profile-orders';
import { useDispatch, useSelector } from '@services/store';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector(selectProfileOrders);

  useEffect(() => {
    void dispatch(fetchProfileOrders());
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
