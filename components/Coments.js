import React, { Component, useState, useEffect } from 'react'
import { View, Modal, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native'
import { Block, Text, Button } from '../components'
import {  Feather } from '@expo/vector-icons'
import firebase from '../config/firebaseCon'
import { theme } from '../constants'
import { FlatList } from 'react-native-gesture-handler'
import navigations from '../navigations'
import SingleComment from './SingleCommentItem'
import * as utils from '../config/validate'


const db = firebase.firestore()

const Comments = (props) => {
    const [comments, setComments]  =  useState([])
    const [msg, setMsg]  =  useState('')
    const [likes, setLikes]  =  useState(2)
    const [dislikes, setDislikes]  =  useState(2)
    const [count, setCount]  =  useState(2)
   
    const { navigation } = props
    const { postId } = props.navigation.state.params
    const { user } = props.navigation.state.params
    const { posts } = props.navigation.state.params


    useEffect(() => {
        LoadComments()
        
    }, [])

    const LoadComments = () => {

        

        db.collection('Comments').doc(postId).get()
        .then( querySnapshot => {
            setComments( querySnapshot.data().commentArray)
        })
    }

    


    const postComment = (data) => {
        db.collection('Comments').doc(postId).set({
            commentArray: firebase.firestore.FieldValue.arrayUnion(data)
        }, {merge: true}).then(() => {
            db.collection('Posts').doc(postId).update({
                commentsCount: comments.length+1
            })
        })
    }

    const setRemoteComment = (data) => {
        db.collection('Comments').doc(postId).update({
            commentArray: data
        }).then(() => {
            db.collection('Posts').doc(postId).update({
                commentsCount: comments.length+1
            })
        })
    }

    

  const newComment = async (data) => {
    
    const temp = {
        comment: data.msg,
        commentId: `${posts.pid}_${utils.generateUUID()}`,
        commenterAvatar: user.photoURL,
        commenterDisplayName: user.displayName,
        commenterId: user.uid,
        likes: [],
        dislikes:[],
        postId: posts.pid,
        posterId: posts.data.uid,
        likeCount: 0,
        commentCount: 0,
        dislikeCount: 0,
        time: new Date()
    }

    setComments([...comments, temp])
    await postComment(temp)
    setMsg('')
    props.navigation.state.params.updateCommentCount(comments.length+1)

  }

  const LikeComment =(id) => {
      comments.map( item => {
          if(item.commentId == id){
            item.likes = [...item.likes,{
                avatar: user.photoURL,
                name: user.displayName,
                uid: user.uid
            }]
            item.likeCount = item.likeCount + 1

          }
      })

      setRemoteComment(comments)
    }

    const dislikeComment =(id) => {
        comments.map( item => {
            if(item.commentId == id){
              item.dislikes = [...item.dislikes,{
                  avatar: user.photoURL,
                  name: user.displayName,
                  uid: user.uid
              }]
              item.dislikeCount = item.dislikeCount + 1
  
            }
        })
  
        setRemoteComment(comments)
      }



   
    return (
        <Block>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="chevron-left" size={24} color={theme.colors.gray}/></TouchableOpacity>
            </View>
            <View style={styles.commentsArea}>
                {
                    comments.length > 0?
                    <FlatList
                        data={comments}
                        renderItem={({item, index}) => {
                            return <SingleComment item={item} user={user} post={posts} handleLike={LikeComment} handleDislike={dislikeComment} />
                        }}

                    />
                    :
                    <Block center middle padding={[300, 0]}>
                        <Feather name="message-square" size={50} color={theme.colors.gray3}/>
                        <Text color={theme.colors.gray2}>No Comments</Text>
                    </Block>
                }
               

            </View>

            <View style={styles.inputArea}>
                <View style={{ flexDirection: 'row'}}>
                    <Image source={{ uri: user.photoURL}} style={styles.avatar}/>
                    <TextInput value={msg} onChangeText={(val) => setMsg(val)} multiline={true} numberOfLines={1} editable={true} dataDetectorTypes='all' placeholder='Post a comment...' style={styles.input}/>
                    <TouchableOpacity onPress={() => newComment({msg})} style={styles.sendBtn}>
                        <Feather name="send" size={24} color={theme.colors.white} />
                    </TouchableOpacity>
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
},
commentsArea:{
    marginBottom: 150
}

})


export default Comments