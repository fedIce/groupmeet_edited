import firebase, {auth, database, provider } from "../../../config/firebaseCon";
import * as t from './actionTypes';
import { Builder } from 'crane-query-builder'

import {AsyncStorage} from 'react-native';
import { firestore } from "firebase";
import Event from '../../../config/Event'

const getUid = auth.currentUser? auth.currentUser.uid: null


//Register the user using email and password
export function register(data) {
    return (dispatch, getState, {getFirestore}) => {

        const db = getFirestore()
        const uid = getState().firebase.auth.uid

        return new Promise((resolve, reject) => {
            const {email, password, username} = data;
            //Create New user from email and password

            const displayPicture = `https://robohash.org/${(Math.random() * 100) + 1}.png?set=${(Math.random() * 4) + 1}`

            auth.createUserWithEmailAndPassword(email, password)
                .then((resp) => {
                    let user = auth.currentUser
                    user.updateProfile({
                        displayName: username,
                        photoURL: displayPicture,
                        email: email,
                        uid: resp.user.uid
                    }).then(res => {
                        //Initialize User Object with profilerelated ifnformation
                        db.collection('Users').doc(resp.user.uid).set({
                            followers:[],
                            following: [],
                            requests:[],
                            uid:resp.user.uid,
                            followersCount: 0,
                            followingCount:0,
                            avatar: displayPicture,
                            username: username

                        }).then((res)=>{
                            //Initialize Meta data for this user
                            db.collection('user_mata_data').doc(resp.user.uid).set({
                               recurring_tag_objects: {}, //meta data from post interaction e.g tags, event_type etc
                               recurring_following_posts: {}, //metadata from users who are followed by this user e.g post_ids from posts they interract with
                               events_location_data: {}, // meta data from event locations e.g state, city, country
                               friends_activity_meta_trends: {}, //what are your friends seeing? [ interation from friends, retrieve post_id ]
                               meta_empty: true
                            }).then((res)=>{
                                dispatch({type: t.LOGGED_IN, user})
                            }).catch(err => {
                                console.log("MY META CREATION FAILLED: "+ err)
                            })

                        }).catch(err => {
                            dispatch({type: t.LOGIN_FAILED, error: err})
                            console.log("MY CREATION FAILLED: "+ err)
                        })
                     })
                    .catch(err => { console.warn("Create User Error: " + err )})
                    
                   
                    resolve(resp)
        }).catch(err =>{ 
            reject(err)
            dispatch({type: t.LOGGED_OUT, err})
            })
        })
    };
}

// //Create the user object in realtime database
// export function createUser(user) {
//     return (dispatch, getState, {getFirestore}) => {
//         const firestore =  getFirestore()
//         return new Promise((resolve, reject) => {
//             firestore.collection("Users").document(user.uid).set({
//                 userID: user.id,
//             }).then(() => {
//                     dispatch({type: t.LOGGED_IN, user});
//                     resolve(user)
//                 })
//                 .catch((error) => reject({message: error}));
//         });
//     }
// }

//Sign the user in with their email and password
export function login(data) {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            const {email, password} = data;
            auth.signInWithEmailAndPassword(email, password)
                .then((resp) => {
                    dispatch({ type: t.LOGGED_IN, resp})
                    dispatch(fetchPosts(getUid))
                    
                })
                .catch((error) => {
                    dispatch({type: t.LOGIN_FAILED, error: error })
                    reject(error)
                });
        });
    }
}

//Send Password Reset Email
export function resetPassword(data) {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            const {email} = data;
            auth.sendPasswordResetEmail(email)
                .then(() => resolve())
                .catch((error) => reject(error));
        });
    }
}

//Sign user out
export function signOut() {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            auth.signOut()
                .then(() => resolve())
                .catch((error) => reject(error));
        });
    }
}

//Sign user in using Facebook
export function signInWithFacebook(fbToken,) {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            const credential = provider.credential(fbToken);
            auth.signInWithCredential(credential)
                .then((user) => {
                    //Get the user object from the realtime database
                    database.ref('users').child(user.uid).once('value')
                        .then((snapshot) => {

                            const exists = (snapshot.val() !== null);

                            //if the user exist in the DB, replace the user variable with the returned snapshot
                            if (exists) user = snapshot.val();

                            if (exists) dispatch({type: t.LOGGED_IN, user});
                            resolve({exists, user});
                        })
                        .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
        });
    }
}

export function checkLoginStatus(callback) {
    return (dispatch) => {
        auth.onAuthStateChanged((user) => {
            let isLoggedIn = (user !== null);

            if (isLoggedIn) {
                //Get the user object from the realtime database
                database.ref('users').child(user.uid).once('value')
                    .then((snapshot) => {

                        const exists = (snapshot.val() !== null);

                        //if the user exist in the DB, replace the user variable with the returned snapshot
                        if (exists) user = snapshot.val();

                        if (exists) dispatch({type: t.LOGGED_IN, user});
                        callback(exists, isLoggedIn);
                    })
                    .catch((error) => {
                        //unable to get user
                        dispatch({type: t.LOGGED_OUT});
                        callback(false, false);
                    });
            } else {
                dispatch({type: t.LOGGED_OUT});
                callback(false, isLoggedIn)
            }
        });
    };
}

export function fetchPosts (userId) {
    return (dispatch, getState, {getFirestore}) => {
        const fbase = getFirestore()

        userId?

            fbase.collection("Posts").where("uid", "==", userId).get()
            .then(querySnapshot => {
                    const tempDoc = []
                    querySnapshot.forEach((doc) => {
                        tempDoc.push({ id: doc.id, ...doc.data() })
                    })

                    dispatch({type: t.FETCHED_DATA, posts: tempDoc })
                  

            }).catch(err => { 
                console.log(err.message)
                dispatch({ type: t.FETCH_DATA_FAILED, err })
            })
            :
            dispatch({type: t.FETCHEDING_DATA, data:[] })
      
      }
}

export const sendFollowRequest = (from, to) =>{
    return (dispatch, getState, { getFirestore }) => {
        const db = getFirestore()
        dispatch({ type: t.SENDING_FOLLOW_REQUEST, status: 'sending', error: null })
console.log("from: "+ from.username, "to: "+to.username)
const sentRequest = { 
    id: to.id,
    data: {
        type: 'sent',
        status: 'pending',
        senderUid: from.id,
        recieverUid: to.id,
        avatar: to.avatar,
        username: to.username,
        date: new Date()
    }

}

const recievedRequest = {
    id: from.id,
    data: {
        type: 'recieved',
        status: 'pending',
        senderUid: from.id,
        recieverUid: to.id,
        avatar: from.avatar,
        username: from.username,
        date: new Date()
    }
}

    return new Promise((resolve, rej) => {
            db.collection('Users').doc(to.id).update({
                requests: firebase.firestore.FieldValue.arrayUnion(recievedRequest)
            }).then(res => {
                db.collection("Users").doc(from.id).update({
                    requests: firebase.firestore.FieldValue.arrayUnion(sentRequest)                   
                }).then(res => {

                    Event.shared.sendRequestNotification({ name: from.username }, { uid: to.id })
                    dispatch({type: t.SENT_FOLLOW_REQUEST, status:'sent', error: null })
                    resolve(true)

                }).catch(err => dispatch({ type: t.FAILED_FOLLOW_REQUEST, status: 'failed', error: err }) )
            }).catch(err => {
                console.log(err)
                dispatch({ type: t.FAILED_FOLLOW_REQUEST, status: 'failed', error: err })
                rej(false)
            })
        })
       
    }
}






export const fetchFeeds = () => {
    return async (dispatch, getState, { getFirestore}) => {

        const db = getFirestore()
        const uid = getState().firebase.auth.uid
        const tempDoc = []

        db.collection("Users").where('uid', '==', uid).get()
        .then(querySnapshot => {
            querySnapshot.forEach((doc) => {


                if(doc.data().followingCount > 0) {


                    const followings = doc.data().following

                    new Promise.all(followings.map( id => {
                        db.collection("Posts").get()
                        .then(querySnapshot => {
                           querySnapshot.forEach((doc) => {
                               tempDoc.push({ pid: doc.id, data: doc.data() })
                            })
                    })

                    
                }))
                dispatch({ type: t.FETCHED_FEED, posts: tempDoc })

                    //fetch Posts Using array of Followings UID
                }else{
                    db.collection("Posts").get()
                    .then(querySnapshot => {
                       querySnapshot.forEach((doc) => {
                           tempDoc.push({ pid: doc.id, data: doc.data() })
                        })
                        dispatch({ type: t.FETCHED_FEED, posts: tempDoc})

                    }).catch(err => dispatch({type: t.FETCH_FEED_FAILD, error: err}))
                }
            });
        }).catch(err => dispatch({type: t.FETCH_FEED_FAILD, error: err}))
        
        
        
    }
}

export const removeFollowRequest = (sender, reciever) =>{
    return (dispatch, getState, { getFirestore }) => {
       return new Promise((resolve, reject) => {

       
        const db = getFirestore()
        let updatedRequests = []
        const senderdb = db.collection("Users").doc(sender)
        const recieverdb = db.collection("Users").doc(reciever)

        return senderdb.get()
        .then(querySnapshot => {
            Promise.all(querySnapshot.data().requests.map(request => {
                console.log(sender, reciever)
                if(!(request.data.senderUid == sender && request.data.recieverUid == reciever)){
                    updatedRequests.push(request)
                }
            })).then(() => {
                senderdb.update({
                    requests: updatedRequests
                })
            }).then(() => {
                recieverdb.get().then(querySnapshot => {
                    updatedRequests = []
                console.log(sender, reciever)

                    Promise.all(querySnapshot.data().requests.map(request => {
                        if(!(request.data.senderUid == sender && request.data.recieverUid == reciever)){
                            updatedRequests.push(request)
                        }
                    })).then(() => {
                        recieverdb.update({
                            requests: updatedRequests
                        })
                        resolve(true)
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
        }).catch(err => console.log(err))

    })
    }
}

export const acceptFollowRequest = (sender, reciever) => {
    return (dispatch, getState, { getFirestore }) => {
        const db = getFirestore()
        let updatedRequests = []
        const senderdb = db.collection("Users").doc(sender)
        const recieverdb = db.collection("Users").doc(reciever)

        recieverdb.update({
            followers: firebase.firestore.FieldValue.arrayUnion(sender),
            followersCount: firebase.firestore.FieldValue.increment(1)
        }).then(() => {
            senderdb.update({
                following:firebase.firestore.FieldValue.arrayUnion(reciever),
                followingCount: firebase.firestore.FieldValue.increment(1)
            })
        }).then(() => {
            dispatch(removeFollowRequest(sender, reciever))
        }).catch(err => console.log(err))
        
    }
}


export const likePost = (post)=>{
    return (dispatch, getState, { getFirestore }) => {
        const db = getFirestore()
        const batch = db.batch()
        let reWrite = []

        const postData = {
            postId: post.postId,
            posterId: post.posterId ,
            likerId: post.likerId,
            likerAvatar: post.likerAvatar,
            likerDisplayName: post.likerDisplayName,
        }

        db.collection("Likes").doc(post.postId).get()
        .then(querySnapshot => {
            querySnapshot.data()? reWrite = querySnapshot.data().post : reWrite = []
        }).then(() => {
            reWrite.push(postData)
            db.collection("Likes").doc(post.postId).set({
                likeCount: reWrite.length,
                post: reWrite
            }).then(() => {
                db.collection("Posts").doc(post.postId).update({
                    likes: firebase.firestore.FieldValue.increment(1),
                    likers: firebase.firestore.FieldValue.arrayUnion(post.likerId)
                })
            }).then(async res => {

                //Do something else?

            }).catch(err => console.log(err))
        })

    }
}

export const sendComment =(post)=>{
    return (dispatch, getState, { getFirestore })=>{
        console.log("COMMENT DATA" , post)
        const db = getFirestore()
        var tempDoc = []
        const getComments = db.collection("Comments").doc(post.postId)


        const postData = {
            postId: post.postId,
            posterId: post.posterId ,
            commenterId: post.commenterId,
            commenterAvatar: post.commenterAvatar,
            commenterDisplayName: post.commenterName,
            comment: post.comment,
            commentId: post.commentId,
            // time: firebase.firestore.FieldValue.serverTimestamp(),
            likes: []
        }

            getComments.set({
                commentArray: firebase.firestore.FieldValue.arrayUnion(postData)
            })
            .then(()=> {
                getComments.get()
                .then(querySnapshot => {
                    dispatch({type: t.FETCHED_COMMENTS, comments: querySnapshot.data()})
                }).then(() => {
                    db.collection("Posts").doc(post.postId).update({
                        commentsCount: firebase.firestore.FieldValue.increment(1)
                    }).then(async () => {

                        //Do something else?

                    })
                    
                    .catch(err => {
                        console.log(err)
                        dispatch({ type: t.FETCHED_COMMENTS_FAILED, error: err })
                    })
                }).catch(err => {
                    console.log(err)
                    dispatch({ type: t.FETCHED_COMMENTS_FAILED, error: err })
                })
                
            }).catch(err => {
                console.log(err)
                dispatch({ type: t.FETCHED_COMMENTS_FAILED, error: err })
            })
    }
}

export const getComments = (postId) => {
    return (dispatch, getState, { getFirestore }) => {
        const db = getFirestore()
        const getComments = db.collection("Comments").doc(postId)

        getComments.get()
        .then(querySnapshot => {
            dispatch({type: t.FETCHED_COMMENTS, comments:{commentId: querySnapshot.id, text: querySnapshot.data()}})
        }).catch(err =>  {
            dispatch({ type: t.FETCHED_COMMENTS_FAILED, error: err.message }) 
            console.log(err)
        })
    }
}

export const FetchFollowersAccounts = () => {
    return (dispatch, getState, { getFirestore }) => {

        dispatch({ type: t.FETCHING_FOLOWING_ACCOUNTS, status: 'loading'})

        const db = getFirestore()
        const user = getState().firebase.auth.uid
        var followings = []
        var collectFollowings = []

        const activeUserdb = db.collection('Users').doc(user)

        activeUserdb.get().then(querySnapshot => {
            followings = querySnapshot.data().following
        }).then(()=>{
            console.log("FOLLOWING YOPU ARE: ", followings )
         let FetchAll = followings.map(userItem => {
                           return  db.collection('Users').doc(userItem).get()  
                         }) 

           Promise.all(FetchAll).then((docs) => {
               let Items = docs.map(doc => doc.data())
                dispatch({ type: t.FETCHED_FOLOWING_ACCOUNTS, status: 'done', accounts: Items})
            }).catch(err => {
                dispatch({ type: t.FETCHED_FOLOWING_ACCOUNTS_FAILED, status: 'failed', error: err})
            })
        })

    }
}

const setMsgId = ( uid1, uid2 ) => {
    if( uid1 > uid2 ){
        return uid1+uid2
    }else{
        return uid2+uid1
    }
}

export const sendOneOnOneMessage = (convesationId, uid1, uid2,avatar, name, chatData ) => {
    return ( disptach, getState, { getFirestore })=>{
        console.log("Sending Message")


        const MsgId = setMsgId(uid1, uid2)
        const db = getFirestore()
        const msgDb = db.collection("OneOnOneChats").doc(MsgId).collection('messages')
        const msgUpdates = db.collection("MessageUpdates").doc(uid1)
        let tempo =[]
     
            msgDb.add({
                id: chatData.msgId,
                sender: uid1,
                receiver: uid2,
                status: chatData.status,
                message: chatData.message,
                time: firebase.firestore.Timestamp.fromDate(chatData.time),
                convesationId,
                imgArr: chatData.imgArr,
                name,
                avatar,
                postType: chatData.PostType? chatData.PostType : null,
                replyMode: chatData.replyMode
    
            }).then(() => {
                msgUpdates.get()
                .then(snapshot => {
                    if(snapshot.data() && snapshot.data().data != undefined){
                        tempo = snapshot.data().data
                    }
                }).then(() => {

                    msgUpdates.set({
                       
                        data: [...tempo,{
                            sender: uid1,
                            receiver: uid2,
                            msg: chatData.message,
                            time: new Date(),
                            avatar,
                            name
                        }]
                    })
                })
            },{ merge: true } ).catch(err =>{
                console.log(err)
            })        
    }
}

export const clearMsgUpdates = (uid, uid2) => {
    return ( disptach, getState, { getFirestore })=>{
        const db = getFirestore()
        const msgUpdates = db.collection("MessageUpdates").doc(uid)
        let tempo = []

        msgUpdates.get()
        .then(snapshot => {
            if(snapshot.data() && snapshot.data().data != undefined){
                snapshot.data().data.map(item => {
                    console.log(item.receiver, uid2)
                    if(item.receiver != uid2 ){
                        tempo.push(item)
                    }
                })
            }
        }).then(() => {

            msgUpdates.set({
               
                data: tempo
            },{ merge: true } ).catch(err =>{
                console.log(err)
            })
        })       
        
    }
}


export const fetchEventGroups = (eventId) => {
    return (dispatch, getState, { getFirestore}) => {
        const db = getFirestore()
        var members = []

        console.log(eventId)

        dispatch({ type: t.FETCHING_GROUPS, status: 'fetching'})

        db.collection("Posts").doc(eventId).get()
        .then(querySnapshot => {
            const mem = querySnapshot.data().group.groupId
            if(mem){
                members = mem
            }
        }).then(() => {
            let FetchAll = members && members.map( member => {
                return  db.collection('Groups').doc(member).get()
              }) 

              Promise.all(FetchAll).then((docs) => {
                let Items = docs.map(doc => doc.data())
                 dispatch({ type: t.FETCHED_GROUPS, status: 'done', groups: Items})
             }).catch(err => {
                 dispatch({ type: t.FAILED_FETCHED_GROUPS, status: 'failed', error: err})
             })
        })
        

    }
}

export const updateGroup = (data, groupId) => {
    return (dispatch, getState, { getFirestore}) => {
        const db = getFirestore()

        db.collection("Groups").doc(groupId).update({
            groupPrice: data.price
        }).then(() => {
       
        }).catch(er => console.warn(err))
        

    }
}





export const sendGroupMessage = (groupId, uid1, chatData ) => {
    return ( disptach, getState, { getFirestore })=>{


        const db = getFirestore( )
        const msgDb = db.collection("GroupMessages").doc(groupId).collection('messages')
     
            msgDb.add({
                id: chatData.msgId,
                sender: uid1,
                status: chatData.status,
                message: chatData.message,
                time: firebase.firestore.Timestamp.fromDate(chatData.time),
                convesationId: groupId,
                imgArr: chatData.imgArr,
                name: chatData.name,
                avatar: chatData.avatar,
                postType: chatData.PostType? chatData.PostType : null

            }).then(() => {
                msgDb.get()
                .then(querySnapshot => {
                   querySnapshot.forEach((doc) => {
                    // console.log(" CHAT MESAGES: ", doc.data())
                   })
                }).catch(err => console.log(err))
            })
            .catch(err =>{
                console.log(err)
            })        

    }
}


export const addGroupAccessories = (accessories, data) => {
    return ( dispatch, getState,  { getFirestore } ) => {

        dispatch({ type: t.FETCHING_GROUP_ACCESSORIES, status: 'fetching', error: null})
        const db = getFirestore()
        const summedPrice = data.prices.afterSplit + parseFloat(data.prices.unSplitablePrices)

        db.collection('Groups').doc(data.groupId).update({
            accessories,
            totalPrice: data.prices.totalPrice,
            groupPrice: summedPrice,
            splitablePrice: data.prices.afterSplit,
            unSplitablePrice: parseFloat(data.prices.unSplitablePrices)
        }).then(() => {
            dispatch({ type: t.GET_GROUP_ACCESSORIES, status: 'done', error: null})
        }).catch(error => {
            console.log(error)
            dispatch({ type: t.GET_GROUP_ACCESSORIES_FAILED, status: 'failed', error: error})
        })
       

    }
}

export const fetchUtils = (groupId) => {
    return (dispatch, getState, { getFirestore }) => {

        dispatch({ type: t.FETCHING_GROUP_ACCESSORIES, status: 'fetching', error: null})

        const db = getFirestore()

        db.collection("Groups").doc(groupId).get()
        .then(snapshotQuery => {
            if(snapshotQuery.data().accessories){
                dispatch({  type: t.GET_GROUP_ACCESSORIES, data:snapshotQuery.data().accessories, status: 'done', error: null })
            }
        }).catch(err => {
            dispatch({ type: t.GET_GROUP_ACCESSORIES_FAILED, status: 'failed', error: err})
        })
    }   
}

export const Unfollow =  (from, to) => {
    return async (dispatch, getState, { getFirestore }) => {


        const db = getFirestore()
        let temp = []

        await db.collection("Users").doc(from).get()
        .then(snapshotQuery => {
            if(snapshotQuery.data().following || snapshotQuery.data().followers){
                snapshotQuery.data().following.map( item => {
                    if(item != to){
                        temp.push(item)
                    }
                })

                if(temp.length >= 0){
                    console.log(temp, to)

                    db.collection("Users").doc(from).update({
                        following: temp,
                        followingCount: temp.length
                    }).then( res => {
                        temp = []
                        db.collection("Users").doc(to).get()
                        .then(snapshotQuery => {
                            if(snapshotQuery.data().following){
                                snapshotQuery.data().following.map( item => {
                                    if(item != from){
                                        temp.push(item)
                                    }
                                })
                        if(temp.length >= 0){
                            console.log(temp, to)
                            db.collection("Users").doc(to).update({
                                following: temp,
                                followingCount: temp.length
                            })
                        }
                            }
                        }).then(() => { 
                            dispatch(unFollowFollowers(from, to))
                        }).catch(err => {
                            console.log(err)
                        })
                    }).catch(err => {
                        console.log(err)
                    })
                }
            }
        }).catch(err => {
            console.log(err)

        })
    }   
}

export const unFollowFollowers =  (from, to) => {
    return async (dispatch, getState, { getFirestore }) => {


        const db = getFirestore()
        let temp = []

        await db.collection("Users").doc(from).get()
        .then(snapshotQuery => {
            if(snapshotQuery.data().followers || snapshotQuery.data().following){
                snapshotQuery.data().followers.map( item => {
                    if(item != to){
                        temp.push(item)
                    }
                })

                if(temp.length >= 0){
                    console.log(temp, from)

                    db.collection("Users").doc(from).update({
                        followers: temp,
                        followersCount: temp.length
                    }).then( res => {
                        temp = []
                        db.collection("Users").doc(to).get()
                        .then(snapshotQuery => {
                            if(snapshotQuery.data().followers || snapshotQuery.data().following){
                                snapshotQuery.data().followers.map( item => {
                                    if(item != from){
                                        temp.push(item)
                                    }
                                })
                        if(temp.length >= 0){
                            console.log(temp, to)
                            db.collection("Users").doc(to).update({
                                followers: temp,
                                followersCount: temp.length
                            })
                        }
                    }
                })
                    }).catch(err => {
                        console.log(err)
                    })
                }
            }
        }).catch(err => {
            console.log(err)

        })
    }   
}

export const addAnnouncement = (groupId, announcement) => {
    return (dispatch, getState, { getFirestore }) => {
        const db = getFirestore()

        console.log("Back: ", groupId, announcement)

        dispatch({type:t.ADDING_ANNOUNCEMENT, status:'start'})

        db.collection("Groups").doc(groupId).update({
            Announcement: announcement
        }).then(() => {
            dispatch({ type: t.ADDED_ANNOUNCEMENT, status: 'done' })
        }).catch(err =>  console.log(err))
    }   
}

export const getAnnouncement = (groupId) => {
    return (dispatch, getState, { getFirestore }) => {
        const db = getFirestore()
        dispatch({type:t.FETCHING_ANNOUNCEMENT, status:'start'})

        db.collection("Groups").doc(groupId).get().then(snapshotQuery=> {
           if( snapshotQuery.data().Announcement){

                console.log(snapshotQuery.data().Announcement)

                dispatch({ type: t.FETCHED_ANNOUNCEMENT, status: 'done', data: snapshotQuery.data().Announcement })
           }
        }).catch(err =>  {
            dispatch({ type: t.FETCHED_ANNOUNCEMENT_FAILED, status: 'failed', data: null, error: err })
            console.log(err)
        })
    }   
}

