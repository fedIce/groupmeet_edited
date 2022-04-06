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
import * as action from '../constants/store/utils/actions'
import firebase from '../config/firebaseCon'


import { LinearGradient } from "expo-linear-gradient";
import * as utils from '../config/validate'


import * as actions from '../constants/store/utils/actions' 

const {width} = Dimensions.get('window')
const db = firebase.firestore()


Object.filter = (obj, predicate) => 
Object.keys(obj)
    .filter( key => predicate(obj[key]) )
    .reduce( (res, key) => (res[key] = obj[key], res), {} );


class currentUserProfile extends Component {
    componentDidMount(){
        this.loadPosts()
        this.forceUpdate()
       
    }

    

    loadPosts = async () => {
        this.setState({refreshing: true })

        await db.collection('Posts').where('uid','==', this.props.user.uid).get()
        .then( querySnapshot => {
            querySnapshot.forEach(doc => {
                this.setState({ posts: [...this.state.posts,{ id: doc.id, ...doc.data()}]})
            })
        }).then(() => {
            this.setState({refreshing: false })
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
    posts:[]
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


pullRfresh = new Promise( async (res, rej) => {

        this.setState({ refreshing: true})
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
                                <Button gradient style={styles.followBotton} onPress={() => { navigation.navigate("settings")}}>
                                        <Text bold center white>Edit  <Feather name="edit-2" size={12} color={theme.colors.white}/></Text>
                                </Button>
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
        cancelFollowRequest: (sender, reciever) => dispatch(action.removeFollowRequest(sender, reciever)),

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

    ))(currentUserProfile)