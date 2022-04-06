import React, { Component } from 'react'
import { Block, Text, Button } from '../components'
import {View} from 'react-native'
import { Image, StyleSheet, TouchableOpacity, Dimensions, FlatList, ActivityIndicator } from 'react-native'
import { connect } from 'react-redux'
import { theme } from '../constants'
import { CustomHeader } from '../components/header'
import { Feather } from '@expo/vector-icons'
import { Tab, Tabs } from '../components/Tabs'
const fireb = require('firebase')
import { isEmpty, isLoaded, firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import Event from '../config/Event'
import * as action from '../constants/store/utils/actions'

import { LinearGradient } from "expo-linear-gradient";
import * as utils from '../config/validate'

import firebase from '../config/firebaseCon'
const db = firebase.firestore()



import * as actions from '../constants/store/utils/actions' 

const {width} = Dimensions.get('window')

Object.filter = (obj, predicate) => 
Object.keys(obj)
    .filter( key => predicate(obj[key]) )
    .reduce( (res, key) => (res[key] = obj[key], res), {} );


class Profile extends Component {
    componentDidMount(){
        this.setState({posts: []})
       this.loadPosts()
    }



    loadPosts = async () => {
        this.setState({refreshing: true })
        let ui_d = null
        if(this.props.navigation.state.params != undefined){
            ui_d = this.props.navigation.state.params.userId
            
        }else{
            ui_d = this.props.user.uid
        }

        await db.collection('Posts').where('uid','==', ui_d ).get()
        .then( querySnapshot => {
            querySnapshot.forEach(doc => {
                if(!this.state.posts.includes({ id: doc.id, ...doc.data()})){
                    this.setState({ posts: [...this.state.posts,{ id: doc.id, ...doc.data()}]})
                }
            })
        }).then(() => {
            this.setState({refreshing: false })
            this.forceUpdate()

        })
    }


state = {
    orientation : 'grid',
    horizontal: true,
    sizeGridIcon: 16,
    sizeListIcon: 12,
    GridIconColor: theme.colors. gray2,
    ListIconColor: theme.colors.black,
    refreshing: false,
    userData: null,
    showMore: false,
    followSent: false,
    sendingFollowRequest: false,
    followStatus: null,
    posts: []
}

setGrid = () => {
    this.setState(
     { 
        orientation: 'grid', 
        horizontal: true,  
        sizeListIcon: 12, 
        sizeGridIcon: 16,
        GridIconColor: theme.colors. gray2,
        ListIconColor: theme.colors.black
    })
}

setList =() => {
    this.setState(
        {
            orientation:'list', 
            horizontal: false, 
            sizeListIcon: 16, 
            sizeGridIcon: 12,
            GridIconColor: theme.colors. black,
            ListIconColor: theme.colors.gray2 
        })
}

viewPost = (post) => {
    this.props.navigation.navigate("singlePost", {
        post,
        user: this.props.user
    })
}

toggleShowMore = () => [
    this.setState({ showMore: !this.state.showMore})
]

followRequest = async () => {

    this.setState({ sendingFollowRequest: true})

    const currentUser = await this.props.navigation.state.params? this.props.navigation.state.params.userId : user.uid 
    const userProfile = await this.props.userData? utils.extractUser(this.props.userData, currentUser) : null;

    const to = {
        id: userProfile.uid,
        avatar: userProfile.avatar,
        username: userProfile.username
    }

    const from = {
        id: this.props.user.uid,
        avatar: this.props.user.photoURL,
        username: this.props.user.displayName? this.props.user.displayName:currentUser
    }


    this.props.followUser(from,to).then(() => {
        this.setState({ sendingFollowRequest: false})
        this.setState({ followSent: true })
    }).then(() => {
        Event.shared.sendRequestNotification({name: from.username}, {uid: to.uid})
    })
}


cancelFollowReq = async () => {

    this.setState({ sendingFollowRequest: true})

    const currentUser = await this.props.navigation.state.params? this.props.navigation.state.params.userId : user.uid 
    const userProfile = await this.props.userData? utils.extractUser(this.props.userData, currentUser) : null;

    const to = userProfile.uid

    const from = this.props.user.uid

    this.props.cancelFollowRequest(from,to).then(() => {
        this.setState({ sendingFollowRequest: false})
        this.setState({ followSent: false })
    })
}

unfollowUser = async () => {
    this.setState({ sendingFollowRequest: true})

    const currentUser = await this.props.navigation.state.params? this.props.navigation.state.params.userId : user.uid 
    const userProfile = await this.props.userData? utils.extractUser(this.props.userData, currentUser) : null;

    const to = userProfile.uid

    const from = this.props.user.uid

    this.props.unFollow(from,to).then(() => console.log('Unfollowed User')).then(() => {
        this.setState({ sendingFollowRequest: false})
        this.setState({ followSent: false })
    }).catch(err => console.log('UNFOLLOW ERROR: ',err))
}

pullRfresh = new Promise( async (res, rej) => {

        this.setState({ refreshing: true, posts: this.props.posts})
        await this.props.fetchPosts(this.props.user.uid)
        this.setState({refreshing: false})
        res(true)
    })

    render(){

        const { user } = this.props;
        const { posts } = this.state;
        const {navigation} = this.props;
        const currentUser = this.props.navigation.state.params? this.props.navigation.state.params.userId : user.uid 
        const userProfile = this.props.userData? utils.extractUser(this.props.userData, currentUser) : null;
        const myProfile = this.props.userData? utils.extractUser(this.props.userData, user.uid) : null;
        
     
        console.log( 'myProfile => following: ', myProfile.following, ' FOLLOWERS: ', myProfile.followers)
        console.log( 'userProfile => following: ', userProfile.following, ' FOLLOWERS: ', userProfile.followers)

        const id = this.props.user.uid
        
        const followStatus = () => {
        
            if((myProfile != undefined) && !(myProfile.following.includes(userProfile.uid) ) && !( userProfile.uid == myProfile.uid) ){
                    return 'none'
            }

            
            
            if( myProfile && (myProfile.following.includes(userProfile.uid) ) && !( userProfile.uid == myProfile.uid)  ){
                return 'sent'
            }

            if( myProfile && (myProfile.followers.includes(userProfile.uid) ) && !(myProfile.following.includes(userProfile.uid) ) && !( userProfile.uid == myProfile.uid)  ){
                return 'followBack'
            }
        

            if(myProfile && (myProfile.requests.find(obj => obj.id == userProfile.uid) != undefined )){
                return 'pending'
            }
        
                return 'none'
        }

      const  renderFollowButton =() => {
            
    
           switch(followStatus()){
               case 'sent':
                   return (
                       <Button gradient style={styles.followBotton} onPress={() => this.unfollowUser()}>
                           <Text center white> Unfollow {this.state.sendingFollowRequest? <ActivityIndicator size="small" style={{width: 20, height: 20}} />: null }</Text>
                       </Button>
                   )
               case 'pending':
                   return (
                       <Button gradient style={styles.followBotton} onPress={() => null}>
                           <Text center white> Cancel {this.state.sendingFollowRequest? <ActivityIndicator size="small" style={{width: 20, height: 20}} />: null }</Text>
                       </Button>
                   )
               case 'none':
                   return (
                       <Button gradient style={styles.followBotton} onPress={() => this.followRequest()}>
                           <Text center white>Follow + {this.state.sendingFollowRequest? <ActivityIndicator size="small" style={{width: 20, height: 20}} />: null }</Text>
                       </Button>
                   )
               case 'followBack':
                    return (
                        <Button gradient style={styles.followBotton} onPress={() => this.followRequest()}>
                            <Text center white>Follow Back + {this.state.sendingFollowRequest? <ActivityIndicator size="small" style={{width: 20, height: 20}} />: null }</Text>
                        </Button>
                    )
    
               default:
                   null
           }
       }


        return this.props? (
            <Block>
                <CustomHeader navL='none' left={
                <Block style={{ justifyContent: 'flex-start', alignItems: 'center'}} row>
                   { currentUser != user.uid? <TouchableOpacity onPress={() => this.props.navigation.goBack() } style={{ width:40}}><Feather name="arrow-left" size={24} /></TouchableOpacity> : null }
                    <Feather name="user" size={24} />
                    <Text title bold>  Profile</Text>
                </Block>} 
                noNav={true}
                />
                <Block>
                    {
                        !this.state.showMore?

                        <Block style={{ marginVertical: 20 , marginTop: 40}} >
                            <Block style={styles.topSection}>
                            <Image source={{ uri: userProfile.avatar}} style={styles.profileImage} />
                            <Block style={{marginVertical: 10 }}>
                                <Text title bold >{userProfile.username}</Text>
                                <View style={{ flexDirection:'row', alignItems:'center'}}>
                                    {
                                        userProfile.uid === fireb.auth().currentUser.uid?
                                        <Button gradient style={styles.followBotton} onPress={() => { navigation.navigate("settings")}}>
                                             <Text bold center white>Edit  <Feather name="edit-2" size={12} color={theme.colors.white}/></Text>
                                        </Button>
                                        :

                                        (this.state.followSent || ((userProfile.requests.find(obj => obj.id == id) != undefined)))?
                                            <Button gradient style={styles.followBotton} onPress={() => this.cancelFollowReq()}>
                                                <Text center white> Cancel {this.state.sendingFollowRequest? <ActivityIndicator size="small" style={{width: 20, height: 20}} />: null }</Text>
                                            </Button>
                                        :
                                        renderFollowButton()
                                    }
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate("chats", {
                                        item: { 
                                            uid: currentUser,
                                            username:userProfile.username,
                                            avatar:userProfile.avatar,
                                            updateList: () => null,
                                             }
                                    })} style={styles.msgBtn}>
                                        <Feather name="mail" size={15} />
                                    </TouchableOpacity>
                                </View>
                                    
                               
                            </Block>
                        </Block>
                            <Block style={styles.midSection}>
                                <Block row middle style={styles.profileInfo} center>
                                    <Block center>
                                <Text bold title>{posts? posts.length: 0}</Text>
                                        <Text caption color={theme.colors.gray}>Posts</Text>
                                    </Block>
                                    <Block center>
                                        <Text bold title>{userProfile? userProfile.followersCount : 0}</Text>
                                        <Text caption color={theme.colors.gray}>Followers</Text>
                                    </Block>
                                    <Block center>
                                        <Text bold title>{userProfile? userProfile.followingCount : 0}</Text>
                                        <Text caption color={theme.colors.gray}>Following</Text>
                                    </Block>
                                    {
                                        user.id === fireb.auth().currentUser.uid?
                                        <Block center>
                                            <Text bold title>65</Text>
                                            <Text caption color={theme.colors.gray}>Following</Text>
                                        </Block>
                                    :
                                        null
                                    }
                                
                                </Block>
                            </Block>
                        </Block>

                        : null
                    }
                    {
                        posts && posts.length > 3?
                        <View style={[styles.chevron,{ alignItems: 'center', justifyContent:'flex-end'}]}>
                            <TouchableOpacity style={styles.toggleShow} onPress={() => this.toggleShowMore()}>
                                <Feather name={this.state.showMore? "chevron-down" : "chevron-up"} size={20} color={theme.colors.gray} />
                            </TouchableOpacity>
                        </View>
                        : null
                    }
                        
                        <Block style={styles.lowwerSection}>

                            
                            <Tabs>
                                <TouchableOpacity onPress={() => this.setGrid()}><Tab title={<Feather name="grid" size={this.state.sizeGridIcon} color={this.state.GridIconColor} />} active={false}/></TouchableOpacity>  
                                <TouchableOpacity onPress={() => this.setList()}><Tab title={<Feather name="list" size={this.state.sizeListIcon} color={this.state.ListIconColor} />} active={false}/></TouchableOpacity>
                            </Tabs> 
                                    <Block style={{ flex:1, padding: 10}}>
                                
                            {
                                this.state.orientation == 'grid'? 
                                        <Block style={styles.postsGrid}>
                                    
                                            <FlatList 
                                            key={(this.state.horizontal ? 'h' : 'v')}
                                            data={posts}
                                            onRefresh={() => this.pullRfresh}
                                            refreshing={this.state.refreshing}
                                            renderItem={(post, index ) => (
                                                post.item.type == "Post" && post.item.type != undefined?
                                                <TouchableOpacity onPress={()=> this.viewPost(post.item)} style={{ flex: 1, flexDirection: 'column', margin: 1 }}>
                                                    <Image style={styles.imageListThumbnail} source={{ uri: post.item.media[0] }} />
                                                    { post.item.media.length > 1?<Feather style={styles.typeIcon} name="layers" size={20} color={theme.colors.white} />: null}
                                                </TouchableOpacity>
                                                :
                                                <TouchableOpacity onPress={()=> this.viewPost(post.item)} style={{ flex: 1, flexDirection: 'column', margin: 1 }}>
                                                <Image style={styles.imageListThumbnail} source={{ uri: post.item.coverImage }} />
                                                <Feather style={styles.typeIcon} name="check-circle" size={20} color={theme.colors.white} />
                                                <Block style={styles.eventCaption}>
                                                    <LinearGradient
                                                        colors={['rgba(255,255,255, 0)', 'rgba(0,0,0,0.5)']}
                                                        start={[0,0]}
                                                        end={[0,.85]}
                                                        style={{ height:'100%'}}
                                                    >

                                                    <Text  middle style={styles.eventCaptionText} bold title white>{post.item.title}</Text>
                                                    </LinearGradient>
                                                </Block>
                                            </TouchableOpacity>
                                            )}
                                            //Setting the number of column
                                            numColumns={3}
                                            keyExtractor={(item, index) => index.toString()}
                                        />
                                        </Block>
                                        :
                                        <Block style={styles.postsList}>
                                    
                                            <FlatList 
                                            horizontal={false}
                                            key={(this.state.horizontal ? 'h' : 'v')}
                                            data={posts}
                                            onRefresh={() => this.pullRfresh}
                                            refreshing={this.state.refreshing}
                                            renderItem={(post, index ) => (
                                                        post.item.type == "Post" && post.item.type != undefined?
                                                            <TouchableOpacity onPress={()=> this.viewPost(post.item)} style={{ flex: 1, flexDirection: 'column', margin: 1 }}>
                                                                <Image style={styles.imageListThumbnail} source={{ uri: post.item.media[0] }} />
                                                                { post.item.media.length > 1?<Feather style={styles.typeIcon} name="layers" size={20} color={theme.colors.white} />: null}
                                                            </TouchableOpacity>
                                                            :
                                                            <TouchableOpacity onPress={()=> this.viewPost(post.item)} style={{ flex: 1, flexDirection: 'column', margin: 1 }}>
                                                            <Image style={styles.imageListThumbnail} source={{ uri: post.item.coverImage }} />
                                                            <Feather style={styles.typeIcon} name="check-circle" size={20} color={theme.colors.white} />
                                                            <Block style={styles.eventCaption}>
                                                                <LinearGradient
                                                                    colors={['rgba(255,255,255, 0)', 'rgba(0,0,0,0.5)']}
                                                                    start={[0,0]}
                                                                    end={[0,.85]}
                                                                    style={{ height:'100%'}}
                                                                >

                                                                <Text h3 middle style={styles.eventCaptionText} bold title white>{post.item.title}</Text>
                                                                </LinearGradient>
                                                            </Block>
                                                        </TouchableOpacity>
                                            )}
                                            //Setting the number of column
                                            numColumns={1}
                                            keyExtractor={(item, index) => index.toString()}
                                        />
                                        </Block>
                             }
                                    </Block>
                        </Block>
                </Block>
            </Block>
        ):
        null
    }
}

const styles = StyleSheet.create({
    profileImage:{
        height: 65,
        width: 65,
        borderRadius: 40,
        margin: 20
    },
    topSection:{
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'flex-start' 
    },
    followBotton:{
        width: 100,
        height: 30,
        borderRadius: 14,
        marginVertical: 5
    },
    midSection:{
        flex: 1,
        marginVertical: 15,
        
    },
    profileInfo:{
        flex: 1,
        maxHeight: 80,
        borderRadius: 20,
        padding: 10,
        paddingVertical: 35,
        backgroundColor: theme.colors.white,
        marginHorizontal: 30,
        

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.34,
        shadowRadius: 6.27, 
        elevation: 10
    },
    lowwerSection: {
        flex: 3,
        backgroundColor: theme.colors.white,
    },
    imageThumbnail: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 150,
        maxHeight: 300
      },
      imageListThumbnail:{
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 245,
        maxHeight: 900,
      },
      postsGrid:{
          flex: 1,
      },
      typeIcon: {
        position:'absolute',
        top:0,
        right:0,
        padding: 5
    },
    msgBtn:{
        width: 30,
        height: 30,
        padding: 5,
        alignItems:'center',
        justifyContent:'center',
        borderRadius: 15,
        marginHorizontal: 10,
        elevation: 10,
        backgroundColor: theme.colors.white 
    },
    eventCaption:{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 200
    },
    eventCaptionText:{
        position:'absolute',
        bottom: 20,
        alignSelf: 'center',
        textAlign: 'center'
    },
    toggleShow:{
        backgroundColor: '#FFF',
        padding: 5,
        paddingBottom: 0,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5
    }
})

const mapDispatchToProps = (dispatch) => {
    return {
        fetchPosts: (id) => dispatch(actions.fetchPosts(id)),
        followUser: (from, to) => dispatch(action.sendFollowRequest(from, to)),
        unFollow: (from, to) => dispatch(action.Unfollow(from, to)),
        cancelFollowRequest: (sender, reciever) => dispatch(action.removeFollowRequest(sender, reciever)),

        fetchFeeds: () => dispatch(action.fetchFeeds()),
        fetchComments: (postId) => dispatch(action.getComments(postId)),
        likePost: ({postId, posterId, likerId, likerAvatar, likerDisplayName}) => dispatch(action.likePost({postId, posterId, likerId, likerAvatar, likerDisplayName})),

    }
}

const mapStateToProps = (state) => {
    return {
        user: state.firebase.auth,
        posts: state.posts.posts,
        userData: state.firestore.data.Users
    }
    
}


export default compose(connect(mapStateToProps, mapDispatchToProps), firestoreConnect((props) => 
    
    [{
        collection: 'Users', 
    }]

    ))(Profile)