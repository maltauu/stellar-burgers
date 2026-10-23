import type { SerializedError } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils-types';
import type { Location } from 'react-router-dom';

export type TAppLocationState = {
  background?: Location;
};

export type AppContentProps = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: SerializedError | null;
};

export type TOrderInfoModalProps = {
  onClose: () => void;
};
