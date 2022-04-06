import { combineReducers } from 'redux';
import FBConfig from '../../config/firebaseCon'
import { firestoreReducer } from 'redux-firestore'
import { firebaseReducer } from 'react-redux-firebase'
import * as reducer from './utils/reducer'

// Combine all the reducers
const rootReducer = combineReducers({ 
    auth: reducer.authReducer,
    home: reducer.homeReducer,
    posts: reducer.fetchPostsReducer,
    firebase: firebaseReducer,
    firestore: firestoreReducer,
    followRequests: reducer.followReqestReducer,
    comments: reducer.commentsReducer,
    followingAccounts: reducer.fetchFollowingAccounts,
    groups: reducer.retrieveGroups,
    accessories: reducer.getGroupAccesories,
    announcements: reducer.getGroupAnnouncements

 });

export default rootReducer;