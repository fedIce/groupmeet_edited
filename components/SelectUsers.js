import React, { useState } from 'react'
import {StyleSheet, View, TouchableOpacity, Image } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { theme } from '../constants'
import {Text} from './'
import Store from '../config/Storage'
import Event from '../config/Event'
import * as utils from "../config/validate";


export const TagUserComponent = ({item, data, user, addMsg, groupTag = null}) => {


    const [sentState, setSentState ] = useState(false)
    const shareData = data 

    const sendPost = async () => {

        if(groupTag == null){

        

        const receiver = item.uid
        const sender = user.uid
        const avatar = item.avatar
        const name = item.username
        const conversationId = receiver > sender? receiver+sender : sender+receiver
        const msgId = `${conversationId}_${utils.generateUUID()}`
        const time = new Date()
        const message = `${user.displayName} tagged you in this post`

        const data = {
            id: msgId,
            type: 'sent',
            status: 'loading',
            sender: sender,
            receiver: receiver,
            message,
            time: time,
            conversationID: conversationId,
            postType: JSON.stringify(shareData),
            imgArr: null
        }

       await  Store.store._storeOneOnOneChats_Local(data).then(() => {
            addMsg(conversationId, sender, receiver, avatar,name, { msgId, status: 'loading', message, time, imgArr: null, PostType: JSON.stringify(shareData) })
                setSentState(true)
                Event.shared.sendShareNotification({name: user.displayName},{uid: receiver} ).then( async ()=>{
                    await Store.store._updateChatList({
                        last_message: "🌅 Post Share",
                        senderId: receiver,
                        senderName: name,
                        senderAvatar: avatar,
                        count: 1
                    })
                })
        })
    }else{

        const groupData = {
            groupId: shareData.groupId,
            groupName: shareData.groupName,
            groupId: shareData.groupId,
            type:'group'
        }

        const receiver = item.uid
        const sender = user.uid
        const avatar = item.avatar
        const name = item.username
        const conversationId = receiver > sender? receiver+sender : sender+receiver
        const msgId = `${conversationId}_${utils.generateUUID()}`
        const time = new Date()
        const message = `${user.displayName} is inviting you to join ${groupData.groupName}`

        const data = {
            id: msgId,
            type: 'sent',
            status: 'loading',
            sender: sender,
            receiver: receiver,
            message,
            time: time,
            conversationID: conversationId,
            postType: JSON.stringify({data: groupData}),
            imgArr: null
        }

        console.log(data)

        await  Store.store._storeOneOnOneChats_Local(data).then(() => {
            addMsg(conversationId, sender, receiver, avatar,name, { msgId, status: 'loading', message, time, imgArr: null, PostType: JSON.stringify(groupData) })
                setSentState(true)
                Event.shared.sendGroupInviteNotification({name: user.displayName},{uid: receiver}, groupData.groupName ).then( async () =>{
                    await Store.store._updateChatList({
                        last_message: "⛺ Group Invite",
                        senderId: receiver,
                        senderName: name,
                        senderAvatar: avatar,
                        count: 1
                    })
                })

        }).catch(err => console.log(err))
    }

       
    }

    return (
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:10}}>
            <View style={{ flexDirection:'row', alignItems:'center'}}>
                <Image source={{ uri: item.avatar}} style={[{marginHorizontal: 10},styles.avatar]} /> 
                <Text>{item.username}</Text>
            </View>
            <View style={{ alignItems:'flex-end'}}>
               
                        <TouchableOpacity onPress={() => sendPost()} style={[styles.sentState,{backgroundColor: sentState? "#FFF": theme.colors.secondary,}]}>
                            {
                                sentState?
                                <Feather name="check" size={20} color="green"/>
                                :
                                <Text white>Send</Text>
                            }
                        </TouchableOpacity>
                  
               
            </View>
        </View>
    )
}

export function SelectUsers (props){
    return (
        <View>

        </View>
    )
}

const styles = StyleSheet.create({
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 28
    },
    sentState:{
        paddingHorizontal:20,
        borderRadius: 10,
        justifyContent:'center',
        alignContent:'center'
    }
})



export default SelectUsers