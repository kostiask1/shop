import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import thunk from "redux-thunk"
import authReducer from "./Auth/slice"
import appReducer from "./App/slice"
import tasksReducer from "./Task/slice"
import wishesReducer from "./Wish/slice"

const reducer = combineReducers({
  auth: authReducer,
  app: appReducer,
  tasks: tasksReducer,
  wishes: wishesReducer,
})

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
  devTools: true,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
