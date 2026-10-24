import ingredientsReducer, { fetchIngredients } from '../ingredients';

import type { TIngredient } from '@utils-types';

const ingredients: TIngredient[] = [
  {
    _id: 'bun-1',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'bun.png',
    image_large: 'bun-large.png',
    image_mobile: 'bun-mobile.png',
  },
  {
    _id: 'main-1',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'main.png',
    image_large: 'main-large.png',
    image_mobile: 'main-mobile.png',
  },
];

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

describe('редьюсер слайса ingredients', () => {
  it('возвращает начальное состояние при неизвестном экшене и состоянии undefined', () => {
    expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  it('при fetchIngredients.pending включает загрузку и сбрасывает ошибку', () => {
    const state = ingredientsReducer(
      { ...initialState, error: { message: 'Ошибка' } },
      fetchIngredients.pending('requestId')
    );

    expect(state).toEqual({ items: [], isLoading: true, error: null });
  });

  it('при fetchIngredients.fulfilled сохраняет ингредиенты и выключает загрузку', () => {
    const state = ingredientsReducer(
      { ...initialState, isLoading: true },
      fetchIngredients.fulfilled(ingredients, 'requestId')
    );

    expect(state).toEqual({ items: ingredients, isLoading: false, error: null });
  });

  it('при fetchIngredients.rejected сохраняет ошибку и выключает загрузку', () => {
    const errorMessage = 'Не удалось загрузить ингредиенты';
    const state = ingredientsReducer(
      { ...initialState, isLoading: true },
      fetchIngredients.rejected(new Error(errorMessage), 'requestId')
    );

    expect(state.isLoading).toBe(false);
    expect(state.items).toEqual([]);
    expect(state.error?.message).toBe(errorMessage);
  });
});
