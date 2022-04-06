import React, { useState, useCallback, useEffect } from 'react'
import { GiftedChat, Bubble,  Actions, ActionsProps, Send, MessageText } from 'react-native-gifted-chat'
import { Block, Text } from '../../components'
import { StyleSheet, TextInput, TouchableOpacity,ScrollView, Image, Modal, Dimensions } from 'react-native'
import { CustomHeader } from '../../components/header'
import { theme } from '../../constants'
import {View} from 'react-native'
import { firestoreConnect } from 'react-redux-firebase'
import { connect } from 'react-redux'
import { compose } from 'redux'
import {SendMessageDialog, RecieveMessageDialog} from '../../components/MessageDialogs'
import { Feather, Ionicons } from '@expo/vector-icons'
import { sendGroupMessage } from '../../constants/store/utils/actions'
import Store from '../../config/Storage'
import * as ImagePicker from 'expo-image-picker'
import * as Analytics from 'expo-firebase-analytics';



import * as utils from '../../config/validate'

import Reactotron from 'reactotron-react-native'
import Builder, { DB } from 'crane-query-builder'; // Import the library
import Fire from '../../config/Fire'
import {CarouselFromUrl} from '../../components/Carousel'

import firebase from '../../config/firebaseCon'

const LoaderImage = require('../../assets/images/chatLoader.gif')

const { width, height} = Dimensions.get('window')

var Firedb = firebase.firestore()




export function GroupChat  (props) {


    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [writeMessage, setWriteMessage] = useState(false);
    const [noMessage, setNoMessage] = useState(false);
    const [imageMessage, setIImageMessage] = useState([]);
    const [messageHasImages, setMessageHasImages] = useState(false)
    const [lightBox, setLightBox] = useState({show: false, arr: [], index: 0})
    

    const senderId = props.user.uid
    const convID = props.navigation.state.params.groupId
    



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
                                                    .table("GroupChat")
                                                    .where('msgID', change.doc.data().id )
                                                    .count()
                        if(checkIfMessageExisit == 0){
                            var data =  []
                            data.push({
                                _id: change.doc.data().id,
                                text: change.doc.data().message,
                                createdAt: change.doc.data().time.toDate(),
                                imgArr: change.doc.data().imgArr != null? JSON.parse(change.doc.data().imgArr): null,
                                user: {
                                  _id: change.doc.data().sender,
                                  name: change.doc.data().name,
                                  avatar: change.doc.data().avatar
                                }
                            })
                        //   console.log("INITIAL FUNC: ",change.doc.data()); 
                         
                          if(Array.isArray(data) && change.doc.data().sender != senderId || change.doc.data().id ==  props.navigation.state.params.groupId ){

                            data = await data.sort((a, b) => (a.time > b.time) ? 1 : -1)

                            await setMessages(previousMessages => GiftedChat.append(previousMessages, data))
                             const localData = {
                                    id: change.doc.data().id,
                                    type: 'recieved',
                                    status: 'seen',
                                    sender: change.doc.data().sender,
                                    // receiver: change.doc.data().receiver,
                                    message: change.doc.data().message,
                                    time: change.doc.data().time.toDate(),
                                    conversationID: change.doc.data().convesationId,
                                    imgArr: change.doc.data().imgArr,
                                    avatar: change.doc.data().avatar,
                                    name: change.doc.data().name
                                    
                                }
            
            
                                await Store.store._storeGroupChats_Local(localData)
                          }
                        }
                // return
            //   console.log("INITAIL LOAD FUNC: ", change.doc.data());          
            } else {
                var data =  []
                data.push({
                    _id: change.doc.data().id,
                    text: change.doc.data().message,
                    createdAt: change.doc.data().time.toDate(),
                    imgArr: change.doc.data().imgArr != null? JSON.parse(change.doc.data().imgArr): null,
                    user: {
                      _id: change.doc.data().sender,
                      name: change.doc.data().name,
                      avatar: change.doc.data().avatar,
                    }
                })
            //   console.log("UPDATED FUNC: ",change.doc.data()); 
             
              if(Array.isArray(data) && change.doc.data().sender != senderId || change.doc.data().id ==  props.navigation.state.params.groupId ){
                await setMessages(previousMessages => GiftedChat.append(previousMessages, data))
                 const localData = {
                        id: change.doc.data().id,
                        type: 'recieved',
                        status: 'seen',
                        sender: change.doc.data().sender,
                        message: change.doc.data().message,
                        time: change.doc.data().time.toDate(),
                        conversationID: change.doc.data().convesationId,
                        imgArr: change.doc.data().imgArr,
                        avatar: change.doc.data().avatar,
                        name: change.doc.data().name
                    }


                    await Store.store._storeGroupChats_Local(localData)
              }
            }      
          });
      }
      
    const handleActivitySubscriptionWithCounter = 
    createFnCounter(handleActivitySubscription, 0);
      


    useEffect(() => { 
        setLoadingMessages(true)
        Analytics.setCurrentScreen('Group-Chats');


        let temp = []
        const unsubscribe = Firedb.collection('GroupMessages').doc(convID).collection('messages').onSnapshot(handleActivitySubscriptionWithCounter);

        if(!writeMessage){
            const loadLocal = async () => {
                temp = []
                setWriteMessage(true)

                const chats = await Builder()
                .table('GroupChat')
                .where('conversationID', convID )
                .get()

                if( chats.length > 0 ){
                    chats.map( async chat => {
                        // if( chat.sender == senderId ){
                        await temp.push(
                            {
                                _id: chat.id,
                                text: chat.message,
                                createdAt: new Date(chat.time),
                                imgArr: chat.imgArr != null? JSON.parse(chat.imgArr): null,
                                user: {
                                    _id: chat.sender,
                                    name: chat.name,
                                    avatar: chat.avatar
                                }
                            })
                        // }
                    })
                    
                }else{
                    console.log("NO CHATS AVAILABLE", chats)
                }
                temp = temp.sort((a, b) => (a.time > b.time) ? 1 : -1)
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

            

    //remember to unsubscribe from your realtime listener on umount or you will create a memory leak
        return () => unsubscribe()
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
        if(imageMessage.length > 0){
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
        var counter = 0
        if (!imgArr) {
          return <MessageText {...props} />;
        }
        return (
          <View >
              <View style={{ flexWrap: 'wrap', padding: 10, flexDirection: 'row', maxWidth: 350}}>
                {
                    imgArr.map( (img, index) => {
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

        const  sender = props.user.uid
        const conversationId =  props.navigation.state.params.groupId
        const msgId = `${conversationId}_${utils.generateUUID()}`
        const time = new Date()

        var repackMessage = []
        console.log("Well, Lets see ",messages)
        repackMessage = messages

        const getImages = addImageToMessage().then( async res => {
           
            if(res != null){
               await Fire.shared.postMessageImages(res).then( async arr => {
                    console.log("images: ", arr)
                    repackMessage = await [{
                        _id: messages[0]._id,
                        createdAt: messages[0].createdAt,
                        text: messages[0].text,
                        imgArr: arr,
                        user: {
                          _id: messages[0].user._id,
                          avatar: messages[0].user.avatar,
                          name: messages[0].user.name,
                        }
                    }]
                    return arr
                }).then( async () => {

                    // console.log("images2: ", repackMessage)
                    const data = {
                        id: msgId,
                        type: 'sent',
                        status: 'loading',
                        sender: sender,
                        message: messages[0].text,
                        time: time,
                        conversationID: conversationId,
                        imgArr: repackMessage[0].imgArr?  JSON.stringify(repackMessage[0].imgArr): null,
                        avatar: messages[0].user.avatar,
                        name: messages[0].user.name
                    }
            
                   await setMessages(previousMessages => GiftedChat.append(previousMessages, repackMessage))
                   await  Store.store._storeGroupChats_Local(data).then(() => {
                        props.addMsg(conversationId, sender, { conversationId, name: messages[0].user.name , avatar: messages[0].user.avatar , msgId, status: 'loading', message: messages[0].text, time: messages[0].createdAt, imgArr: repackMessage[0].imgArr?  JSON.stringify(repackMessage[0].imgArr): null })
            
                    })
            
                }).then(() => {

                    Store.store.dropCacheTable("TempFileCache").then(() => {
                        Store.store.this.createFileTempCache()
                    })
                    setIImageMessage([])

                }).catch(err => console.log(err))
            }else{
                const data = {
                    id: msgId,
                    type: 'sent',
                    status: 'loading',
                    sender: sender,
                    message: messages[0].text,
                    time: time,
                    conversationID: conversationId,
                    imgArr: null,
                    avatar: messages[0].user.avatar,
                    name: messages[0].user.name
                }
        
               await setMessages(previousMessages => GiftedChat.append(previousMessages, repackMessage))
               await  Store.store._storeGroupChats_Local(data).then(() => {
                    props.addMsg(conversationId, sender, { name: messages[0].user.name , avatar: messages[0].user.avatar , msgId, status: 'loading', message: messages[0].text, time: messages[0].createdAt, imgArr: null })
        
                })
            }
        })
        
}, [])

const renderHeader = () => {
    return (
        <View style={{
            height: 80,
            width: '100%',
            backgroundColor: theme.colors.white,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 30
        }}>
            <View style={{ flexDirection: 'row'}}>
                <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ paddingRight: 30 }}>
                    <Ionicons name="md-arrow-back" size={24} color={theme.colors.gray2}/>
                </TouchableOpacity>
                <Text title bold > {props.navigation.state.params.groupName}</Text>
            </View>

            <TouchableOpacity onPress={() => props.navigation.navigate('groupDetails',  {...props.navigation.state.params, user: props.user, fromChat: true })} style={{ }}>
                <Feather name="more-vertical" size={24} color={theme.colors.gray2}/>
            </TouchableOpacity>

        </View>
    )
}


    
        const {params} = props.navigation.state
        const {navigation} = props
        const { user } = props
        const {groupId} = params
        // console.log("GROUP CHAT PARAMS: ",params)
        return (
            <Block>
                {renderHeader()}
                {
                    loadingMessages?
                    <Block center middle>
                        <Image source={LoaderImage} style={styles.loaderImage}/>
                    </Block> 
                        :
                    <GiftedChat
                        inverted
                        messages={messages}
                        onSend={messages => onSend(messages)}
                        user={{
                            _id: user.uid,
                            name: user.displayName,
                            avatar: user.photoURL
                        }}
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
        addMsg: ( groupId, uid1, chatData ) => dispatch(sendGroupMessage( groupId, uid1, chatData )),
    }
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    firestoreConnect((props) => {
        const user = props.user.uid
        const msgDoc = props.navigation.state.params.groupId
        return [
            {
                collection: 'GroupChat',
                doc: msgDoc,
                subcollections: [{collection: 'messages'}],
                storeAs: 'messages',
                orderBy: [ 'time ', 'desc']
            }
        ]
    })
)(GroupChat)