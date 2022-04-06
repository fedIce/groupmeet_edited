import React, { useState, useCallback, useEffect } from 'react'
import { GiftedChat, Bubble,  Actions, ActionsProps, Send, MessageText } from 'react-native-gifted-chat'
import { Block, Text } from '../components'
import { StyleSheet, TextInput, TouchableOpacity,ScrollView, Image, Modal, Dimensions, Alert } from 'react-native'
// import { CustomHeader } from '../components/header'
import { theme } from '../constants'
import {View} from 'react-native'
import { firestoreConnect } from 'react-redux-firebase'
import { connect } from 'react-redux'
import { compose } from 'redux'
// import {SendMessageDialog, RecieveMessageDialog} from '../components/MessageDialogs'
import { Feather, Ionicons } from '@expo/vector-icons'
import { sendOneOnOneMessage, listenForChats, clearMsgUpdates } from '../constants/store/utils/actions'
import Store from '../config/Storage'
import * as ImagePicker from 'expo-image-picker'
import moment from 'moment'


import * as utils from '../config/validate'

// import Reactotron from 'reactotron-react-native'
import Builder, { DB } from 'crane-query-builder'; // Import the library
import Fire from '../config/Fire'
import {CarouselFromUrl} from '../components/Carousel'

import firebase from '../config/firebaseCon'
import * as Analytics from 'expo-firebase-analytics';

import Event from '../config/Event'


const LoaderImage = require('../assets/images/chatLoader.gif')
const icon = require('../assets/images/icon.png')

const { width, height} = Dimensions.get('window')

var Firedb = firebase.firestore()



export function Messages  (props) {


    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [replyMode, setReplyMode] = useState(false);
    const [writeMessage, setWriteMessage] = useState(false);
    const [noMessage, setNoMessage] = useState(false);
    const [imageMessage, setIImageMessage] = useState([]);
    const [messageHasImages, setMessageHasImages] = useState(false)
    const [lightBox, setLightBox] = useState({show: false, arr: [], index: 0})

    const [ userStatus, setUsersStatus] = useState({})
    

    const senderId = props.user.uid
    const receiverId = props.navigation.state.params.item.uid
    const convID = senderId > receiverId? senderId+receiverId: receiverId+senderId



    function createFnCounter(fn, invokeBeforeExecution) {
        let count = 0;
        return (snapshot) => {
      
          count++;
          if (count <= invokeBeforeExecution) {
            return null;
          } 
      
          return fn(snapshot, count);    
        }
      }


    function handleActivitySubscription(snapshot, counter) {
        const initialLoad = counter === 1;
                
        snapshot.docChanges().forEach( async function(change) {   
            if (initialLoad) {
                const checkIfMessageExisit = await  Builder()
                                                    .table("OneOnOneChats")
                                                    .where('msgID', change.doc.data().id )
                                                    .count();
                        if(checkIfMessageExisit == 0){
                        
                        }
                // return
            //   console.log("INITAIL LOAD FUNC: ",change.doc.data().postType? change.doc.data().postType: '');          
            } else {
                var data =  []
                data.push({
                    _id: change.doc.data().id,
                    text: change.doc.data().message,
                    createdAt: change.doc.data().time.toDate(),
                    imgArr: change.doc.data().imgArr != null? JSON.parse(change.doc.data().imgArr): null,
                    postType: change.doc.data().postType? change.doc.data().postType: null,
                    user: {
                      _id: change.doc.data().sender,
                      name: change.doc.data().name,
                      avatar: change.doc.data().avatar,
                    },
                    replyMode: change.doc.data().replyMode? change.doc.data().replyMode: false,
                })
            //   console.log("UPDATED FUNC: ",change.doc.data()); 

   
             
              if(Array.isArray(data) && change.doc.data().sender != senderId ){
                data = await data.sort((a, b) => (a.time > b.time) ? 1 : -1)
                await setMessages(previousMessages => GiftedChat.append(previousMessages, data))
                 const localData = {
                        id: change.doc.data().id,
                        type: 'recieved',
                        status: 'seen',
                        sender: change.doc.data().sender,
                        senderAvatar: change.doc.data().avatar,
                        receiver: change.doc.data().receiver,
                        message: change.doc.data().message,
                        senderName: change.doc.data().name,
                        time: change.doc.data().time,
                        conversationID: change.doc.data().convesationId,
                        imgArr: change.doc.data().imgArr,
                        postType: change.doc.data().postType? change.doc.data().postType: null
                    }


                    await Store.store._storeOneOnOneChats_Local(localData)

            await Store.store._updateChatList({
                last_message: change.doc.data().message,
                senderId: change.doc.data().sender,
                senderName: change.doc.data().name,
                senderAvatar:change.doc.data().avatar,
            }).then(() => {
                // console.log("OEDDD")
            })
                   
              }
            }      
          });
      }
      
    const handleActivitySubscriptionWithCounter = 
    createFnCounter(handleActivitySubscription, 0);
      


    useEffect(() => { 
        setLoadingMessages(true)
        let unsubscribe = null;
        Analytics.setCurrentScreen('1-on-1-Chats');

        let temp = []
        Store.store._MarkRead({ senderId: receiverId }).then(() => {
            props.clearMsgUpdates(receiverId, senderId)
            props.navigation.state.params.item ? props.navigation.state.params.item.updateList() : null
        })

        Event.shared.fetchPreviousChatMessages(convID).then(async data => {

            if(Array.isArray(data)){
                
                await setMessages(previousMessages => GiftedChat.append(previousMessages, data.filter(d => !data.last)))
                await data.map(async d => {
                    
                        const localData = {
                            id: d._id,
                            type: 'recieved',
                            status: 'seen',
                            sender: d.sender,
                            senderAvatar: d.avatar,
                            senderName: d.name,
                            receiver: d.receiver,
                            message: d.message,
                            time: d.time,
                            conversationID: d.convesationId,
                            imgArr: d.imgArr,
                            replyMode: JSON.stringify(d.replyMode),
                            postType: d.postType? d.postType: null
                        }
    
    
                        await Store.store._storeOneOnOneChats_Local(localData)
                        await Store.store._updateChatList({
                            last_message: d.message,
                            senderId: d.sender,
                            senderName: d.name,
                            senderAvatar: d.avatar,
                        }).then(() => {
                            props.navigation.state.params.item.updateList()
                        })
                    })
                }
                     

        }).then(() => {
            unsubscribe = Firedb.collection('OneOnOneChats').doc(convID).collection('messages').onSnapshot(handleActivitySubscriptionWithCounter);
        })

        if(!writeMessage){
            const loadLocal = async () => {
                temp = []
                setWriteMessage(true)

                const chats = await Builder()
                .table('OneOnOneChats')
                .where('conversationID', convID )
                .get()

                console.log('======~~',chats)

                if( chats.length > 0 ){

                    // console.log(chats)
                    chats.map( async chat => {
                        if(chat.sender == senderId || chat.receiver == senderId){
                        await temp.push(
                            {
                                _id: chat.id,
                                text: chat.message,
                                createdAt: new Date(chat.time),
                                imgArr: chat.imgArr != null? JSON.parse(chat.imgArr): null,
                                postType: chat.postType? chat.postType: null,
                                user: {
                                    _id: chat.sender,
                                    name: chat.senderName,
                                    avatar: chat.senderAvatar
                                }
                            })
                        }
                    })
                    
                }else{
                    // console.log("NO CHATS AVAILABLE", chats)
                }
                temp = await temp.sort((a, b) => (a.time > b.time) ? 1 : -1)

                setMessages(temp)
            }
            loadLocal().then(() => {
                setLoadingMessages(false)
            });

            setTimeout(() => {
                if(loadingMessages){
                    setLoadingMessages(false)
                    setNoMessage(true)
                }
            }, 5000);
            
            }


           Event.shared.returnUserOnlineStatus(receiverId).then(data => {
               setUsersStatus(data)
           })
            

    //remember to unsubscribe from your realtime listener on umount or you will create a memory leak
        return () => unsubscribe && unsubscribe()
    }, []);


    const _pickImage = async () => {

        try {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
            // aspect: [4,3]
        });
        if (!result.cancelled) {

            const { uri } = result;
            const extensionIndex = uri.lastIndexOf(".");
            const extension = uri.slice(extensionIndex + 1);
            const allowedExtensions = ["jpg", "jpeg", "png"];
            const correspondingMime = ["image/jpeg", "image/jpeg", "image/png"];

            Store.store.CacheFileForUpload({uri, index: imageMessage.length + 1 })
           setIImageMessage([...imageMessage,{ id: imageMessage.length + 1, uri: uri}])
        }

        } catch (E) {
            console.log(E);
        }
    }


    function renderBubble(props) {
    return (
        // Step 3: return the component
        <Bubble
        {...props}
        wrapperStyle={{
            right: {
            padding: 10,
            paddingVertical: 10,
            marginHorizontal: 10,
            marginVertical: 5,
            color: theme.colors.white,
            maxWidth: '80%',
            height: undefined,
            backgroundColor: theme.colors.primary,
            padding: 10,
            borderRadius: 24,
            borderTopRightRadius: 0,
            fontSize: 13,

            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.39,
            shadowRadius: 8.30,
            elevation: 13,   
            },

            left:{
            padding: 10,
            paddingVertical: 10,
            marginHorizontal: 10,
            marginVertical: 5,
            color: theme.colors.white,
            maxWidth: '80%',
            height: undefined,
            backgroundColor: theme.colors.secondary,
            padding: 10,
            borderRadius: 24,
            borderTopLeftRadius: 0,
            fontSize: 13,
            
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.39,
            shadowRadius: 8.30,
            elevation: 13,
            }

        }}
        textStyle={{
            right: {
            color: theme.colors.white
            },
            left:{
                color: theme.colors.white
            }
        }}
        />
    );
    }

    const removeImage = async (id) => {
        const newImages = []
            imageMessage.map(img => {
                if(id != img.id){
                    newImages.push(img)
                }
            })
            setIImageMessage(newImages)

            const updateCache = await Builder()
                                    .table("TempFileCache")
                                    .delete(id).then(() => {
                                        console.log("deleted", id)
                                    })

    }

    function renderChatFooter() {
        if(replyMode != false){
            const name = replyMode.msg.user.name
            const sentBy = replyMode.msg.user._id
            const msg = replyMode.msg.text
            return(
                <View style={{height: 50, flexDirection: 'row'}}>
                    <View style={{height:50, width: 5, backgroundColor: 'red'}}></View>
                    <View style={{flexDirection: 'column'}}>
                        <Text style={{color: 'red', paddingLeft: 10, paddingTop: 5}}>{ sentBy == senderId? 'You': name}</Text>
                        <Text style={{color: 'gray', paddingLeft: 10, paddingTop: 5}}>{msg.length > 50? msg.slice(0, 50)+'...': msg}</Text>
                    </View>
                    <View style={{flex: 1,justifyContent: 'center',alignItems:'flex-end', paddingRight: 10}}>
                        <TouchableOpacity onPress={() => setReplyMode(false)}>
                            <Feather name="x" color="#0084ff" />
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }else if(imageMessage.length > 0){
            setMessageHasImages(true)
            return (
                <View>
                   <ScrollView>
                       <Block row style={{ flexWrap: 'wrap'}}>
                    {
                        imageMessage.map( img => {
                          return (
                                  <Block style={{ maxWidth: 100, height: 100, marginHorizontal: 5}}>
                                   <Image source={{ uri: img.uri }}  style={{ width: "100%", height: "100%", borderRadius: 14, margin: 5}}/>
                                   <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(img.id)}><Feather name="x" size={28} color={theme.colors.white} /></TouchableOpacity>
                                 </Block>
                          )
                        })
                    }
                    </Block>
                  </ScrollView>
                </View>
            )
        }else{
            setMessageHasImages(false)
        }
        
    }

    function viewPost (post) {
        if(post.data.type != 'group'){
            props.navigation.navigate("singlePost", {
                post:{...post, receiver: receiverId},
                user: props.user,
                fromMsg:true,
                

            })
        }else{

            props.navigation.navigate("groupDetails", {
                group: props.navigation.state.params,
                user: props.user,
                groupId: post.data.groupId,
                receiver: receiverId,
                fromMsg:true
            })
        }


    }

    const referenceMessage = (context, msg, user) => {
        setReplyMode({msg: msg, user: user})
        console.log('CONTEXT: ', msg, user)
    }

    function handleOnLongPress (context, msg, user){
        const options = [
            'Copy Message Text',
            'Reply Message',
            'Cancel',
          ];

        const cancelButtonIndex = options.length - 1;
    
        context.actionSheet().showActionSheetWithOptions({
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(msg);
              break;
            case  1:
                referenceMessage(context, msg, user)
          }
        });
    }

    function renderActions(props: Readonly<ActionsProps>) {
    return (
        <Block row style={{ maxWidth: 70 }}>
            <Actions
                {...props}
                    onPressActionButton={() => _pickImage()}
                icon={() => (
                <Feather name={'image'} size={28} color={theme.colors.primary} />
                )}
                onSend={args => console.log(args)}
            />
            <Actions
            {...props}
            // options={{
            //     ['Send Image']: _pickImage,
            // }}
            onPressActionButton={() => console.log("You pressed The Mic")}
            icon={() => (
                <Feather name={'mic'} size={28} color={theme.colors.primary} />
            )}
            onSend={args => console.log(args)}
            />
        </Block>
    )
    }

    const showLightBox = () => {

        const style ={
            width: width, 
            height: undefined,
            aspectRatio: 1,
            resizeMode: 'contain'
        }

        return (
            <Modal 
            visible={lightBox.show}
            transparent={true}
        >
            <Block center middle style={{backgroundColor: theme.colors.semiTransBlack, paddingVertical: 100}}>
                <CarouselFromUrl  illustrations={lightBox.arr} customStyle={style} />
                <TouchableOpacity onPress={() => { setLightBox({ show: false, arr: [], index: 0 })}} style={{ justifyContent:'center', alignItems:'center',  width: 40, height: 40, padding: 10, borderRadius: 25, backgroundColor: theme.colors.accent, position: 'absolute', top: 10, right: 10 }}>
                    <Feather name='x' size={28} color="#FFF" />
                </TouchableOpacity>
            </Block>
       </Modal>
        )
    }
    

    const renderMessageText = (props) => {
        const {
          currentMessage,
        } = props;

        // console.log("Current Message: ", currentMessage)
        const { imgArr } = currentMessage;
        var postType = null
        if(currentMessage.postType != null && currentMessage.postType != undefined){
            postType = JSON.parse(currentMessage.postType)
            if(postType && !postType.data){
                postType = { data: postType }
            }
        }

        var counter = 0
        console.log('CURRENT MESSAGE: ',currentMessage)
        currentMessage.replyMode? console.log(' Reply MODE: ',currentMessage.replyMode):null
        if ( !imgArr && postType == null ) {
          return <MessageText {...props} />;
        }

            if(postType != null && postType.data && postType.data.type == 'group'){
                return (
                    
                    <TouchableOpacity onPress={ () => viewPost(postType) }>
                        <View style={styles.inMsgPost} >
                            <View style={{ flexDirection:'row', alignItems: 'center'}}>
                                <Image source={icon} style={{ width: 60, height:60}} />
                                <View style={{ maxWidth:200, paddingHorizontal: 10}}>
                                    <Text bold title style={{ fontSize: 15 }} >{postType.data.groupName} </Text>
                                    <Text caption color={theme.colors.gray}>{currentMessage.text}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                  );
            }
            
        

        if(postType != null && postType.data && postType.data.type == 'Post'){
            return (


                
                <TouchableOpacity onPress={ () => viewPost(postType) }>
                    <View style={styles.inMsgPost} >
                        <View style={{ width: '100%', flexDirection:'row', alignItems:'center', paddingVertical: 5}}>
                            <Image source={{ uri: postType.data.avatar}} style={styles.avatar}/>
                            <Text bold >{postType.data.username}</Text>
                        </View>
                        <View>
                            <Image source={{uri: postType.data.media[0]}} style={styles.postMedia} />
                        </View>
                    </View>
                </TouchableOpacity>
              );
        }
       
        

        if(postType != null && postType.data && postType.data.type != 'Post'){
            return (

                
                
                <TouchableOpacity onPress={ () => viewPost(postType) }>
                   
                    <View style={styles.inMsgPost} >
                        <View>
                            <Image source={{uri: postType.data.coverImage}} style={styles.postMedia} />
                        </View>
                        <View style={{ position: 'absolute', bottom:5, right:5, width: '100%', flexDirection:'row', alignItems:'center', paddingVertical: 5, backgroundColor: theme.colors.semiTransBlack, borderRadius: 15}}>
                            <Image source={{ uri: postType.data.avatar}} style={{width:20, height: 20, marginHorizontal: 10, borderRadius: 10}}/>
                            <Text  white bold style={{ fontSize: 10, width: 100}} >{postType.data.username}'s {postType.data.title} Event</Text>
                        </View>
                       
                    </View>
                </TouchableOpacity>
              );
        }
        return (
          <View >
              <View style={{ flexWrap: 'wrap', padding: 10, flexDirection: 'row', maxWidth: 350}}>
                {
                    !postType && imgArr.map( (img, index) => {
                            return <TouchableOpacity onPress={() => setLightBox({show: true, arr: imgArr, index })} key={index} style={{ margin: 5}}><Image source={{ uri: img }} style={styles.chatImageThumb}/></TouchableOpacity>
                    })
                }
              </View>
             
            <MessageText {...props}/>
          </View>
        );
      };

    function renderSend(props) {
        return (
            <Send
                {...props}
                style={{ alignItems: 'center', justifyContent: 'center'}}
            >
                <Feather name="send" size={28} color={theme.colors.primary}  style={{ padding: 5 }} />
            </Send>
        );
    }



    const addImageToMessage = async () => {
        
        const count = await Builder()
                            .table("TempFileCache")
                            .count().catch((err) => console.log(err))

                    if( count > 0){
                        return await Builder()
                                    .table("TempFileCache")
                                    .get()
                    } else{
                        return null
                    }
    }

    const onSend = useCallback((messages = []) => {

        const receiver = props.navigation.state.params.item.uid
        const  sender = props.user.uid
        const  avatar = props.user.photoURL
        const  name = props.user.displayName
        const conversationId = receiver > sender? receiver+sender : sender+receiver
        const msgId = `${conversationId}_${utils.generateUUID()}`
        const time = new Date()

        var repackMessage = []
        repackMessage = [...messages,{ replyMode }]

        const getImages = addImageToMessage().then( async res => {
           
            if(res != null){
               await Fire.shared.postMessageImages(res).then( async arr => {
                    // console.log("images: ", arr)
                    repackMessage = await [{
                        _id: messages[0]._id,
                        createdAt: messages[0].createdAt,
                        text: messages[0].text,
                        imgArr: arr,
                        user: {
                          _id: messages[0].user._id,
                          avatar: messages[0].user.avatar,
                          name: messages[0].user.name,
                        },
                        replyMode :replyMode
                    }]
                    return arr
                }).then( async () => {

                    // console.log("images2: ", repackMessage)
                    const data = {
                        id: msgId,
                        type: 'sent',
                        status: 'loading',
                        sender: sender,
                        receiver: receiver,
                        message: messages[0].text,
                        time: time,
                        conversationID: conversationId,
                        imgArr: repackMessage[0].imgArr?  JSON.stringify(repackMessage[0].imgArr): null,
                        replyMode : JSON.stringify(replyMode)
                    }
            
                   await setMessages(previousMessages => GiftedChat.append(previousMessages, repackMessage))
                   await  Store.store._storeOneOnOneChats_Local(data).then(() => {
                        props.addMsg(conversationId, sender, receiver, avatar, name, { msgId, status: 'loading', message: messages[0].text, time: messages[0].createdAt, imgArr: repackMessage[0].imgArr?  JSON.stringify(repackMessage[0].imgArr): null , replyMode})
            
                    })
                    await Event.shared.sendChatNotification({name: props.user.displayName },{uid: receiver},messages[0].text)
            
                }).then(async () => {

                    Store.store.dropCacheTable("TempFileCache").then(() => {
                        Store.store.this.createFileTempCache()
                    })
                    setIImageMessage([])
                    await Store.store._updateChatList({
                        last_message: messages[0].text,
                        senderId: item.uid,
                        senderName: item.username,
                        senderAvatar: item.avatar,
                    }).then(() => {
                        item.updateList()
                        setReplyMode(false)
                        // console.log("OEDDD")
                    })

                }).catch(err => console.log(err))
            }else{
                const data = {
                    id: msgId,
                    type: 'sent',
                    status: 'loading',
                    sender: sender,
                    receiver: receiver,
                    message: messages[0].text,
                    time: time,
                    conversationID: conversationId,
                    imgArr: null,
                    replyMode : JSON.stringify(replyMode)

                }
        
               await setMessages(previousMessages => GiftedChat.append(previousMessages, repackMessage))
               await  Store.store._storeOneOnOneChats_Local(data).then(() => {
                    props.addMsg(conversationId, sender, receiver, avatar, name, { msgId, status: 'loading', message: messages[0].text, time: messages[0].createdAt, imgArr: null, replyMode })
        
                })
                await Store.store._updateChatList({
                    last_message: messages[0].text,
                    senderId: item.uid,
                    senderName: item.username,
                    senderAvatar: item.avatar,
                }).then(() => {
                    item.updateList()
                    setReplyMode(false)
                    // console.log("OEDDD")
                })
                await Event.shared.sendChatNotification({name: props.user.displayName },{uid: receiver},messages[0].text)
            
            }
        })
        
}, [])




    
        const {item} = props.navigation.state.params
        const {navigation} = props
        const { user } = props
        const {uid} = item
        var p = null
        


        // console.log(item)
        return (
            <Block>
                <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginHorizontal: 10}} ><Ionicons name="md-arrow-back" size={24} color={theme.colors.gray2}/></TouchableOpacity>
                <View style={{ flexDirection:'row', alignItems:'center'}}>
                    <TouchableOpacity onPress={() => navigation.navigate("Profile", { userId: item.uid})}><Image source={{ uri: item.avatar }} style={styles.avatar}/></TouchableOpacity>
                    <View>
                        <Text bold h3>{item.username}</Text>
                        {/* <Text bold h3>{JSON.stringify(userStatus)}</Text> */}
                        {userStatus ? userStatus.onlineStatus? 
                        <View style={{flexDirection:'row', alignItems: 'center'}}>
                            <Text caption color={theme.colors.gray2}>online </Text>
                            <View style={styles.onlineDot}></View>
                        </View> 
                        : <Text caption color={theme.colors.gray2}>{moment(userStatus.lastSeen).fromNow()}</Text> : null}
                    </View>
                </View>
                </View>
                {
                    loadingMessages?
                    <Block center middle>
                        <Image source={LoaderImage} style={styles.loaderImage}/>
                    </Block> 
                        :
                    <GiftedChat
                        messages={messages}
                        onSend={messages => onSend(messages)}
                        renderAvatar={() => null}
                        user={{
                            _id: user.uid,
                            avatar:null,
                        }}
                        // loadEarlier={true}
                        onLongPress={(context, message) => handleOnLongPress(context, message, user)}
                        renderBubble={renderBubble}
                        renderActions={renderActions}
                        renderSend={renderSend}
                        renderChatFooter={renderChatFooter}
                        renderMessageText={renderMessageText}
                        />
                }
                {showLightBox()}
            </Block>
           
        )
}


const styles = StyleSheet.create({
    container:{
        flex: 11,
        height: '100%',
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 20
    },
    inputContainer:{
        flex: 1,
        justifyContent: 'center',
        alignItems:'center',
        marginHorizontal:10,
        paddingHorizontal:10,
        borderWidth: 1,
        borderColor: theme.colors.gray,
        borderRadius: 40,
        marginVertical: 10,
        backgroundColor: theme.colors.white,
    },
    input:{
        width:'90%',
        paddingHorizontal: 20,
        fontSize: 15,
        color: theme.colors.black
    },
    sendBtn:{
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent:'center',
        padding: 10,
        borderRadius: 20
    },
    bulkActionBar:{
        flexDirection: 'row',
        maxHeight: 50,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    actionBtn:{
        marginHorizontal: 30,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor: theme.colors.white
    },
    loaderImage:{
        width: 100,
        height:100
    },
    removeImageBtn:{
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: theme.colors.semiTransBlack,
        width: 40,
        height: 40,
        padding: 10,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center'
    },
    chatImageThumb:{
        width: 100,
        height: 100,
        borderRadius: 14
    },
    avatar:{
        width: 40, 
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10
    },
    header:{
        width:'100%',
        height:80,
        flexDirection:'row', 
        alignItems:'center',
        backgroundColor:theme.colors.white
    },
    postMedia:{
        width: 200,
        height:150,
        borderRadius: 10,
        resizeMode:'contain'
    },
    inMsgPost:{
        padding: 10,
        backgroundColor: theme.colors.white,
        borderRadius: 10
    },
    onlineDot:{
        width:10,
        height: 10,
        borderRadius: 5, 
        backgroundColor: theme.colors.secondary,
        marginLeft:5
       
    }
})


const mapStateToProps = (state) => {
    return {
        user: state.firebase.auth,
        messageList : state.firestore.data.messages != null? Object.values(state.firestore.data.messages): []
    }
}


const mapDispatchToProps = (dispatch) => {
    return {
        addMsg: ( conversationId, uid1, uid2, avatar, name, chatData ) => dispatch(sendOneOnOneMessage( conversationId, uid1, uid2, avatar, name, chatData )),
        ListenForNewMessages : (uid1, uid2) => dispatch(listenForChats(uid1, uid2)),
        clearMsgUpdates: (uid, uid2) => dispatch(clearMsgUpdates(uid, uid2))
    }
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    firestoreConnect((props) => {
        const user = props.user.uid
        const receiver =  props.navigation.state.params.item.uid
        const msgDoc = user > receiver? user+receiver : receiver+user
        return [
            {
                collection: 'OneOnOneChats',
                doc: msgDoc,
                subcollections: [{collection: 'messages'}],
                storeAs: 'messages',
                orderBy: [ 'time ', 'desc']
            }
        ]
    })
)(Messages)