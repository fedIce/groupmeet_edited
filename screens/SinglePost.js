import React, { Component } from 'react'
import { Block, Text } from '../components'
import { CustomHeader } from '../components/header'
import { Feather } from '@expo/vector-icons'
import { View, FlatList } from 'react-native'
import { theme } from '../constants'
import {Post, EventPost} from '../components/Post'
import { posts } from '../constants/mocks'
import RenderFeedItem from '../components/FeedPostItem'
import {connect} from 'react-redux'
import * as action from '../constants/store/utils/actions'


class SinglePost extends Component {
    
    render(){
        const {post, user } = this.props.navigation.state.params;
        const {providerData} = this.props.navigation.state.params.user;
        const {navigation} = this.props;

        // console.log(post)

        const i = [{
            pid: post.id? post.id: post.pid,
            data: post.data?post.data: post,
            receiver: post.receiver
        }]

        return (
            <View>
                <CustomHeader navL={navigation} left={<Feather name="arrow-left" size={24} color={theme.colors.gray}/>}/>


                    <FlatList 
                            data={i}
                            renderItem={({item, index}) => (

                                <RenderFeedItem item={item}  user={user} pid={item.pid} key={item.pid} props={this.props} navigation={navigation} fromMsg={this.props.navigation.state.params.fromMsg? true: false} />
                                )}
                                numColumns={1}
                                keyExtractor={(item, index) =>{
                                item.pid
                            }}
                          
                            />
               
                    {/* <EventPost user={post.username} photoUrl={post.coverImage} title={post.title} description={post.description} avatar={post.avatar} /> */}
            </View>
        )
    }
}

const mapStateToProps =() => {
    return {

    }
}

const mapDispatchToProps = (dispatch) =>{
    return {
        fetchFeeds: () => dispatch(action.fetchFeeds()),
        fetchComments: (postId) => dispatch(action.getComments(postId)),
        followUser: (from, to) => dispatch(action.sendFollowRequest(from, to)),
        likePost: ({postId, posterId, likerId, likerAvatar, likerDisplayName}) => dispatch(action.likePost({postId, posterId, likerId, likerAvatar, likerDisplayName})),
        postComment: ({postId, posterId, commenterId, commenterAvatar, commenterName, comment, commentId}) => dispatch(action.sendComment({postId, posterId,  commenterId, commenterAvatar, commenterName, comment , commentId})),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SinglePost);