import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
  name: "counter",
  initialState: 0,
  reducers: {
    increment: (state) => {
      return state + 1;
    },
    decrement: (state) => {
      return (state -= 1);
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      return (state += action.payload);
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
