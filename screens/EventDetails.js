import React, { Component } from 'react'
import { Block, Text, Button, Divider } from '../components'
import {View, Dimensions, StyleSheet, TouchableOpacity, Image } from 'react-native'
import FitImage from 'react-native-fit-image'
import  {CustomHeader } from '../components/header'
import firebase from 'firebase'
import Drawer from 'react-native-draggable-view'
import { Ionicons, Feather } from '@expo/vector-icons'
import { theme } from '../constants'
import navigations from '../navigations'
import moment from 'moment' 
import { ScrollView } from 'react-native-gesture-handler'
import * as Analytics from 'expo-firebase-analytics';


const {width, height} = Dimensions.get('window')

class EventDetails extends Component {

    state = {
        detailsPostLiked: { status: false, count: 0 },
        seeMore: false
    }

    UNSAFE_componentDidMount(){
        Analytics.setCurrentScreen('EventDetails');
    }


    likedPostDetails =(post, user, pid, count) => {

        this.setState({ detailsPostLiked: { status: true, count: count + 1}}, () => {
            this.props.navigation.state.params.setLikedPost(post, user, pid, count)
        })
    }

    printCount = (count) => {
        if(parseInt(count) > 9999){
            return '10K'
        }

        if(parseInt(count) > 999){
            return '1K'
        }

        if(parseInt(count) < 999){
            return  count
        }

        if(parseInt(count) > 99999){
            return '100K'
        }

        if(parseInt(count) > 999999){
            return '1M'
        }

    }

    toggleSeeMore = () => {
        this.setState({ seeMore: !this.state.seeMore })
    }

    registerEvent = (group, post, user) => {
        const { navigation } = this.props
        if(group != null){
            navigation.navigate('groupSingle', { post, user })
        }else{
            navigation.navigate('makePayment', { post, user })
        }
    }

    renderConatinerView =() => {
        const { navigation } = this.props
        const { user, post } = navigation.state.params
        const { postLiked, setLikedPost, liked } = navigation.state.params

        console.log()

        return (
            <Block center style={{ backgroundColor: 'black'}}>
               <FitImage
               source={{ uri: post.data.coverImage}}
               resizeMode='contain' 
               style={{ borderRadius: 20, width, height: height/2.7 }}
               />
               <Block style={styles.actionIconsArea}>
                   {
                       !(post.data.likers && post.data.likers.includes(user.uid)) && !liked?
                        <TouchableOpacity activeOpacity={ !this.state.detailsPostLiked.status? 0: 1  }  onPress={() => { !this.state.detailsPostLiked.status? this.likedPostDetails(post, user, post.pid, post.data.likes) : null }} style={styles.actionBtn}>
                            <Feather name="heart" size={24} color={!this.state.detailsPostLiked.status? "#ed4956" : theme.colors.gray } />
                            <Text caption white style={styles.badge}>{this.state.detailsPostLiked.status? this.printCount(this.state.detailsPostLiked.count) : this.printCount(post.data.likes) }</Text>
                        </TouchableOpacity>
                       :
                       <TouchableOpacity style={styles.actionBtn}>
                            <Feather name="heart" size={24} color={theme.colors.gray} />
                            <Text caption white style={styles.badge}>{postLiked.status? this.printCount(postLiked.count) : this.printCount(post.data.likes) }</Text>
                        </TouchableOpacity>
                   }
                   
                    <TouchableOpacity style={styles.actionBtn}>
                        <Feather name="message-circle" size={24} color={theme.colors.white} />
                        <Text caption white style={styles.badge}>{post.data.commentsCount? post.data.commentsCount: null}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Feather name="share-2" size={24} color={theme.colors.white} />
                    </TouchableOpacity>
               </Block>
               <TouchableOpacity onPress={() => navigation.goBack()} style={{ position:'absolute', top:40, left: 10}}>
                   <Feather name="arrow-left" size={24} color={theme.colors.white} />
               </TouchableOpacity>
            </Block>
        )
    }

    

    renderDrawerView =() => {

        const { navigation } = this.props
        const { user, post } = navigation.state.params
        const { group } = navigation.state.params


        return (
            <Block>
                <View style={{ maxHeight: 100, justifyContent: 'center', alignItems: 'center' }}>
                    <Text  style={{ textAlign:'center', textTransform: 'capitalize'}} h1>{post.data.title}</Text>
                    <Text  caption color={theme.colors.gray}> by {post.data.username}</Text>
                </View>
                <View style={{flexDirection: 'row', marginTop: 15, justifyContent: 'center', alignItems: 'center'}}>
                    <View style={styles.tags}>
                        <Feather name="star" size={25} color={theme.colors.gray}/>
                        <Text >Interested</Text>
                        <Text bold color={theme.colors.secondary}>{this.state.detailsPostLiked.status? this.printCount(this.state.detailsPostLiked.count) : this.printCount(post.data.likes) }</Text>
                    </View>

                    <View style={styles.tags}>
                        <Feather name="check-circle" size={25} color={theme.colors.gray}/>
                        <Text>Registered</Text>
                        <Text bold color={theme.colors.secondary}>{post.data.registered}</Text>
                    </View>


                    <View style={styles.tags}>
                        <Feather name="users" size={25} color={theme.colors.gray}/>
                        <Text>Groups</Text>
                        <Text bold color={theme.colors.secondary}>{post.data.group? post.data.group.groupId.length : 0}</Text>
                    </View>
                </View>
                <Divider style={{maxHeight: 1.5}} />
            {
                !this.state.seeMore?
                    <View>
                        <View style={{ paddingHorizontal: 30, paddingVertical: 30 }}>  
                            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate("Profile", { userId: post.data.uid})} style={{ marginHorizontal: 10 }} >
                                    <Image source={{ uri:  post.data.avatar }}  style={styles.avatar}/>
                                </TouchableOpacity>
                                <View>
                                    <Text bold style={{ fontSize: 16 }}>{post.data.username}</Text>
                                    <Text color={theme.colors.gray}>caption or details</Text>
                                </View>
                            </View>

                        </View>


                        <View style={{ paddingHorizontal: 30, paddingVertical: 10 }}>
                            <View style={{flexDirection: 'row', alignItems:'center', marginVertical:5 }}>
                                <Feather name="clock" size={30} color={theme.colors.primary} />
                                <View>
                                    <Text caption style={{ fontSize: 13, paddingHorizontal: 20 }}><Text color={theme.colors.option} bold>from :</Text> {moment(post.data.eventDates[1]).format('LLLL')}</Text>
                                    <Text caption style={{ fontSize: 13, paddingHorizontal: 20 }}><Text color={theme.colors.option} bold>To :</Text> {moment(post.data.eventDates[0]).format('LLLL')}</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', alignItems:'center', marginVertical:5 }}>
                                {

                                }
                            </View>
                            <View style={{ marginTop: 40}}>
                                <Text title style={{ marginVertical: 10 }}>Event Details</Text>
                                <Text style={{ fontSize: 15 }}>{post.data.description.slice(0, 100)}</Text>
                                
                                    {post.data.description.length > 100? <TouchableOpacity style={styles.seeMore} onPress={() => this.toggleSeeMore()}>
                                        <Text white caption  >Show More...</Text>
                                     </TouchableOpacity> : null}
                                
                            </View>


                           
                        </View>
                    </View>

                :

                <View style={{ marginTop: 10, marginHorizontal: 30}}>
                    <Text title style={{ marginVertical: 10 }}>Event Details</Text>
                    <View style={{height: 280 }}>
                        <ScrollView>
                            <Text style={{ fontSize: 15 }}>{post.data.description}</Text>
                        </ScrollView>
                    </View>
                    <TouchableOpacity style={styles.seeMore} onPress={() => this.toggleSeeMore()}>
                        <Text white caption >Show Less</Text>
                    </TouchableOpacity>
                </View>
            }

                <View style={{marginBottom:40, marginTop:10, marginHorizontal: 30}}>
                    <Button onPress={() => this.registerEvent(group, post, user)} gradient >
                        <Text center h3 white>Register Now!</Text>
                    </Button>
                </View>
                
            </Block>
        )
    }

    render(){
    const {navigation} = this.props

        return (
            <Block>
                {/* <CustomHeader left={
                    <Ionicons name="md-arrow-back" size={24} color={theme.colors.gray2}/>
                }
                navL={navigation}
                 /> */}
               <Drawer
                autoDrawerUp={1} // 1 to auto up, 0 to auto down
                renderContainerView={() => this.renderConatinerView()}
                renderDrawerView={() => this.renderDrawerView()}
                initialDrawerSize={0.65}
                finalDrawerHeight={50}
                renderInitDrawerView={() => (
                    <View style={styles.initialDrawer}>
                        <Feather name="minus" size={54} color="#f0efff" />
                    </View>
        )}
    />
            </Block>
        )
    }
}

const styles = StyleSheet.create({
    initialDrawer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: 50,
        width: width,
        justifyContent:'flex-start',
        alignItems:'center'
    },
    actionIconsArea:{
        position: 'absolute',
        top: 80,
        right: 20
    },
    actionBtn:{
        padding: 10,
        backgroundColor: 'rgba(225,225,225, 0.3)',
        borderRadius: 20,
        marginVertical: 5
    },
    badge:{
        position:'absolute',
        bottom: 3,
        right: -3,
        padding:3,
        borderRadius: 10,
        // justifyContent:'center',
        // alignItems:'center',
    },
    tags:{
        width: '30%',
        justifyContent: 'center',
        alignItems:'center'
    },
    avatar:{
        width: 55, 
        height: 55,
        borderRadius: 35,
    },
    seeMore:{
        padding: 5,
        backgroundColor: 'rgba(0,0,0,.1)',
        borderRadius: 20,
        width: 100,
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 20
    }
})

export default EventDetails