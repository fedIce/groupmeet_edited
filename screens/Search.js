import React, { Component } from 'react'
import { Block, Text } from '../components'
import { CustomHeader } from '../components/header'
import { Feather } from '@expo/vector-icons'
import { theme } from '../constants'
import firebase from '../config/firebaseCon'
import { StyleSheet, View, Image, FlatList, TouchableOpacity, Dimensions, TextInput } from 'react-native'
import { connect } from 'react-redux'
import * as action from '../constants/store/utils/actions'
import {Filter, FilterOptions} from '../components/Filter'
import moment from 'moment'



const db = firebase.firestore()

const {width, height } = Dimensions.get('window')


class Search extends Component {

    state = {
        feeds: [],
        users: [],
        loadMore: 10,
        loadMoreUsers: 10,
        isLoading: false,
        lastVisiblePost: null,
        lastVisibleUsersPost: null,
        setPostLiked: {status: false, count: 0},
        firstQuery: '',
        searchMode: false,
        _posts: null,
        tabs: [
            {title: 'Users', active: true },
            // {title: 'Posts', active: false },
            {title: 'Events', active: false },
           
        ],
        activeTab: 'Users'
    }

    componentDidMount(){
        this.LoadSearch()
        this.LoadUsers()
        this.LoadPosts()
    }

    LoadUsers = async () => {
    
        this.setState({ isLoading: true })
        var tempFeeds = []
    
        var first = await db.collection("Users")
        .where('username', '>=', this.state.firstQuery)
        .where('username', '<', this.state.firstQuery + 'z' )
        .limit(10);

        return first.get().then((documentSnapshots) => {
        // Get the last  document
        var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
            this.setState({ lastVisibleUsersPost: lastVisible })

            documentSnapshots.forEach(doc => {
                tempFeeds.push({uid: doc.id, data: doc.data() })
            })
        }).then(() => {
            this.setState({ users: tempFeeds })
            this.setState({ isLoading: false })

        });

    }

    viewPost = (post) => {
        this.props.navigation.navigate("singlePost", {
            post,
            user: this.props.user
        })
    }
    
    LoadSearch = async () => {
    
        this.setState({ isLoading: true })
        var tempFeeds = []
    
        var first = await db.collection("Posts")
        .where('title', '>=', this.state.firstQuery)
        .where('title', '<', this.state.firstQuery + 'z' )
        // .orderBy("postedAt",'desc')
        .limit(25);

        return first.get().then((documentSnapshots) => {
        // Get the last  document
        var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
            this.setState({ lastVisiblePost: lastVisible })

            documentSnapshots.forEach(doc => {
                tempFeeds.push({pid: doc.id, data: doc.data() })
            })
        }).then(() => {
            this.setState({ feeds: tempFeeds })
            this.setState({ isLoading: false })

        });

    }

    LoadPosts = async () => {
    
        this.setState({ isLoading: true })
        var tempFeeds = []
    
        var first = await db.collection("Posts")
        .orderBy("postedAt",'desc')
        .limit(25);

        return first.get().then((documentSnapshots) => {
        // Get the last  document
        var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
            this.setState({ lastVisiblePost: lastVisible })

            documentSnapshots.forEach(doc => {
                tempFeeds.push({pid: doc.id, data: doc.data() })
            })
        }).then(() => {
            this.setState({ _posts: tempFeeds })
            this.setState({ isLoading: false })

        });

    }


    onLoadMore = async () => {

        var tempFeeds = []
         // Construct a new query starting at this document,
        // get the next 25 cities.
        this.setState({ isLoading: true })
        var next = db.collection("Posts")
                .where('title', '>=', this.state.firstQuery)
                .where('title', '<', this.state.firstQuery + 'z' )  
                // .orderBy("postedAt")
                .startAfter(this.state.lastVisiblePost)
                .limit(10);

        next.get().then((documentSnapshots) => {
            // Get the last  document
            var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
                this.setState({ lastVisiblePost: lastVisible })
    
                documentSnapshots.forEach(doc => {
                    tempFeeds.push({pid: doc.id, data: doc.data() })
                })
            }).then(() => {
                this.state.feeds.concat(tempFeeds)
                this.setState({ isLoading: false })
            });
    }

    onLoadMoreUsers = async () => {

        var tempFeeds = []
         // Construct a new query starting at this document,
        // get the next 25 cities.
        var next = db.collection("Users")
                .where('username', '>=', this.state.firstQuery)
                .where('username', '<', this.state.firstQuery + 'z' )
                .startAfter(this.state.lastVisibleUsersPost)
                .limit(10);

        next.get().then((documentSnapshots) => {
            // Get the last  document
            var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
                this.setState({ lastVisibleUsersPost: lastVisible })
    
                documentSnapshots.forEach(doc => {
                    tempFeeds.push({uid: doc.id, data: doc.data() })
                })
            }).then(() => {
                this.state.users.concat(tempFeeds)
            });
    }

    setLikedPost = (post, user, postId, likes ) => {

        this.setState({setPostLiked: {status: true, count: parseInt(likes) + 1}})
        this.props.likePost({ postId: post.pid, posterId: post.data.uid, likerId: user.uid, likerAvatar: user.photoURL, likerDisplayName: user.displayName} )
    }

    openEvent = (post) => {
        this.props.navigation.navigate('eventDetails', { postId: post.pid, post, user: {uid: post.uid, avatar: post.avatar, displayName: post.username}, group: post.data.group, setLikedPost: this.setLikedPost, postLiked: this.state.setPostLiked.status, liked: true  })
    }

    SearchForUsers =(query) => {

        this.setState({ firstQuery: query.nativeEvent.text });
        this.LoadUsers()
    }

    SearchForPosts =(query) => {

        this.setState({ firstQuery: query.nativeEvent.text });
        this.LoadSearch()
    }

    updateFilter = (option) => {

        var temp = []
        var active = null
    
    
        this.state.tabs.map( item => {
            if(item.title == option){
                temp.push({title: item.title, active: true })
                active = option
            }else{
                temp.push({title: item.title, active: false })
            }
        })
    
        this.setState({ tabs: temp, activeTab: active })
        // this.setState({ activeFilter: temp }, () => this.filterPosts(option.title))
      }

      filterPosts = (title) => {
        var temp = []
        var count = 0
    
        this.state.feeds.map( item => {
    
            if(title != 'Users'){
    
                if(item.data.eventCategory == title){
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
    }

    renderSearchResults = (users=null, feeds=null) => {

        

        if(this.state.activeTab == 'Users'){

            return (
                <FlatList
                data={users}
                extraData={users}
                renderItem={({item, index}) => {
                  
             

                   return ( <TouchableOpacity onPress={() => this.props.navigation.navigate('Profile', {userId: item.data.uid})}>
                        <View style={styles.usersListItem}>
                                <Image source={{uri: item.data.avatar }} style={styles.userImage}/>
                                <Text style={styles.userName}>{item.data.username}</Text>
                        </View>
                    </TouchableOpacity>)
                

                    }}
                    onEndReached={() => this.onLoadMoreUsers()} //More general function reloads based on func(activeTab)
                    onEndReachedThreshold={20}
                    onRefresh={() => this.LoadUsers()}
                    numColumns={1}
                    refreshing={this.state.isLoading}
                    keyExtractor={(item, index) => { item.uid}}
                    />
                    )
        }else if(this.state.activeTab == 'Posts'){

        }else if(this.state.activeTab == 'Events'){

            return (
                <FlatList
                    showsHorizontalScrollIndicator={false}
                    data={feeds}
                    renderItem={({item, index}) => {
                    return item.data.type == 'event'? ( 
                        <View>
                            <TouchableOpacity onPress={() => this.openEvent(item)} style={{ flexDirection:'row'}}>
                                <Image source={{ uri: item.data.coverImage }} style={styles.eventImage} />
                                <View style={{padding: 5, paddingTop: 20}}>
                                    <Text title color={theme.colors.black} bold>{item.data.title}</Text>
                                    <Text caption color={theme.colors.gray2}>Starts {moment(item.data.eventDates[1]).format('ll')}</Text>
                                    <Text caption color={theme.colors.secondary}>Ticket {parseInt(item.data.ticketPrice) == 0? "Is Free" : "Costs "+ item.data.ticketPrice}</Text>
                                    <Text caption color={theme.colors.gray2}>Has {parseInt(item.data.numberOfregistrations) == 0? "No Registered Members" : item.data.numberOfRegistrations + " Registered Members"}</Text>
                                </View>
                            </TouchableOpacity>
                            {/* <TouchableOpacity style={styles.avatarTouch}><Image source={{ uri: item.data.avatar }} style={styles.avatar} /></TouchableOpacity> */}
                           
                        </View>
                        ): null
                    }}
                    onEndReached={() => this.onLoadMore()} //More general function reloads based on func(activeTab)
                    onEndReachedThreshold={0}
                    onRefresh={() => this.LoadSearch()}
                    numColumns={1}
                    refreshing={this.state.isLoading}
                    numColumns={1}
                    keyExtractor={(item, index) => { item.pid}}
                >
                            
            </FlatList>
            )

        }

    }


    render(){

        const { feeds } = this.state
        const { users } = this.state
        const { firstQuery } = this.state;


        return (
            <Block flex={1}>
                <View style={styles.header}>
                    {
                        !this.state.searchMode?
                        <Block style={{ justifyContent: 'space-between', alignItems: 'center', width }} row>
                            <Text title bold>Search</Text>
                            <TouchableOpacity onPress={() => this.setState({ searchMode: true })}><Feather name="search" size={24} style={{ alignSelf: 'flex-end'}} /></TouchableOpacity>
                        </Block>
                        :
                        <Block row style={styles.searchbarContain}>
                            <TextInput
                                style={styles.searchbar}
                                    placeholder="Search"
                                    onChange={query => { this.state.activeTab=='Users'? this.SearchForUsers(query): this.SearchForPosts(query) }}
                                    value={firstQuery}
                                />
                            <TouchableOpacity onPress={() => this.setState({ searchMode: false })} style={styles.cancelSearch}><Feather name="x" size={10} color={theme.colors.white} /></TouchableOpacity>
                        </Block>
                    }
                    
                </View>
                {
                    !this.state.searchMode?
                    <Block style={{ width }}> 
                    <View style={{ height:  height * 0.25 }} >
                        <Text title style={styles.titles}>New Events</Text>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={feeds}
                            renderItem={({item, index}) => {
                            return item.data.type == 'event'? ( 
                                <View>
                                    <TouchableOpacity onPress={() => this.openEvent(item)}><Image source={{ uri: item.data.coverImage }} style={styles.eventImage} /></TouchableOpacity>
                                    <TouchableOpacity style={styles.avatarTouch}><Image source={{ uri: item.data.avatar }} style={styles.avatar} /></TouchableOpacity>
                                </View>
                                ): null
                            }}
                            numColumns={1}
                            keyExtractor={(item, index) => { item.pid }}
                        >
                            
                        </FlatList>
                    </View>
                     <View style={{ width: '100%', height: height * 0.75, paddingHorizontal: 5, paddingTop: 10, justifyContent: "center", alignItems: 'center', paddingBottom:120}} >
                        <Text title style={[styles.titles,{ alignSelf: 'flex-start', marginBottom: 10 }]}>Discover</Text>
                        <FlatList
                            data={this.state._posts}
                            renderItem={({item, index}) => {
                            return item.data.type != 'event'? ( 
                                <View style={{ width, marginVertical: 5 }}>
                                    <TouchableOpacity onPress={() => this.viewPost(item)}><Image source={{ uri: item.data.media[0] }} style={styles.postImage} /></TouchableOpacity>
                                    <TouchableOpacity style={styles.postAvatarTouch}><Image source={{ uri: item.data.avatar }} style={styles.postAvatar} /></TouchableOpacity>
                                </View>
                                ): null
                            }}
                            keyExtractor={(item, index) => { item.pid}}
                        >
                            
                        </FlatList>
                    </View>

                </Block>
                :
                <Block>
                <Filter>
                    {
                        this.state.tabs.map( category => {
                            return <TouchableOpacity onPress={() => this.updateFilter(category.title)}><FilterOptions option={category.title} active={category.active} /></TouchableOpacity>
                        })
                    }
                </Filter>
                  {this.renderSearchResults(users, feeds)}
                </Block>
                }
                
            </Block>
        )
    }
}

const styles = StyleSheet.create({
    eventImage: {
        width: 200, 
        height: 150,
        resizeMode: 'contain',
        marginHorizontal: 5,
        borderRadius: 15
    },
    postImage: {
        width: width * 0.95, 
        height: 200,
        marginHorizontal: 5,
        borderRadius: 5,
        resizeMode: 'cover',

    },
    cancelSearch:{
        backgroundColor: theme.colors.semiTransBlack,
        padding: 5,
        borderRadius: 10,
    },
    searchbar: {
        width: '93%',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical:5
    },
    searchbarContain:{
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        borderColor: theme.colors.gray3
    },
    avatar:{
        width: 35,
        height: 35,
        borderRadius: 17,
    },
    postAvatar:{
        width: 45,
        height: 45,
        borderRadius: 25,
    },
    avatarTouch:{
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 35,
        height: 35,
        borderRadius: 17,
        borderWidth: 1,
        borderColor:theme.colors.semiTransBlack,
        backgroundColor: theme.colors.semiTransWhite,
        justifyContent: 'center',
        alignItems:'center',
        padding: 5
    },
    postAvatarTouch:{
        position: 'absolute',
        bottom: 20,
        right: 35,
        width: 45,
        height: 45,
        borderRadius: 25,
        borderWidth: 1,
        borderColor:theme.colors.semiTransBlack,
        backgroundColor: theme.colors.semiTransWhite,
        justifyContent: 'center',
        alignItems:'center',
        padding: 5
    },
    titles:{
        marginHorizontal: 10,
        marginTop: 20
    },
    header:{
        flexDirection:'row',
        justifyContent: 'space-between',
        alignItems:'center',
        paddingTop: 62,
        paddingVertical: 32,
        paddingBottom: 15,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray3,
        backgroundColor: theme.colors.white
    },
    usersListItem:{
        width: '100%',
        flexDirection:'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        alignItems: 'center',
        borderTopWidth:1,
        borderTopColor: theme.colors.gray3
    },
    userName:{

        fontWeight: 'bold' ,
        paddingLeft: 10

    },
    userImage:{
        width: 40, 
        height: 40 ,
        marginRight: 10,
        borderRadius: 20
    }
})

const mapStateToProps =(state) => {
    return {
        user: state.firebase.auth,

    }
}

const mapDispatchToProps =(dispatch) => {
    return {
        postComment: ({postId, posterId, commenterId, commenterAvatar, commenterName, comment, commentId}) => dispatch(action.sendComment({postId, posterId,  commenterId, commenterAvatar, commenterName, comment , commentId})),
        likePost: ({postId, posterId, likerId, likerAvatar, likerDisplayName}) => dispatch(action.likePost({postId, posterId, likerId, likerAvatar, likerDisplayName})),
    }
}

export default connect(mapStateToProps, mapDispatchToProps )(Search)