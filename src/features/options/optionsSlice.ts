import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

const initialState = {
  ENABLE_ROTATION: false
}

const optionsSlice = createSlice({
  name: "options",
  initialState,
  reducers: {
    toggleRotation: (state,) => {
      state.ENABLE_ROTATION = !state.ENABLE_ROTATION
    }
  },
})

export const selectOptions = (state: RootState) => state.options

export const { toggleRotation } = optionsSlice.actions

export default optionsSlice.reducer
