import burgerConstructorReducer, {
  addIngredient,
  moveIngredient,
  removeIngredient,
  resetConstructor,
} from '../burger-constructor';
import { createOrder } from '../order';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
  TOrder,
} from '@utils-types';

const bun: TIngredient = {
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
};

const anotherBun: TIngredient = {
  ...bun,
  _id: 'bun-2',
  name: 'Флюоресцентная булка R2-D3',
  price: 988,
};

const main: TIngredient = {
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
};

const sauce: TIngredient = {
  _id: 'sauce-1',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'sauce.png',
  image_large: 'sauce-large.png',
  image_mobile: 'sauce-mobile.png',
};

const constructorMain: TConstructorIngredient = { ...main, id: 'item-1' };
const constructorSauce: TConstructorIngredient = { ...sauce, id: 'item-2' };
const secondConstructorMain: TConstructorIngredient = { ...main, id: 'item-3' };

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const filledState: TConstructorState = {
  bun: { ...bun, id: 'bun-item' },
  ingredients: [constructorMain, constructorSauce, secondConstructorMain],
};

const order: TOrder = {
  _id: 'order-1',
  status: 'done',
  name: 'Краторный бургер',
  createdAt: '2026-10-24T10:00:00.000Z',
  updatedAt: '2026-10-24T10:00:00.000Z',
  number: 12345,
  ingredients: ['bun-1', 'main-1', 'bun-1'],
};

describe('редьюсер слайса burgerConstructor', () => {
  it('возвращает начальное состояние при неизвестном экшене и состоянии undefined', () => {
    expect(burgerConstructorReducer(undefined, { type: 'UNKNOWN' })).toEqual(
      initialState
    );
  });

  describe('экшен addIngredient', () => {
    it('ставит булку на место булки с уникальным id', () => {
      const state = burgerConstructorReducer(initialState, addIngredient(bun));

      expect(state.bun).toEqual({ ...bun, id: expect.any(String) as string });
      expect(state.ingredients).toEqual([]);
    });

    it('заменяет ранее выбранную булку новой', () => {
      const stateWithBun = burgerConstructorReducer(initialState, addIngredient(bun));
      const state = burgerConstructorReducer(stateWithBun, addIngredient(anotherBun));

      expect(state.bun?._id).toBe(anotherBun._id);
      expect(state.ingredients).toEqual([]);
    });

    it('добавляет начинки и соусы в конец списка с разными id', () => {
      const stateWithMain = burgerConstructorReducer(initialState, addIngredient(main));
      const state = burgerConstructorReducer(stateWithMain, addIngredient(main));

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients.map((ingredient) => ingredient._id)).toEqual([
        main._id,
        main._id,
      ]);
      expect(state.ingredients[0].id).not.toBe(state.ingredients[1].id);
    });
  });

  it('removeIngredient удаляет только ингредиент с переданным id', () => {
    const state = burgerConstructorReducer(
      filledState,
      removeIngredient(constructorMain.id)
    );

    expect(state.bun).toEqual(filledState.bun);
    expect(state.ingredients).toEqual([constructorSauce, secondConstructorMain]);
  });

  describe('экшен moveIngredient', () => {
    it('перемещает ингредиент вниз', () => {
      const state = burgerConstructorReducer(
        filledState,
        moveIngredient({ from: 0, to: 1 })
      );

      expect(state.ingredients).toEqual([
        constructorSauce,
        constructorMain,
        secondConstructorMain,
      ]);
    });

    it('перемещает ингредиент вверх', () => {
      const state = burgerConstructorReducer(
        filledState,
        moveIngredient({ from: 2, to: 1 })
      );

      expect(state.ingredients).toEqual([
        constructorMain,
        secondConstructorMain,
        constructorSauce,
      ]);
    });
  });

  it('resetConstructor очищает конструктор', () => {
    expect(burgerConstructorReducer(filledState, resetConstructor())).toEqual(
      initialState
    );
  });

  describe('асинхронный экшен createOrder', () => {
    const ingredientIds = order.ingredients;

    it('при createOrder.pending не меняет состав бургера', () => {
      expect(
        burgerConstructorReducer(
          filledState,
          createOrder.pending('requestId', ingredientIds)
        )
      ).toEqual(filledState);
    });

    it('при createOrder.fulfilled очищает конструктор', () => {
      expect(
        burgerConstructorReducer(
          filledState,
          createOrder.fulfilled(order, 'requestId', ingredientIds)
        )
      ).toEqual(initialState);
    });

    it('при createOrder.rejected сохраняет состав бургера', () => {
      expect(
        burgerConstructorReducer(
          filledState,
          createOrder.rejected(new Error('Ошибка'), 'requestId', ingredientIds)
        )
      ).toEqual(filledState);
    });
  });
});
