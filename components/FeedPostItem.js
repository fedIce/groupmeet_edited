import React, { Component, useState, useEffect } from 'react'
import { Block, Text, Button } from '../components'
import { compose } from 'redux'
import {Filter, FilterOptions} from '../components/Filter'
import { mocks, theme } from "../constants";
import  {CustomHeader } from '../components/header'
import { Image, TextInput, StyleSheet, TouchableOpacity,View, Dimensions, FlatList, Modal, ActivityIndicator, Alert, Animated, Share, Clipboard } from 'react-native'
import { FontAwesome5, Feather } from '@expo/vector-icons'

import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { CarouselFromUrl } from "../components/Carousel";

import * as action from '../constants/store/utils/actions'
import * as utils from '../config/validate'
import { SafeAreaView } from 'react-native-safe-area-context'
import moment from 'moment'
import navigations from '../navigations';
import Event from '../config/Event'
import * as Analytics from 'expo-firebase-analytics';
import * as Linking from 'expo-linking';
import {TagUserComponent} from './SelectUsers'


const LoaderImage = require('../assets/images/chatLoader.gif')




function RenderFeedItem ({item, user, pid, props, key, navigation, fromMsg=null }){


    const animatedOpacityValue = new Animated.Value(1)
    const animatedScale = new Animated.Value(1)

    const itemTemp = item

    const [ state, setState ] = useState( {
        posts: false,
        viewComments: false,
        comment: '',
        postId: '',
        posterId: '',
        commenterId: '',
        commenterAvatar: '',
        commenterName: '',
    })

    const [ showFullText, setShowFullText ] = useState(false)
    const [ showPost, setShowPost ] = useState(true)
    const [ showPopMenu, setShowPopMenu ] = useState(false)
    const [ showTagModal, setShowTagModal ] = useState(false)
    const [ following, setFollowing ] = useState([])
    const [ postLiked, setPostLiked] = useState({status: false, count: 0 })
    // const comments = props.comments.comments
    const [ commentData, setCommentData ]  = useState({count: item.data.commentsCount? item.data.commentsCount: 0 })

    useEffect(() => {

         Analytics.setCurrentScreen('Feeds');

    }, [])

    const _fetchFollowing = () => {
        Event.shared.fetchFollowing(user.uid).then(follow => {
            // console.log(follow)
            const usersList = Event.shared.fetchUsersById(follow)
            usersList.then(data => {
                // console.log("Users List: ", data)
                setFollowing(data)
            })
        })
    }


    const _Share = async (msg) => {
        try {
         let redirectUrl = Linking.makeUrl('/', { pid });

          const result = await Share.share({
            message: `${msg} use the link ${redirectUrl}`,
            title:"SoFree App",
            url: redirectUrl
          });

          Analytics.logEvent("ShareEvent", {
              userId: user.uid,
              postId: pid,
              decription: `User ${user.displayName} Clicked On the Share Botton`
          })
    
          if (result.action === Share.sharedAction) {
            alert("Post Shared") //
          } else if (result.action === Share.dismissedAction) {
            // dismissed
            alert("Post cancelled")//
          }
        } catch (error) {
          alert(error.message);
        }
      };


    const renderText =(post)=>{
    
        if(showFullText == false && post.description.length > 100 ){
           return (
               <View>
                <Text style={styles.postdes}> { post.description.slice(0, 100) }...</Text>
                <TouchableOpacity onPress = {() => setShowFullText(true)} style={{ marginHorizontal: 10, alignSelf:'flex-end', marginVertical: 5 }}>
                    <Text>show more</Text>
                </TouchableOpacity>
               </View>
           )
        }else{
            return (
                <View>
                    <Text style={styles.postdes}> { post.description }</Text>
                    {
                        post.description.length > 100?
                    
                    <TouchableOpacity onPress = {() => setShowFullText(false)} style={{ marginHorizontal: 10, alignSelf:'flex-end', marginVertical: 5 }}>
                        <Text>show less</Text>
                    </TouchableOpacity>
                    :
                    null
                    }
                </View>
                 )
        }
    }

    const renderPostMedia =(post, index) => {
        return (
            <Block style={styles.mediaContainer}>
            {post.description? renderText(post): null}
                <CarouselFromUrl illustrations={post.media} /> 
            </Block>
        )
    }

    


    const registerEvent = (group, post, user) => {
        if(group != null){
            navigation.navigate('groupSingle', { post, user })
        }else{
            navigation.navigate('makePayment', { post, user })
        }
    }

    

    const showFollowBotton = (owner,id, avatar, username ) => {

        const userProfile = props.userData? utils.extractUser(props.userData, owner.uid) : null;
        if((userProfile != undefined) && !(userProfile.following.includes(id) ) && !( id == userProfile.uid) ){
            if( userProfile.requests.find(obj => obj.id == id) == undefined || userProfile.requests.find(obj => obj.id == id).id != id ){

                return (
                    <TouchableOpacity onPress={ () => { props.followUser({id: userProfile.uid, avatar: userProfile.avatar, username: userProfile.username }, {id, avatar, username }) }}>
                            
                        <Text style={{ paddingHorizontal: 20 }} color={theme.colors.primary}>Follow +</Text>
                                
                    </TouchableOpacity>
                )
            }
        }

        if(props.followStatus == 'sending'){
        return (
                <ActivityIndicator size="small" />
        )
        }
    }


    const updateCommentCount = (count) => {
        setCommentData({count})
    }

    const TagUsers = async () => {
        await _fetchFollowing()
        setShowTagModal(true)
        
    }


    const handleMenuOptions = async (option, postId, type) => {

        switch(option){

            case 'copy':
                await Clipboard.setString("Link To Post");
                return Alert.alert("Copy Link", "Link has been copied to clipboard")
                
            case 'edit':
                return Alert.alert("Edit Post", "Navigate To Post Edit Page")
                
            case 'delete':
                
                    return Alert.alert("Delete Post", "This post will be permanently deleted",
                    [
                        {
                          text: 'Cancel',
                          onPress: () => null,
                          style: 'cancel'
                        },
                        { text: 'OK', onPress: () => Event.shared.deletePost(postId).then(() => { 
                           hidePost()
                         }) }
                      ],
                      { cancelable: false }
                    )
                

                
            case 'share':
                var msg = ''
                if(type == 'event'){
                    msg = `${user.displayName} is inviting you to an event`
                }else{
                    msg = `${user.displayName} Shared you a post`
                }
                _Share(msg)
                return Alert.alert("Share Post", "Fire Share Post Function")
                
            case 'commenting':
                return Alert.alert("Turn Off Commenting", "User wants to turn of commenting for their post")
            case 'tag':
                return TagUsers()
                
            case 'unfollow':
                return Alert.alert("Unfollow User", "Wishes to unfollow the user who pas posted this item")
                
            case 'report':
                return Alert.alert("Report This Post", "User wants to Report a post")
                
            case 'mute':
                return Alert.alert("Mute User", "Wishes to mute the user who pas posted this item")

            default:
                return null
        }
    }

    const hidePost = () => {
        Animated.sequence([
            Animated.timing(animatedScale, {
                toValue: 1.3,
                duration: 500
            }),
            Animated.timing(animatedScale, {
                toValue: 0,
                duration: 300
            }),
            Animated.timing(animatedOpacityValue, {
                toValue: 0,
                duration: 200
            })
        ]).start(() => setShowPost(false))
    }

    const closeTagUsers = () => {
        setShowTagModal(false)
    }


    const popMenus = (user,post, postId) => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={showPopMenu}
                presentationStyle="overFullScreen"
            >

                <TouchableOpacity style={styles.modalMenu} onPress={() => setShowPopMenu(false)}>
                    <Block style={styles.menuBox}>
                        <Button onPress={() => handleMenuOptions('copy',postId, post.type )} style={[styles.menuItem,{ borderBottomEndRadius: 0, borderBottomLeftRadius:0 }]}>
                        <Feather name="copy" size={20} color={theme.colors.gray} style={{ marginHorizontal: 10 }} />
                            <Text color={theme.colors.gray}>Copy Link</Text>
                        </Button>
                        <Button onPress={() => handleMenuOptions('share',postId, post.type )} style={[styles.menuItem,{ borderRadius:0}]}>
                            <Feather name="share" size={20} color={theme.colors.gray} style={{ marginHorizontal: 10 }} />
                            <Text color={theme.colors.gray}>Share {post.type == "Post"? "Post": "Event"}</Text>
                        </Button>

                        {
                            post.uid == user.uid?
                            <View>
                                 <Button onPress={() => handleMenuOptions('tag',postId, post.type )} style={[styles.menuItem,{ borderRadius:0}]}>
                                    <Text color={theme.colors.gray}>Tag Someone</Text>
                                </Button>

                                <Button onPress={() => handleMenuOptions('edit',postId, post.type )} style={[styles.menuItem,{ borderRadius:0}]}>
                                    <Text color={theme.colors.red}>Edit</Text>
                                </Button>

                           

                            {
                                post.type === "Post"?
                                    <Button onPress={() => handleMenuOptions('delete',postId, post.type )} style={[styles.menuItem,{ borderRadius:0}]}>
                                        <Text color={theme.colors.red}>Delete</Text>
                                    </Button>
                                : null
                            }
                            


                            <Button onPress={() => handleMenuOptions('commenting',postId, post.type )} style={styles.menuItemDel}>
                                 <Text color={theme.colors.red}>Turn Off Commenting</Text>
                            </Button>

                            </View>
                            :
                            <View>

                                <Button onPress={() => handleMenuOptions('mute',postId, post.type )} style={[styles.menuItem,{ borderRadius:0}]}>
                                <Feather name="volume-x" size={20} color={theme.colors.gray} style={{ marginHorizontal: 10 }} />
                                    <Text color={theme.colors.gray}>Mute</Text>
                                </Button>
                               
                                <Button onPress={() => handleMenuOptions('tag',postId, post.type )} style={[styles.menuItem,{ borderRadius:0}]}>
                                    <Text color={theme.colors.gray}>Tag Someone</Text>
                                </Button>

                                <Button onPress={() => handleMenuOptions('unfollow',postId, post.type )} style={[styles.menuItem,{ borderRadius:0}]}>
                                    <Text color={theme.colors.red}>Unfollow</Text>
                                </Button>


                                <Button onPress={() => handleMenuOptions('report',postId, post.type )} style={styles.menuItemDel}>
                                    <Text color={theme.colors.red}>Report Post</Text>
                                </Button>

                            </View>
                        }
                    </Block>
                </TouchableOpacity>
            </Modal>
        )
    }


    const fetchUserInfo =() => {
        
    }
   

    const renderHeader = (users, post, index) => {
        return (
        <Block row center padding={[theme.sizes.base, theme.sizes.base]} style={styles.itemStyle}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: post.uid })}>
                <Image source={{ uri: post.avatar}} style={styles.avatar} />
            </TouchableOpacity>
            <Block padding={[0, theme.sizes.base ]}>
                <Text bold>@{post.username}</Text>
                <Text caption color={theme.colors.gray} >{"1hr - Mehane Australia"}</Text>
            </Block>
            {showFollowBotton(users, post.uid, post.avatar, post.username )}
            <TouchableOpacity onPress={() => setShowPopMenu(true)} style={{ padding: 10}}>
                <FontAwesome5 name="ellipsis-v" size={14} />
            </TouchableOpacity>
        </Block>
        )
    }

    const setLikedPost = async (post, user, postId, likes ) => {

        console.log(item.receiver, user.displayName)

        await setPostLiked({status: true, count: parseInt(likes) + 1})
        if(fromMsg){
            await Event.shared.sendSharedLikeNotification({ name: user.displayName, uid: user.uid },{ uid: item.receiver })
            if(item.receiver != post.data.uid){
                await Event.shared.sendLikeNotification({ name: user.displayName, uid: user.uid },{ uid: post.data.uid })
            }
        }else{
            await Event.shared.sendLikeNotification({ name: user.displayName, uid: user.uid },{ uid: post.data.uid })
        }
        props.likePost({ postId: post.pid, posterId: post.data.uid, likerId: user.uid, likerAvatar: user.photoURL, likerDisplayName: user.displayName} )
    }

    const renderBottom = (post, user, postId ) => {
        return (
        <Block right row padding={[theme.sizes.base, theme.sizes.base]} style={{ backgroundColor: theme.colors.white, borderBottomColor: theme.colors.gray3, borderBottomWidth: 2}} >
            {
                !(post.data.likers && post.data.likers.includes(user.uid))?
                <TouchableOpacity  activeOpacity={postLiked.status? 1 : 0} onPress={() => postLiked.status? null : setLikedPost(post, user, postId, post.data.likes )} style={{ marginHorizontal: 5, justifyContent: 'space-around', alignItems: 'center' }}>
                        <Block row>
                            <FontAwesome5 style={{ marginHorizontal: 5 }} name="heart" size={20} color={ postLiked.status? theme.colors.gray : theme.colors.accent} />
                            <Text caption color={theme.colors.gray}>{postLiked.status? postLiked.count :post.data.likes}</Text>
                        </Block>
                    </TouchableOpacity>
                    :
                    <Block style={{ marginHorizontal: 5, justifyContent: 'space-around', alignItems: 'flex-end' }}>
                        <Block row>
                            <FontAwesome5 style={{ marginHorizontal: 5 }} name="heart" size={20} color={theme.colors.gray} />
                            <Text caption color={theme.colors.gray}>{post.data.likes}</Text>
                        </Block>
                    </Block>
            }
            
                <TouchableOpacity style={{ marginHorizontal: 5, justifyContent: 'space-around', alignItems: 'center' }}>
                    <Block row>
                        <TouchableOpacity  onPress={() => navigation.navigate('comments',{ user, posts: post, postId, updateCommentCount })}><FontAwesome5 style={{ marginHorizontal: 5 }} name="comment" size={20} color={theme.colors.primary} /></TouchableOpacity>
                        <Text caption color={theme.colors.gray}>{commentData.count}</Text>
                    </Block>
                </TouchableOpacity>
            </Block>
        )     
    }

    const renderEventMediaSection =(post, user, postId) => {
        return (
            <Block style={{ marginTop:10}}>
                <TouchableOpacity onPress={() => navigation.navigate('eventDetails',{ post, user, postLiked, setLikedPost, liked: postLiked.status, group: post.data.group  })}><Image source={{ uri: post.data.coverImage }} style={styles.eventMedia} /></TouchableOpacity>
                <Block row style={styles.eventActionArea} >
                <Text  bold style={styles.eventPrice}>$ {post.data.ticketPrice}.00</Text>
                    <View style={{ flexDirection:'row' }}>
                        <TouchableOpacity onPress={() => registerEvent(post.data.group, post, user)} style={styles.eventAction}>
                            <Feather name="share" size={20} color={theme.colors.black} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowPopMenu(true)}  style={styles.eventActionMore}>
                            <Feather name="more-vertical" size={20} color={theme.colors.black} />
                        </TouchableOpacity>
                    </View>
                </Block>
                <Block row center padding={[theme.sizes.padding]} style={{ backgroundColor: theme.colors.white}}>
                    <Block flex={1}>
                        <Text h4 bold color={theme.colors.gray3} >{moment(post.data.eventDates[1]).format('MMM').toUpperCase()}</Text>
                        <Text h1 bold>{moment(post.data.eventDates[0]).format('l').toString().split('/')[0]}</Text>
                    </Block>
                    <Block flex={8} padding={[0, theme.sizes.padding]}>
                        <Text h3 bold>{post.data.title}</Text>
                        <Text caption bold color={theme.colors.gray}>{ post.data.description.length > 100? post.data.description.slice(0, 100) + "...": post.data.description }</Text>
                    </Block>
                </Block>
                <Block style={{ backgroundColor: theme.colors.white }}>
                    {renderBottom(post, user, postId)}
                </Block>

            </Block>
        )
    }


    return showPost? (
        <Animated.View style={{ transform: [{ scale: animatedScale }]}}>
       {     
            item.data.type == "Post" && item.data.type != undefined && item.pid != undefined && (item.data != null && item.data != undefined)?
            <Block key={item.pid} style={{marginTop: 10}} key={key}>
            
            {renderHeader(user, item.data, item.pid)}
            {renderPostMedia(item.data, item.pid)}
            {renderBottom(item, user, item.pid)}
            </Block>
            :
            item.data.type == "event" && item.pid != undefined && item.data != null && item.data != undefined?
                <Block key={item.pid}>
                    {renderEventMediaSection(item, user, item.pid)}
        
                </Block>
            :
            null
            }

            

            {popMenus(user, item.data ,item.pid)}

            <Modal
                visible={showTagModal}
            >
            <Block>

                <View style={styles.searchBox}>
                    {/* <TextInput onChange={(val) => filterFollowing(val)} placeholder="Search..." style={styles.searchBar}/>
                    <TouchableOpacity style={styles.searchAction}>
                        <Feather name="search" size={20} />
                    </TouchableOpacity> */}
                </View>
            {
                   following.length > 0 ? 
                    <FlatList
                        data={following}
                        extraData={following}
                        renderItem={({item, index}) => {
                            return (
                            <TagUserComponent item={item} data={itemTemp} user={user} addMsg={props.addMsg} />
                            )
                        }}
                />
               
                   
                    :
                    <View style={{ width: '100%', height: '100%', justifyContent:'center', alignItems:'center'}}>
                        <Image source={LoaderImage} style={{ width: 100, height: 100}}/>
                    </View>
            }

                    <View>
                        <TouchableOpacity onPress={() => closeTagUsers()} style={{
                            width:'100%',
                            position:'absolute',
                            bottom: 0,
                            backgroundColor:theme.colors.primary,
                            paddingVertical: 20
                        }}>
                                <Text center white bold>Done</Text>    
                        </TouchableOpacity> 
                    </View>
            </Block>
        </Modal>

        </Animated.View>
    ): null
}


const styles = StyleSheet.create({
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 28
    },
    itemStyle: {
        borderBottomColor: theme.colors.gray3,
        borderBottomWidth: 2,
        backgroundColor: theme.colors.white
    },
    mediaContainer: {
        width:'100%',
        backgroundColor: theme.colors.white,
        height: 343
    },
    postdes:{
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    commentInput:{
        width: '80%',
        height: 50,
        borderRadius: 25,
        paddingHorizontal: 20,
        marginHorizontal:10,
        backgroundColor: '#f7f7f7'
    },
    commentInputContainer:{
        paddingTop: 5,
        backgroundColor: theme.colors.semiTransWhite,
        width: '100%',
        height: 100,
        position: 'absolute',
        bottom: 0,
    },
    sendBtn: {
        alignItems: 'center',
        justifyContent:'center',
        backgroundColor: theme.colors.primary,
        height: 50,
        width: 50,
        borderRadius: 25
    },
    commentHeader: {
        justifyContent: 'center',
        maxHeight: 50,
        width: '100%',
        paddingHorizontal: 10,
        borderBottomColor: theme.colors.gray3,
        borderBottomWidth: 1,
    },
    eventMedia: {
        width: '100%',
        height: 250,
        resizeMode: 'cover',
    },
    eventAction: {
        backgroundColor: theme.colors.white,
        padding:10,
        borderRadius: 25,
        marginHorizontal:1
    },
    eventActionMore: {
        paddingVertical:10,
        borderRadius: 25,
        marginHorizontal:5
    },
    eventPrice:{
        color: theme.colors.black,
        padding:10,
        paddingHorizontal: 20,
        backgroundColor: theme.colors.white,
        borderRadius: 10,
    },
    eventActionArea: {
        position:'absolute',
        top: 10,
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal:10,
    },
    modalMenu: {
        flex:1,
        alignItems: 'center',
        justifyContent:'center',
        width: '100%',
        height:'100%',
        backgroundColor:'rgba(255,255,255, .8)' ,
    },
    menuBox:{
        width:274,
        alignSelf: 'center',
        marginVertical: '70%',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,
        elevation: 13,    

    },
    menuItem:{
        width: '100%',
        alignItems: 'center',
        marginVertical: 0,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    menuItemDel:{
        width: '100%',
        alignItems: 'center',
        marginVertical: 0,
        justifyContent: 'center',
        borderTopColor: theme.colors.gray3,
        borderTopWidth: .5,
        borderTopEndRadius: 0,
        borderTopLeftRadius: 0
        
    },
    searchBox:{
        width:'100%',
        flexDirection:'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    searchBar:{
        width: '90%',
        paddingHorizontal: 10
    }
}) 

    
export default RenderFeedItem;

