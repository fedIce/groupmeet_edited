import Fire from './Fire'
import firebase from './firebaseCon'
import * as utils from '../config/validate'
import { error } from 'react-native-gifted-chat/lib/utils'
import Store from './Storage'
import sendLocalPushNotificationAsync from '../config/ExpoServer'
import Builder, { DB } from 'crane-query-builder'; // 

const fb = require('firebase')

const db = firebase.firestore()
const storageRef = firebase.storage()

class Event {
    constructor(){

    }

    createEvent = async (data) => {
        const imgUri = await Fire.shared.uploadImageAsync(data.coverImage, "EventCoverPhoto")
        // console.log(data)
        new Promise((response, reject) => {
            db.collection("Posts").add({

                username: data.username,
                avatar: data.avatar,
                title: data.title,
                group: data.group,
                startDate: data.eventDates,
                maxCapacity: data.maxCapacity,
                eventDates:  data.eventDates,
                description: data.description,
                coverImage: imgUri,
                location: data.location,
                eventType: data.eventType,
                uid: Fire.shared.uid,
                type: 'event',
                registered: data.registered,
                ticketPrice: data.price,
                numberOfRegistrations: data.maxCapacity,
                global_location: [
                    //state, country, city
                ],
                eventCategory: data.eventCategory,
                status: {
                    //upcoming, happening, done
                },
                registration_open: {
                    //open, closed, closing_date
                },
                postedAt: firebase.firestore.FieldValue.serverTimestamp()

            }).then(res => {
                return response(res)
            }).catch(err => {
               return reject(err)
            })
        })
    }

    //Load Feeds 

    fetchPreviousChatMessages = async (convId, loadmore, last = null) => {
        var tmp = [];

        var first = db.collection("OneOnOneChats").doc(convID).collection('messages')
        .orderBy("time")
        .limit(25);

        return await first.get().then((querysnap) => {

            querysnap.forEach( async snap => {
                
                tmp.push( {
                     _id: snap.id,
                     text: snap.data().message,
                     createdAt: snap.data().time.toDate(),
                     imgArr: snap.data().imgArr != null? JSON.parse(snap.data().imgArr): null,
                     postType: snap.data().postType? snap.data().postType: null,
                     user: {
                         _id: snap.data().sender,
                         name: snap.data().name,
                         avatar: snap.data().avatar,
                     },
                     sender: snap.data().sender,
                     senderAvatar: snap.data().avatar,
                     senderName: snap.data().name,
                     receiver: snap.data().receiver,
                     message: snap.data().message,
                     time: snap.data().time.toDate(),
                     conversationID: snap.data().convesationId,
                     replyMode: snap.data().replyMode ? snap.data().replyMode:null,
                  })
                 // }
             })


            // Get the last visible document
            var lastVisible = querysnap.docs[querysnap.docs.length-1];
            tmp.push({last: lastVisible});

            console.log("last", lastVisible);

            // Construct a new query starting at this document,
            // get the next 25 cities.
            if(loadmore == true && last != null){

            
                 var next = db.collection("OneOnOneChats").doc(convID).collection('messages')
                    .orderBy("time")
                    .startAfter(last)
                    .limit(25);

                    next.forEach( async snap => {
                
                        tmp.push( {
                             _id: snap.id,
                             text: snap.data().message,
                             createdAt: snap.data().time.toDate(),
                             imgArr: snap.data().imgArr != null? JSON.parse(snap.data().imgArr): null,
                             postType: snap.data().postType? snap.data().postType: null,
                             user: {
                                 _id: snap.data().sender,
                                 name: snap.data().name,
                                 avatar: snap.data().avatar,
                             },
                             sender: snap.data().sender,
                             senderAvatar: snap.data().avatar,
                             senderName: snap.data().name,
                             receiver: snap.data().receiver,
                             message: snap.data().message,
                             time: snap.data().time.toDate(),
                             conversationID: snap.data().convesationId,
                          })
                         // }
                     })
                 }
            });


        return await db.collection("OneOnOneChats").doc(convId).collection('messages').get()
        .then( async querysnap => {
            querysnap.forEach( async snap => {
                
               tmp.push( {
                    _id: snap.id,
                    text: snap.data().message,
                    createdAt: snap.data().time.toDate(),
                    imgArr: snap.data().imgArr != null? JSON.parse(snap.data().imgArr): null,
                    postType: snap.data().postType? snap.data().postType: null,
                    user: {
                        _id: snap.data().sender,
                        name: snap.data().name,
                        avatar: snap.data().avatar,
                    },
                    sender: snap.data().sender,
                    senderAvatar: snap.data().avatar,
                    senderName: snap.data().name,
                    receiver: snap.data().receiver,
                    message: snap.data().message,
                    time: snap.data().time.toDate(),
                    conversationID: snap.data().convesationId,
                 })
                // }
            })




            tmp = await tmp.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1)
            return tmp
        })
    }


    sendNewGroupWelcomeMessage = (groupId, senderId, name, avatar) => {
      
        new Promise( async (response, reject) => {
            await db.collection("GroupMessages").doc(groupId).collection("messages").add({

                convesationId: groupId,
                id: groupId,
                name,
                avatar,
                imgArr: null,
                message: "Welcome to the party. Make sure to see the group details and read the group instructions. Goodluck!",
                sender: senderId,
                status: 'seen',
                time: firebase.firestore.FieldValue.serverTimestamp()

            }).then(res => {
                return response(res)
            }).catch(err => {
               return reject(err)
            })
        })
    }

    fetchGroupAccessories = (groupId) => {


        return db.collection('Groups').doc(groupId).get()
            .then( querySnapshot => {
                if(querySnapshot.data().accessories){
                    return querySnapshot.data().accessories
                }else{
                    return []
                }
            }).catch(error => console.log(error))

    }

    fetchGroupData = (groupId) => {

        return db.collection('Groups').doc(groupId).get()
            .then( querySnapshot => {
                   return querySnapshot.data()
            }).catch(error => console.log(error))

    }

    LeaveGroup = (userId, groupId, eventId) => {

        var temp = []
        var tempMember = []
        var tempGroup = []


        return new Promise((res, rej) => {
            db.collection("Users").doc(userId).get()
            .then( querySnapshot => {
                if(querySnapshot.data().registeredGroups){
                    querySnapshot.data().registeredGroups.map(group => {
                        if(group.groupId != groupId){
                            temp.push(group)
                        }
                    })

                }
            }).then(() => {
                db.collection("Users").doc(userId).update({
                    registeredGroups: temp
                })
            }).then(() => {
                db.collection("Groups").doc(groupId).get()
                .then(querySnapshot => {
                    tempMember = []
                    if(querySnapshot.data().group){
                        tempGroup = querySnapshot.data()
                        querySnapshot.data().group.members.map( member => {
                            if(member.uid != userId){
                                tempMember.push(member)
                            }
                        })
                    }
                }).then(() => {
                    db.collection("Groups").doc(groupId).update({
                        "group.members": tempMember,
                        groupPrice: this.recalculateGroupPrice(tempGroup)
                    })
                }).then(() => {

                    db.collection("Posts").doc(eventId).update({
                        numberOfRegistrations: firebase.firestore.FieldValue.increment(-1)
                    })
                }).then(() => {
                    
                    //Remove Local Group Chat Data From LocalDb
                    Store.store._clearGroupChat(groupId)
                    res(true)
                
                }).catch( err => rej(err) )
            }).catch( err => rej(err) )
        })
    }

    RemoveGroupFromUserGroupsList = (uid, groupId) => {
        const TmpGroupList = [];

       return db.collection('Users').doc(uid).get()
        .then( querySnapshot => {
            var listRef = querySnapshot.data()
            if(listRef.registeredGroups){
                listRef.registeredGroups.map( grp_id => {
                    if(grp_id != groupId){
                        TmpGroupList.push(grp_id)
                    }
                })
            }
        }).then( () => {
            return TmpGroupList
        })
    } 

    DeleteGroup = (groupId, eventId) => {

        var groupArr = []
        var membersArr = []

        console.log( groupId, eventId )

        return new Promise((res, rej) => {
            return db.collection('Groups').doc(groupId).get()
            .then(querySnapshot => {
                if(querySnapshot.data().group){
                    querySnapshot.data().group.members.map( member => {
                        membersArr.push(member.uid)
                    })
                }
            }).then(async ()=>{
                // console.log('left groups :-----',this.RemoveGroupFromUserGroupsList(uid, groupId))
               await  membersArr.map( uid => {
                    console.log(uid, groupId, eventId )
                    this.LeaveGroup(uid, groupId, eventId ).then(() => {
                        db.collection('Users').doc(uid).update({
                            registeredGroups: this.RemoveGroupFromUserGroupsList(uid, groupId)
                        }).catch(err => rej(err))
                    }) 
                })
            }).then(async () => {
                await db.collection("Posts").doc(eventId).get()
                    .then(querySnapshot => {
                    groupArr = []
                    if(querySnapshot.data().group){
                        querySnapshot.data().group.groupId.map( id => {
                            if(id != groupId){
                                groupArr.push(id)
                            }
                        })
                    }
                    }).then(async () => {
                        await db.collection("Posts").doc(eventId).update({
                            'group.groupId': groupArr
                        })    

                    }).then(async () => {
                        await db.collection('Groups').doc(groupId).get()
                        .then( querySnapshot => {
                            querySnapshot.ref.delete()
                        })
                    }).then(async () => {
                        await db.collection('GroupMessages').doc(groupId).delete()
                    }).then(async () => {
                        await Store.store._clearGroupChat(groupId)
                    }).then(() => res(true)).catch(err => rej(err))

            }) 
        })
        
}


    calculateGroupPrice = (group) => {

        //Helper Function

        var groupPrice = group.groupPrice
        var chargeMethod = parseInt(group.eventChargingMethod)
        var eventPrice = group.eventPrice
        var nonSplitable = group.unSplitablePrice? group.unSplitablePrice : 0
        var splitable = group.splitablePrice? group.splitablePrice : 0
        const discount = ((chargeMethod * (group.group.members.length + 1))/100) * parseFloat(eventPrice)
        var newEventPrice = 0

        if(group.eventChargingMethod == "FullPrice" || group.eventChargingMethod == 0){
            newEventPrice = parseFloat(eventPrice)
        }

        if(group.eventChargingMethod == "SplitEqually"){
            newEventPrice = parseFloat(eventPrice) / (group.group.members.length + 1)
        }

        if(chargeMethod >= 1){
            newEventPrice = parseFloat(eventPrice) - discount
        }

        splitable = parseFloat(splitable) / (group.group.members.length + 1)

        groupPrice = newEventPrice + splitable + nonSplitable

        console.log("EVENT PRICE: ", groupPrice)

        return groupPrice
    }

    fetchUserPushToken = (uid) => {
        return db.collection("Users").doc(uid).get()
        .then( querySnapshot => {
            if(querySnapshot.data().pushToken){
                
                console.log("Got Token: ", querySnapshot.data().pushToken)
                return  querySnapshot.data().pushToken
            }else{
                return false
            }
        })
    }

    sendLikeNotification = async (sender, reciever) => {
        const token = await this.fetchUserPushToken(reciever.uid)
        if (token){
             await sendLocalPushNotificationAsync({ token, title: 'GroupMeet - New Like', body: `${sender.name} Liked Your Post` })
             console.log("Push Notification Sent")
            }
    }

    sendSharedLikeNotification = async (sender, reciever) => {
        const token = await this.fetchUserPushToken(reciever.uid)
        if (token){
             await sendLocalPushNotificationAsync({ token, title: 'GroupMeet - New Like', body: `${sender.name} Liked a post you shared` })
             console.log("Push Notification Sent")
            }
    }

    sendShareNotification = async (sender, reciever) => {
        const token = await this.fetchUserPushToken(reciever.uid)
        if (token){
             await sendLocalPushNotificationAsync({ token, title: 'GroupMeet - New Share', body: `${sender.name} Shared a post` })
             console.log("Push Notification Sent")
            }
    }

    sendGroupInviteNotification = async (sender, reciever, groupName) => {
        const token = await this.fetchUserPushToken(reciever.uid)
        if (token){
             await sendLocalPushNotificationAsync({ token, title: 'GroupMeet - Group Invite', body: `${sender.name} invited you to join ${groupName}` })
             console.log("Push Notification Sent")
            }
    }

    sendChatNotification = async (sender, reciever,msg) => {
        const token = await this.fetchUserPushToken(reciever.uid)
        if (token){
             await sendLocalPushNotificationAsync({ token, title: 'GroupMeet - New Message', body: `${sender.name}: ${msg.length > 30? msg.slice(0, 30)+"...": msg}` }, '', { senderName: sender.name })
             console.log("Push Notification Sent", token, sender, reciever, msg.length > 15? msg.slice(0, 15)+"...": msg, msg.length )
            }
    }

    sendRequestNotification = async (sender, reciever) => {
        const token = await this.fetchUserPushToken(reciever.uid)
        if (token){
             await sendLocalPushNotificationAsync({ token, title: 'GroupMeet - New Follow Request', body: `${sender.name} has requested to follow you`})
            }
    }

    hasPendingRequests = async (user) => {
       return await db.collection('Users').doc(user).get()
        .then(querySnapshot => {
            if(querySnapshot.data() && querySnapshot.data.requests.length > 0){
                if(querySnapshot.data.requests.length > 0){
                    return querySnapshot.data.requests.length
                }else{
                    false
                }
            }
        })
    }


    recalculateGroupPrice = (group) => {

        //Helper Function

        var groupPrice = group.groupPrice
        var chargeMethod = parseInt(group.eventChargingMethod)
        var eventPrice = group.eventPrice
        var nonSplitable = group.unSplitablePrice? group.unSplitablePrice : 0
        var splitable = group.splitablePrice? group.splitablePrice : 0
        const discount = ((chargeMethod * (group.group.members.length - 1))/100) * parseFloat(eventPrice)
        var newEventPrice = 0

        if(group.eventChargingMethod == "FullPrice" || group.eventChargingMethod == 0){
            newEventPrice = parseFloat(eventPrice)
        }

        if(group.eventChargingMethod == "SplitEqually"){
            newEventPrice = parseFloat(eventPrice) / (group.group.members.length - 1)
        }

        if(chargeMethod >= 1){
            newEventPrice = parseFloat(eventPrice) + discount
        }

        splitable = parseFloat(splitable) / (group.group.members.length - 1)

        groupPrice = newEventPrice + splitable + nonSplitable

        console.log("EVENT PRICE: ", groupPrice)

        return groupPrice
    }

    storeUserPushNotificationId = async (token) => {

        const uid = await fb.auth().currentUser.uid

        return db.collection("Users").doc(uid).update({
            pushToken: token
        }).then(() => {
            return true
        }).catch((err) => {
            console.log(err)
            return false
        })
    }

    changeOnlineStatus = async (status) => {

        const uid = await fb.auth().currentUser.uid

        return db.collection("Users").doc(uid).update({
            onlineStatus: status,
            lastSeen: new Date()
        }).then(() => {
            return true
        }).catch((err) => {
            console.log(err)
            return false
        })
    }


    fetchFollowing = async (user) => {

       return await db.collection("Users").doc(user).get()
        .then(querySnapshot => {
            if(querySnapshot.data().following){
                return querySnapshot.data().following
            }
        })
    }


    fetchUsersById = (id) => {
        if(Array.isArray(id)){
            const AllUsers = id.map( user => {
                return db.collection("Users").doc(user).get()
            })

            return Promise.all(AllUsers).then((docs) => {
                let Items = docs.map(doc => doc.data())
                return Items
             }).catch(err => {
                 console.log(err)
             })
        }else{
            db.collection("Users").doc(id).get()
            .then( snapShot => {
                return snapShot.data()
            })
        }
    }

    returnUserOnlineStatus = async (user) => {

        return await db.collection("Users").doc(user).get()
        .then(querySnapshot => {

            if(querySnapshot.data().lastSeen){
                return { onlineStatus: querySnapshot.data().onlineStatus, lastSeen: querySnapshot.data().lastSeen.toDate() }
            }
        }).catch(err => console.log(err))
    }

    AssignGroup = (user, data) => {

        var newMembers = []

        const ticketNo = utils.generateUUID() //Build Ticket Generating Function

        

        console.log("GROUPID: ",data.groupId.groupId)
        new Promise( async (response, reject) => {
            await  db.collection("Users").doc(user.uid).update({
                        
                        registeredGroups: firebase.firestore.FieldValue.arrayUnion({groupId: data.groupId.groupId, eventId: data.groupId.eventId, groupName: data.groupId.groupName, registration_close_date: Date.parse(data.groupId.registration_closing_date)}),
                        // tickets:firebase.firestore.FieldValue.arrayUnion({ticketNo, groupId: data.groupId.groupId, eventId: data.groupId.eventId})
                
            }).then(res => {
                db.collection("Groups").doc(data.groupId.groupId).get()
                .then(querySnapshot => {
                    if(querySnapshot.data().group){
                        newMembers = querySnapshot.data().group.members
                    }else{
                        newMembers.push(querySnapshot.data().group.members)
                    }

                    console.log("New Members: ",newMembers)
                    
                }).then(() => {
                    newMembers.push({
                        uid: user.uid,
                        role: "member",
                        avatar: user.photoURL,
                        name: user.displayName,
                    })
                    db.collection("Groups").doc(data.groupId.groupId).update({
                        "group.members": newMembers,
                        "totalPrice": data.groupId.totalPrice? parseInt(data.groupId.totalPrice) : parseInt(data.groupId.eventPrice),
                        "groupPrice": this.calculateGroupPrice(data.groupId),
                        openSlots: data.groupId.openSlot? parseInt(data.groupId.openSlots) - 1 : parseInt(data.groupId.maxCapacity) - 1
                    }).then(() => {
                        db.collection("Posts").doc(data.groupId.eventId).update({
                       
                            // registeredTickets: firebase.firestore.FieldValue.arrayUnion({ticketNo, groupId: data.groupId.groupId, eventId: data.groupId.eventId, user: newMembers }),
                            numberOfRegistrations: firebase.firestore.FieldValue.increment(1)
                        })
                    })
                })
                
            }).catch(err => console.log(err))
        
     })
    }

    CloudStorageRemoveImage = (path) => {
        //Helper Function
        return storageRef.ref(path).delete()
    }

    deleteCollection = async (collection, postId, whereClause = null) => {

        if(whereClause != null){
            var deletePosts = db.collection(collection).where(whereClause).doc(postId);
            return await deletePosts.get().then(function(querySnapshot) {

                if(collection == 'Posts'){
                    if(querySnapshot.data().coverImage){
                        CloudStorageRemoveImage(querySnapshot.data().coverImage).then(() => {
                            querySnapshot.ref.delete();
                        })
                    }else if(querySnapshot.data().media){
                        querySnapshot.data().media.map(imagePath => {
                            CloudStorageRemoveImage(imagePath).then(() => {
                                querySnapshot.ref.delete();
                            })
                        })
                    }
                }

                    
            });
        }else{
            var deletePosts = db.collection(collection).doc(postId);
            return await deletePosts.get().then(function(querySnapshot) {
                    querySnapshot.ref.delete();
            });
        }
       
    }


    deletePost = async (postId) => {
       await this.deleteCollection('Posts', postId)
        .then( async () => {
           await this.deleteCollection('Likes', postId )
        }).then(async () => {
           await this.deleteCollection('Comments', postId )
        })
    }
   


    createGroup = async (data) => {

        var groupId = []
        var docRef = ""

        return new Promise((response, reject) => {
            db.collection("Groups").add({

                eventId: data.eventId,
                groupName: data.groupName,
                maxCapacity: data.maxCap,
                GroupDescription: data.desc,
                requirements: data.requirements,
                registration_closing_date: data.closeReg,
                openStatus: data.status,
                members:[
                    { 
                        uid: data.user,
                        role: "planner",
                        avatar: data.avatar,
                        name: data.name
                    }
                ],
                openSlots: data.openSlots,
                groupPrice: data.eventPrice,
                eventChargingMethod: data.eventChargingMethod,
                eventPrice: data.eventPrice,
                postedAt: firebase.firestore.FieldValue.serverTimestamp()

            }).then(res => {
                docRef = res.id
                
                db.collection("Posts").doc(data.eventId).get()
                .then(querySnapshot => {
                    if(querySnapshot.data().group.groupId != undefined){
                        if(!Array.isArray(querySnapshot.data().group.groupId)){
                            groupId.push(querySnapshot.data().group.groupId)
                        }else{
                            groupId = querySnapshot.data().group.groupId
                        }
                    }
                   
                }).then(() => {
                    db.collection("Groups").doc(docRef).update({
                        groupId: docRef,
                        "group.members":[
                            { 
                                uid: data.user,
                                role: "planner",
                                avatar: data.avatar,
                                name: data.name
                            }
                        ],
                    }).then(() => {
                    groupId.push(docRef)
                    db.collection("Posts").doc(data.eventId).update({
                        "group.members": { planner: data.user },
                        "group.groupId" :groupId
                    }).catch(er => console.warn(err))
                }).then(() => {
                    db.collection("Users").doc(data.user).update({
                       
                       registeredGroups: firebase.firestore.FieldValue.arrayUnion({groupId: docRef, eventId: data.eventId, groupName: data.groupName, registration_close_date: data.closeReg})
                   
                 })
               }).catch(err => console.warn(err))


                    this.sendNewGroupWelcomeMessage(docRef, data.user,data.name, data.avatar)
                    return response(docRef)
                }).catch(err => {
                    return reject(err)
                 })
            }).catch(err => {
               return reject(err)
            })
        })
    }
}

Event.shared = new Event()

export default Event