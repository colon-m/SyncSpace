import { createSlice } from "@reduxjs/toolkit";

const tagSlice = createSlice({
  name: "tags",
  initialState: {
    tags: [],
  },
  reducers: {
    addTag: (state, action) => {
      state.tags.push(action.payload);
    },
    removeTag: (state, action) => {
      state.tags = state.tags.filter(tag => tag.name !== action.payload.name);
    },
    selectTag: (state, action) => {
        const target = action.payload;
        const index = state.tags.findIndex(tag => tag.name === target.name);
        if (index === -1) {
            state.tags.push(action.payload);
            console.log(`store tags:`, state.tags);
        }
    },
  }
});

export const { addTag, removeTag, selectTag } = tagSlice.actions;
export default tagSlice.reducer;
