import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { reduxFirestore, getFirestore } from 'redux-firestore'
import { reactReduxFirebase, getFirebase } from 'react-redux-firebase'
import FBConfig from '../../config/firebaseCon'

import reducers from './rootReducer'; //Import the root reducer

const enhancer = compose(applyMiddleware(thunk.withExtraArgument({ getFirebase, getFirestore })), reduxFirestore(FBConfig));

export default createStore(reducers, enhancer);