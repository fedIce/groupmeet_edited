import React, { Component } from 'react'
import { Block, Text } from '../components'
import { compose } from 'redux'
import {Filter, FilterOptions} from '../components/Filter'
import { mocks, theme } from "../constants";
import  {CustomHeader } from '../components/header'
import { Image, TextInput, StyleSheet, TouchableOpacity,View, Dimensions, FlatList, Modal, ActivityIndicator, AsyncStorage } from 'react-native'
import { FontAwesome5, Feather } from '@expo/vector-icons'

import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'

import * as action from '../constants/store/utils/actions'
import RenderFeedItem from '../components/FeedPostItem'
import * as Analytics from 'expo-firebase-analytics';
import firebase from '../config/firebaseCon'

const searchImage = require('../assets/images/searching.gif')

const db = firebase.firestore()


class Feeds extends Component {

    constructor(props) {
        super(props)
    }
    
    static navigationOptions = {
        headerBackImage: null
    }

    state = {
        posts: false,
        feeds: [],
        showFullText: false,
        viewComments: false,
        comment: '',
        postId: '',
        posterId: '',
        commenterId: '',
        commenterAvatar: '',
        commenterName: '',
        loadMore: 10,
        isLoading: false,
        pidList: [],
        newMsgNotification: false,
        activeFilter: [
            {title: 'All', active: true },
            {title: 'Party', active: false },
            {title: 'Weekends', active: false },
            {title: 'Sports', active: false },
            {title: 'Games', active: false },
            {title: 'Midnight', active: false },
            {title: 'Music', active: false },
            {title: 'Adventure', active: false },
            {title: 'Tech', active: false },
        ],
        filterCount: null
    }

    
    componentDidMount(){
        Analytics.setCurrentScreen('App')
        this.feedsLoader()
        this.notifyNewMsg()

        //  console.log("Passed value ",this.props)
    }

    feedsLoader = async () => {
        await this.LoadFeeds(this.props.user.uid)
    }

    notifyNewMsg = async () => {
        const inAsync = await AsyncStorage.getItem("TempNewMsg")
        const inAsync2 = await AsyncStorage.getItem("NewMsg")
        
        if(inAsync != null || inAsync2 != null){


            let data = JSON.parse(inAsync)
            data = data.concat(JSON.parse(inAsync2))
            // console.log("Messages New: ", data)

            if(data.length > 0 && data[0] != null){
               this.setState({newMsgNotification: true})
            }else{
               this.setState({newMsgNotification: false})

            }
        }
    }

  createFnCounter(fn, invokeBeforeExecution) {
    let count = 0;
    return (snapshot) => {
  
      count++;
      if (count <= invokeBeforeExecution) {
        return null;
      } 
  
      return fn(snapshot, count);    
    }
  }


  updateFilter = (option) => {

    var temp = []


    this.state.activeFilter.map( item => {
        if(item == option){
            temp.push({title: item.title, active: true })
        }else{
            temp.push({title: item.title, active: false })
        }
    })

    this.setState({ activeFilter: temp }, () => this.filterPosts(option.title))
  }

  filterPosts = (title) => {
    var temp = []
    var count = 0

    this.state.feeds.map( item => {

        if(title != 'All'){

            if((item.data.eventCategory == title) || (item.data.tags && item.data.tags.includes(title.toLowerCase()))){
                temp.push({...item, showOnly: true })
                count++
            }else{
                temp.push({...item, showOnly: false })
            }
        }else{
            temp.push({...item, showOnly: true })
            count++
        }
    })

    this.setState({ feeds: temp })
    this.setState({filterCount: count} )

  }


handleActivitySubscription = (snapshot, counter) => {


   
    const initialLoad = counter === 1;
    let finalResult = []

    let pids = []
    
    snapshot.docChanges().forEach( async (change) => {   


        if (initialLoad) {
            if(!this.state.pidList.includes(change.doc.id)){
                finalResult.push({pid: change.doc.id, data: change.doc.data()})
                pids.push(change.doc.id)

            }
        } else {

        if(!this.state.pidList.includes(change.doc.id) && this.state.loadMore > 1){

            this.setState({ feeds: [...this.state.feeds, { pid: change.doc.id, data: change.doc.data() }], pidList: [...this.state.pidList, change.doc.id ] })
        }

        this.setState({ isLoading: false })
            
        }      
      });


      
        finalResult.length > 0? this.setState({ feeds: finalResult, isLoading: false, pidList: pids }) : null
    }
  
handleActivitySubscriptionWithCounter = 
this.createFnCounter(this.handleActivitySubscription, 0);


LoadFeeds = async (userId) => {

    this.setState({ isLoading: true })

    let following = []
                
   let unsubscribe = await db.collection('Users').doc(userId).get()
        .then( querySnapshot => {
        
            if(querySnapshot.data().following){
                following = querySnapshot.data().following
                following.push(userId)
            }else{
                following =  []
            }
        
        }).then(() => {
            following.map( async uid => {
            return await db.collection("Posts").where('uid', '==', uid).limit(this.state.loadMore).onSnapshot(this.handleActivitySubscriptionWithCounter)
            })

        })

    return () => unsubscribe();

}

EndReached = () => {
    this.setState({loadMore: this.state.loadMore + 1 }, () => this.LoadFeeds(this.props.user.uid) )
}

LoadMoreFeeds = () => {
    this.setState({loadMore: this.state.loadMore + 1 }, () => this.LoadFeeds(this.props.user.uid) )
}

listFooter = () => {
    return this.state.isoading?(
        <View style={{ width: '100%', height: 20, justifyContent: 'center', alignItems: 'center'}}>
        </View>
    )
    :null
}



    render(){
        var {user, posts } = this.props
        const {feeds} = this.state
        posts = feeds
        const { navigation } = this.props;
        const likeInfo = this.props.likeData;

        // const {userData} = this.props.userData? utils.extractUser(this.props.userData, user.uid) : null;
        

        return (
            <Block>
               <CustomHeader  navL='none' left={<Block style={{ justifyContent: 'flex-start', alignItems: 'center'}} row><Feather name="home" size={24} /><Text title bold>  Feed </Text></Block>}
                    right={
                    <TouchableOpacity onPress={()=> navigation.navigate('message',{new: this.notifyNewMsg})} style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 0, padding: 15 }}>
                        <Feather name="send" size={24} />
                        {this.state.newMsgNotification? <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.colors.accent, position:'absolute', top: 5, right:10}}></View>: null }

                       
                    </TouchableOpacity>
                    }
               />


                <Filter>
                    {
                        this.state.activeFilter.map( (category,idx) => {
                            return <TouchableOpacity key={idx} onPress={() => this.updateFilter(category)}><FilterOptions option={category.title} active={category.active} /></TouchableOpacity>
                        })
                    }
                    
                   
                </Filter>

                    {
                        posts.length > 0?
                        <FlatList 
                            data={posts}
                            renderItem={({item, index}) => (

                                item.showOnly != null?
                                    item.showOnly == true?
                                        <RenderFeedItem item={item}  user={user} pid={item.pid} key={item.pid} props={this.props} navigation={navigation} />
                                    :
                                    null
                                :
                                <RenderFeedItem item={item}  user={user} pid={item.pid} key={item.pid} props={this.props} navigation={navigation} />
                            )}
                                numColumns={1}
                                keyExtractor={(item, index) => item.pid}
                            getItemLayout={(data, index) => (
                                {length: 300, offset: 300 * index, index}
                              )}
                            onEndReached={() => this.LoadMoreFeeds()}
                            initialScrollIndex={this.props.navigation.state.params && this.props.navigation.state.params.newPost? posts.length - 1: 0}
                            onEndReachedThreshold={0}
                            removeClippedSubviews={true}
                            windowSize={11}
                            ListFooterComponent={this.listFooter}
                            initialNumToRender={10}
                            refreshing={this.state.isLoading}
                            onRefresh={() => this.LoadMoreFeeds()}
                            />
                        :
                        <Block center middle>
                            <Feather name="alert-triangle" color={theme.colors.gray3} size={60} style={{ marginBottom: 20}}/>
                            <Text bold color={theme.colors.gray2} size={18} >Oops..Brah, You have no feed</Text>
                            <Text color={theme.colors.gray3}>start following your friends accounts to get their =feed</Text>
                        </Block>
                    }

                    {
                        this.state.filterCount == 0?
                        <Block style={{position:'absolute', top: 400, width:'100%', alignItems:'center', justifyContent:'center'}}>
                            <View style={{ justifyContent: 'center', alignItems:'center'}}>
                                <Image source={searchImage} style={{width: 100, height: 100}} />
                                <Text bold color={theme.colors.gray2} size={18} >Oopsiee..</Text>
                                <Text color={theme.colors.option}>No feed fall in this category</Text>
                            </View>
                        </Block>
                        :
                        null
                    }

               
                                       
            </Block>
        )
    }
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
    }
}) 


const mapStateToProps = (state) => {

    return {
        posts: state.posts.feeds,
        user: state.firebase.auth,
        userData: state.firestore.data.Users,
        followStatus: state.followRequests.followRequest,
        comments:  state.comments
    }
    
}

const mapDispatchToProps = (dispatch) =>{
    return {
        fetchFeeds: () => dispatch(action.fetchFeeds()),
        fetchComments: (postId) => dispatch(action.getComments(postId)),
        followUser: (from, to) => dispatch(action.sendFollowRequest(from, to)),
        likePost: ({postId, posterId, likerId, likerAvatar, likerDisplayName}) => dispatch(action.likePost({postId, posterId, likerId, likerAvatar, likerDisplayName})),
        postComment: ({postId, posterId, commenterId, commenterAvatar, commenterName, comment, commentId}) => dispatch(action.sendComment({postId, posterId,  commenterId, commenterAvatar, commenterName, comment , commentId})),
        addMsg: ( conversationId, uid1, uid2, avatar, name, chatData ) => dispatch(action.sendOneOnOneMessage( conversationId, uid1, uid2, avatar, name, chatData )),
        
    }
}

export default compose(connect(mapStateToProps, mapDispatchToProps), firestoreConnect([
    {'collection': 'Users'},
]))(Feeds);