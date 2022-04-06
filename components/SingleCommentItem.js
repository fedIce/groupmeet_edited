import React, { Component, useState, useEffect } from 'react'
import { View, Modal, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native'
import { Block, Text } from '../components'
import { Feather } from '@expo/vector-icons'
import firebase from '../config/firebaseCon'
import { theme } from '../constants'
import SingleCommentReplies from './SingleCommentReplies'
import moment from 'moment'

const db = firebase.firestore()

const SingleComments = (props) => {

    const [message, setMessage] = useState('')
    const [like, setLike] = useState(0)
    const [dislike, setDislike] = useState(0)
    const [comments, setComments ] = useState([])
    const [count, setCommentCount ] = useState([])
    const [userLikedComment, setUserLikedComment ] = useState(false)
    const [userDislikedComment, setUserDislikedComment ] = useState(false)
    const [showReplyBox, setShowReplyBox ] = useState(false)

    useEffect(() => {
       setComments(props.item)
       setLike(props.item.likeCount)
       setDislike(props.item.dislikeCount)
       setCommentCount(props.item.commentCount)

        setUserLikedComment(props.item.likes.filter( obj => obj.uid == user.uid ).length > 0)
        setUserDislikedComment(props.item.dislikes.filter( obj => obj.uid == user.uid ).length > 0)
    }, [])


    const likeComment = async (id)=>{
        await props.handleLike(id)
        setLike(like + 1)
        setUserLikedComment(true)
    }

    const dislikeComment = async (id)=>{
        await props.handleDislike(id)
        setDislike(dislike + 1)
        setUserDislikedComment(true)
    }



    const { navigation } = props
    const item  = comments
    const { user, post } = props

    return (
        <Block>
           
            <View style={styles.commentsArea}>
               
            <View style={{ flexDirection: 'row'}}>
                <View style={{ marginHorizontal: 10}}>
                    <TouchableOpacity><Image source={{ uri: item.commenterAvatar}} style={styles.avatar} /></TouchableOpacity>
                </View>
                <View>
                    <View style={{ flexDirection:'row'}}>
                        <Text caption color={theme.colors.gray} style={{ paddingHorizontal: 10}}>{item.commenterDisplayName}</Text>
                        <Text caption color={theme.colors.gray} style={{ paddingHorizontal: 5}}>{moment(item.date).fromNow()}</Text>
                    </View>
                    <View style={styles.commentTextArea}>
                        <Text>{item.comment}</Text>
                    </View>
                    <View style={styles.actionBtns}>
                        <TouchableOpacity onPress={() => !userLikedComment? likeComment(item.commentId): null}  style={styles.actions} ><Feather name="thumbs-up" size={15} color={theme.colors.gray}  /><Text caption color={theme.colors.gray} style={{ marginHorizontal: 5 }} >{like}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => !userDislikedComment? dislikeComment(item.commentId): null}  style={styles.actions} ><Feather name="thumbs-down" size={15} color={theme.colors.gray} /><Text caption color={theme.colors.gray} style={{ marginHorizontal: 5 }} >{dislike}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowReplyBox(!showReplyBox)}  style={styles.actions} ><Feather name="message-square" size={15} color={theme.colors.gray}  /><Text caption color={theme.colors.gray} style={{ marginHorizontal: 5 }} >{count}</Text></TouchableOpacity>
                    </View>
                    {
                        showReplyBox?
                        <View style={{width: '100%'}}>
                            <SingleCommentReplies item={item} user={user} post={post} />
                        </View>
                        :
                        null
                    }
                </View>
            </View>

            </View>

        </Block>
    )
}



const styles = StyleSheet.create({
avatar:{
    height: 45,
    width: 45,
    borderRadius: 28,
    
},
sendBtn:{
    padding: 10,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: 28
},
inputArea:{
    position: 'absolute',
    bottom: 0,
    width: '93%',
    marginHorizontal: 10,
    borderColor: theme.colors.gray3,
    borderWidth: 1,
    marginVertical: 5,
    borderRadius: 28,
    alignSelf:'center',
    backgroundColor: theme.colors.white
},
input:{
    width: '77%',
    paddingHorizontal: 10
},
header:{
    height: 80,
    width: '100%',
    backgroundColor: theme.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    marginBottom: 10
},
commentTextArea:{
    paddingHorizontal: 10,
    width: '90%',
    marginVertical: 5,
    marginBottom: 10
},
actionBtns:{
    flexDirection: 'row'
},
actions:{
    marginHorizontal:10,
    padding:5,
    flexDirection:'row'
}

})


export default SingleComments