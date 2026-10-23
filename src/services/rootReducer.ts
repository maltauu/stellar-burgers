import { combineReducers } from '@reduxjs/toolkit';

import burgerConstructorReducer from './slices/burger-constructor';
import feedReducer from './slices/feed';
import ingredientsReducer from './slices/ingredients';
import orderReducer from './slices/order';
import profileOrdersReducer from './slices/profile-orders';
import userReducer from './slices/user';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: burgerConstructorReducer,
  order: orderReducer,
  feed: feedReducer,
  profileOrders: profileOrdersReducer,
  user: userReducer,
});
