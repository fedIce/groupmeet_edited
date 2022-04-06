import { AsyncStorage } from 'react-native';

import * as t from './actionTypes';

let initialState = { 
    notifications: [],
    isLoggedIn: false,
    error: null,
    user: null,
    followRequest: { status: null , error: null},
    comments: { status: null , error: null, comments: [] }
    
    };
let initialPosts = { fetching: false, posts: null, error: null }
let initialFollowingAccounts = { accounts: null, status: null, error: null }


export const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case t.LOGGED_IN:
            const user = action.user;

            // Save token and data to Asyncstorage
            AsyncStorage.multiSet([
                ['user', JSON.stringify(user)]
            ]);

            return {...state, isLoggedIn: true, user  , error: null };

        case t.LOGGED_OUT:
            let keys = ['user'];
            AsyncStorage.multiRemove(keys);

            return {...state, isLoggedIn: false, user: null , error: null};

            case t.LOGIN_FAILED:
                return {...state, isLoggedIn: false, user: null, error: action.error};

        default:
            return state;
    }
};

export const homeReducer = (state = initialState, action)=>{
    return state
}

export const fetchPostsReducer = (state = initialPosts, action) => {
    switch(action.type){
        case t.FETCHEDING_DATA:
           return { ...state, fetching: true, posts: null, error: null }
        case t.FETCHED_DATA:
            return { ...state, fetching: false, posts: action.posts , error: null }
        case t.FETCH_DATA_FAILED:
            return { ...state, fetching: false, posts: null, error: action.msg }
        case t.FETCHING_FEED:
            return { ...state, fetching: true, posts: null, error: null }
            case t.FETCHED_FEED:
                return { ...state, fetching: false, feeds: action.posts , error: null }
            case t.FETCH_FEED_FAILD:
                return { ...state, fetching: false, posts: null, error: action.msg }

        default:
            return state
   }
};


export const followReqestReducer = ( state = initialState.followRequest, action) => {
    switch(action.type) {
        case t.SENT_FOLLOW_REQUEST:
            return { ...state,status: action.status, error: action.error }
        case t.SENDING_FOLLOW_REQUEST:
            return { ...state, status: action.status, error: action.error }
        case t.FAILED_FOLLOW_REQUEST:
            return { ...state, status: action.status, error: action.error }
        default:
            return state
    }
}


export const commentsReducer = ( state = initialState.comments , action ) =>{
    switch(action.type){
        case t.FETCHED_COMMENTS: 
            return { ...state, comments: action.comments, error: action.err, status: 'done' }
        case t.FETCHED_COMMENTS_FAILED:
            return { ...state, error: action.err , status: 'failed'}
        case t.FETCHING_COMMENTS:
            return { ...state, comments: action.comments, error: action.err, status: 'loading' }
        default:
            return state
    }
}

export const fetchFollowingAccounts = (state = initialFollowingAccounts, action ) => {
    switch(action.type){
        case t.FETCHING_FOLOWING_ACCOUNTS:
                return { ...state, status: action.status }         
        case t.FETCHED_FOLOWING_ACCOUNTS:
                return { ...state, status: action.status, accounts: action.accounts }
        case t.FETCHED_FOLOWING_ACCOUNTS_FAILED:
                return {...state, status: action.status, error: action.error }
        default:
            return state
    }
}

export const retrieveGroups = ( state = { group: null, error: null, status: 'fetching' }, action ) => {
    switch(action.type){
        case t.FETCHED_GROUPS:
            return { ...state, groups: action.groups, error: null, status: action.status }
        case t.FETCHING_GROUPS:
            return { ...state, groups:null, error: null, status: action.status }
        case t.FAILED_FETCHED_GROUPS:
            return { ...state, groups: null , error: action.error, status: action.status }
        default:
            return state
    }
}

export const getGroupAccesories = (state = { data: null, status:null, error:null }, action ) => {
    switch(action.type){
        case t.FETCHING_GROUP_ACCESSORIES:
            return { ...state, data: null, status: action.status, error: action.error }            
        case t.GET_GROUP_ACCESSORIES:
            return { ...state, data: action.data, status: action.status, error: action.error }
        case t.GET_GROUP_ACCESSORIES_FAILED:
            return { ...state, data: null, status: action.status, error: action.error }
        default:
            return state
    }
}

export const getGroupAnnouncements = (state = { data: null, status:null, error:null }, action ) => {
    switch(action.type){
        case t.FETCHING_ANNOUNCEMENT:
            return { ...state, data: null, status: action.status, error: action.error }            
        case t.FETCHED_ANNOUNCEMENT:
            return { ...state, data: action.data, status: action.status, error: action.error }
        case t.FETCHED_ANNOUNCEMENT_FAILED:
            return { ...state, data: null, status: action.status, error: action.error }
        default:
            return state
    }
}
