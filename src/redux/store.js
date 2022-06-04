import { createStore, applyMiddleware, compose } from "redux";
import rootReducer from "./modules";
import thunk from 'redux-thunk';

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(thunk),
    window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : (a) => a,
  ),
);

export default store;
