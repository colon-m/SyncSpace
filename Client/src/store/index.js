import {configureStore} from "@reduxjs/toolkit";
import tagReducer from "./reducers/tag";

const store = configureStore({
  reducer: {
    tags: tagReducer,
  },
});

export default store;