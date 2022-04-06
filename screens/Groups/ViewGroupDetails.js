import React, { Component } from 'react'
import { Block, Text, Button } from '../../components'
import  {TouchableOpacity, Image, ScrollView, View, StyleSheet, ActivityIndicator, Modal, Alert, FlatList }  from 'react-native'
import firebase from 'firebase'
import { Feather } from '@expo/vector-icons'
import { theme } from '../../constants'
import moment from 'moment'
import Event from '../../config/Event'
import Store from '../../config/Storage'
import { connect } from 'react-redux'
import {sendOneOnOneMessage, getAnnouncement} from '../../constants/store/utils/actions'
import {TagUserComponent} from '../../components/SelectUsers'


import * as Analytics from 'expo-firebase-analytics';
const LoaderImage = require('../../assets/images/chatLoader.gif')


class GroupDetails extends Component {

    state = {
        showAllUsers: false,
        group: {},
        loading: false,
        groupCreator: null,
        follow: [],
        openTagModal:false,
        showInfo: false
    }

    toggleShowAllUsers = () => {
        this.setState({ showAllUsers: !this.state.showAllUsers })
    }

   

    componentDidMount(){


        Analytics.setCurrentScreen('GroupDetails');
        this.setState({loading: true})

        if(this.props.navigation.state.params.group && this.props.navigation.state.params.groupId ){


            Event.shared.fetchGroupData(this.props.navigation.state.params.groupId).then( data => {

                
                this.setState({ group: data, groupCreator: data.members[0] })
            })
        }else if(this.props.navigation.state.params.groupId && !this.props.navigation.state.params.group){
            Event.shared.fetchGroupData(this.props.navigation.state.params.groupId).then( data => {
               
                
                this.setState({ group: data, groupCreator: data.members[0], loading: false })
            }).catch(err => console.log(err))
        }else if(this.props.navigation.state.params.group){


            Event.shared.fetchGroupData(this.props.navigation.state.params.group.groupId).then( data => {
                
                this.setState({ group: data })
            })
        }
        this.props.getAnnouncements(this.props.navigation.state.params.groupId)
        
    }


    handleLeaveGroup = () => {

        Alert.alert("Confirm Decision", "Are you sure you wish to leave this group?", [
            {
              text: 'CANCEL',
              onPress: () => null,
              style: 'cancel'
            },
            { text: 'YES I WISH TO LEAVE THIS GROUP', onPress: () =>  { 
                this.setState({ loading: true })
                Event.shared.LeaveGroup( this.props.navigation.state.params.user.uid , this.state.group.groupId, this.state.group.eventId).then(() => {
                this.setState({ loading: false }, () =>  this.props.navigation.navigate('message',{ selectGroup: true }) )
               
            }) }
        }],
          { cancelable: false }
        )

       
    }


    handleDeleteGroup = async () => {



        
        Alert.alert("Confirm Decision", "Are you sure you wish to delete this group?", [
            {
              text: 'CANCEL',
              onPress: () => null,
              style: 'cancel'
            },
            { text: 'YES I WISH TO DELETE THIS GROUP', onPress: () =>  {
                this.setState({ loading: true })
                this.props.navigation.navigate("message")
                Event.shared.DeleteGroup(this.state.group.groupId, this.state.group.eventId).then(() => {
                    this.setState({ loading: false })

                }).catch(err => console.log(err))
            }
        }],
          { cancelable: false }
        )

       
    }
    

    joinGroup = async () => {
        const CharginMethod = await this.state.group.eventChargingMethod
        const price = await this.state.group.eventPrice
        const numOfmembers = await this.state.group.members.length
        var newPrice = 0
       

        

        if(CharginMethod == 'FullPrice' ){
           
            this.props.navigation.navigate("makePayment",{
                groupId: this.state.group.groupId,
                groupName: this.state.group.groupName,
                    pricingMethod: "full",
                    price: parseInt(price),
                    data: this.state.group
            })

          }else if(CharginMethod == 'SplitEqually'){
            
            newPrice = parseInt(price) / numOfmembers
            this.props.navigation.navigate("makePayment",{
                groupId: this.state.group.groupId,
                groupName: this.state.group.groupName,
                pricingMethod: "equal",
                price: newPrice,
                data: this.state.group
            })


          }else if(CharginMethod == 0){

            await Event.shared.AssignGroup(this.props.navigation.state.params.user, { groupId: this.state.group })
            this.props.navigation.navigate("groupChat",{
                groupId: this.state.group.groupId,
                groupName: this.state.group.groupName,
                pricingMethod: "free",
                price: parseFloat(price),
                data: this.state.group
            })
            


          }else{

            newPrice = parseFloat(price) * (100 - CharginMethod)
            this.props.navigation.navigate("makePayment",{
                groupId: this.state.group.groupId,
                groupName: this.state.group.groupName,
               pricingMethod: "percentage",
               price: newPrice,
               data: this.state.group
            })
         
          }
        }

        showInfo = () => {
            this.setState({ showInfo: !this.state.showInfo })
        }

          _fetchFollowing = () => {
                Event.shared.fetchFollowing(this.props.navigation.state.params.user.uid).then(follow => {
                    // console.log(follow)
                    const usersList = Event.shared.fetchUsersById(follow)
                    usersList.then(data => {
                        // console.log("Users List: ", data)
                        this.setState({ follow: data})
                    })
                })
            }

            TagUsers = async () => {
                await this._fetchFollowing()
                this.setState({openTagModal: true})
                
            }

             closeTagUsers = () => {
                this.setState({openTagModal: false})
            }

    render(){
        const {params} = this.props.navigation.state
        return this.state.group.groupId? (
            <Block >
                <View  style={styles.header}>
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center'}}>
                        <View style={{ flexDirection: 'row', width: '80%'}} >
                            <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{ paddingHorizontal: 10 }}><Feather name="arrow-left" size={24} color={theme.colors.gray} /></TouchableOpacity> 
                            <Text h3 bold>Groups: {this.state.group.groupName}</Text>
                        </View>
                        <View  style={{ width:'20%', alignItems:'flex-end', justifyContent: 'center' }}>
                            
                            {
                                 this.props.navigation.state.params.group && !this.props.navigation.state.params.fromChat?
                                    <TouchableOpacity onPress={() =>  this.joinGroup()} style={{ borderStyle: 'dashed', padding:10, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.gray3}}>
                                        <Feather name="log-in" size={24} color={theme.colors.gray} />
                                    </TouchableOpacity>
                                 :
                                 null
                            }
                        </View>
                    </View>
                    <Text caption color={theme.colors.gray}  style={{ alignSelf: 'flex-start', paddingHorizontal:40, fontSize: 13 }} > Registration closes  {moment(this.state.group.registration_closing_date.toDate()).fromNow()}</Text>
                </View>
                {
                    this.state.group.totalPrice && this.state.group.totalPrice?
                <Text caption color={theme.colors.gray}>${this.state.group.groupPrice && parseFloat(this.state.group.groupPrice).toFixed(2)} / ${this.state.group.totalPrice.toFixed(2)}</Text>
                    :
                <Text caption color={theme.colors.gray}>${ this.state.group.groupPrice && parseFloat(this.state.group.groupPrice).toFixed(2)} / ${parseFloat(this.state.group.eventPrice).toFixed(2)}</Text>

                }
                <Block style={{ backgroundColor: theme.colors.white, paddingHorizontal: 20, paddingTop: 30 }}>
                <View row  style={{ height: 30, flexDirection: 'row', justifyContent:'space-between'}}>

                {
                    this.state.group.group?
                        <Text h3 bold color={theme.colors.primary}>Participants ({this.state.group.group.members.length}) </Text>
                        :
                        <Text h3 bold color={theme.colors.primary}>Participants ({this.state.group.members.length}) </Text>
                }

                {
                    params.user?
                        this.state.group.members[0].uid == params.user.uid?
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("groupForm_1", {...this.state.group, fromViewDetails: true})}>
                            <Feather name="settings" size={20} color={theme.colors.gray} />
                            </TouchableOpacity>
                        :
                    null
                    :null
                }

               

                </View>
                        {
                        <View style={{ paddingVertical: 10, flexDirection:'row', alignItems: 'center' }}>
                               {
                            this.state.group.group?
                                !this.state.showAllUsers?
                                this.state.group.group.members.slice(0, 4).map( (member, idx) => {
                                        return (
                                                <View key={idx}>
                                                <TouchableOpacity onPress={() => this.props.navigation.navigate("Profile", { userId: member.uid})}>
                                                    <Image source={{ uri: member.avatar}} style={styles.avatar} />
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    })
                                    :
                                    <View style={{ width:"100%", paddingBottom: 50}}>
                                        <TouchableOpacity onPress={() => this.toggleShowAllUsers()} style={{ alignSelf:'flex-end'}}>
                                            <Text bold style={{ color: 'blue' }}> Show Less... </Text>
                                        </TouchableOpacity>
                                        <ScrollView showsVerticalScrollIndicator={false}>
                                       { this.state.group.group.members.map( (member,idx) => {
                                            return (
                                                <TouchableOpacity key={idx} onPress={() => this.props.navigation.navigate("Profile", { userId: member.uid})} style={{ width: '100%', justifyContent: 'center'}}>
                                                    <View style={styles.profileItem}>
                                                        <Image source={{ uri: member.avatar}} style={styles.avatar} />
                                                        <View style={{ paddingHorizontal: 10 }}>
                                                            <View style={{ flexDirection: 'row', alignItems:'center' }}>
                                                                <Text style={styles.name} >{member.name}</Text>
                                                                {member.role == 'planner' ? <Text style={ styles.role} >{member.role}</Text> : null}
                                                            </View>
                                                            <Text color={theme.colors.gray}>Member</Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        })}
                                        </ScrollView>
                                    </View>
                                    :
                                    this.state.group.members.slice(0, 4).map( (member,idx) => {
                                        return (
                                                <View key={idx}>
                                                <TouchableOpacity onPress={() => this.props.navigation.navigate("Profile", { userId: member.uid})}>
                                                    <Image source={{ uri: member.avatar}} style={styles.avatar} />
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    })
                               }

                               {
                                    (4 >= this.state.group.members.length) && !this.state.showAllUsers?
                                    <View>
                                        <TouchableOpacity onPress={() => this.toggleShowAllUsers()} style={{ width: 64, height: 64, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(0,0,0, .1)', borderRadius: 24}}><Feather name="more-horizontal" size={30} color={theme.colors.gray2} /></TouchableOpacity>
                                    </View>
                                : null
                               }
                        </View>
                        }

                        <View style={styles.listItem}>
                            <TouchableOpacity onPress={() => this.showInfo()} >
                                <Text bold color={theme.colors.option}>Group Information</Text>
                            </TouchableOpacity>
                            <Feather name="info" size={20} color={theme.colors.gray} />
                        </View>
                        <View style={styles.listItem}>
                            <TouchableOpacity onPress={() => this.TagUsers()} >
                                <Text bold color={theme.colors.option}>Ask Your Friends To Join</Text>
                            </TouchableOpacity>
                            <Feather name="share-2" size={20} color={theme.colors.gray} />
                        </View>
                        <View style={styles.listItem}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('costbreakdown', {data: this.state.group })} >
                                <Text  bold color={theme.colors.option}>View Group Cost Breakdown</Text>
                            </TouchableOpacity>
                            <Feather name="chevron-right" size={20} color={theme.colors.gray} />
                        </View>

                        <Modal
                            visible={this.state.openTagModal}
                        >
                                    <Block>

                                        <View style={styles.searchBox}>
                                            {/* <TextInput onChange={(val) => filterFollowing(val)} placeholder="Search..." style={styles.searchBar}/>
                                            <TouchableOpacity style={styles.searchAction}>
                                                <Feather name="search" size={20} />
                                            </TouchableOpacity> */}
                                        </View>
                                    {
                                        this.state.follow.length > 0 ? 
                                            <FlatList
                                                data={this.state.follow}
                                                extraData={this.state.follow}
                                                renderItem={({item, index}) => {
                                                    return (
                                                    <TagUserComponent item={item} data={this.state.group} user={this.props.user} addMsg={this.props.addMsg} groupTag={true} />
                                                    )
                                                }}
                                        />
                                            :
                                            <View style={{ width: '100%', height: '100%', justifyContent:'center', alignItems:'center'}}>
                                                <Image source={LoaderImage} style={{ width: 100, height: 100}}/>
                                            </View>
                                    }

                                        <View>
                                            <TouchableOpacity onPress={() => this.closeTagUsers()} style={{
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

                        <Modal 
                            visible={this.state.loading}
                            transparent={true}
                        >
                            <Block center middle style={{ backgroundColor: theme.colors.semiTransWhite }}>
                                    <ActivityIndicator size="large"/>
                            </Block>
                        </Modal>
                        

               
                {
                    !this.props.navigation.state.params.group && this.props.navigation.state.params.fromChat?
                        this.state.groupCreator && this.state.groupCreator.uid == params.user.uid?
                        <View  style={{ width: '100%'}}>
                            <View style={styles.listItem}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate("announcement",{ group: this.state.group, admin: params.user && this.state.group.members[0].uid == params.user.uid? true: false })} >
                                <Text  bold color={theme.colors.option}>Make Announcements</Text>
                            </TouchableOpacity>
                            <Feather name="chevron-right" size={20} color={theme.colors.gray} />
                        </View>
                            <View style={styles.listItem}>
                                <TouchableOpacity onPress={() => this.handleDeleteGroup()} >
                                    <Text  bold color={theme.colors.accent}>Delete Group</Text>
                                </TouchableOpacity>
                                <Feather name="trash" size={20} color={theme.colors.accent} />
                            </View>
                        </View>
                        :
                        
                            <View style={{ width: '100%'}}>
                                <View style={styles.listItem}>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate("announcement",{ group: this.state.group, admin: params.user && this.state.group.members[0].uid == params.user.uid? true: false })}  >
                                        <Text  bold color={theme.colors.option}>Announcements</Text>
                                    </TouchableOpacity>
                                    <Feather name="chevron-right" size={20} color={theme.colors.gray} />
                                </View>

                                <View style={styles.listItem}>
                                    <TouchableOpacity onPress={() => this.handleLeaveGroup()} >
                                        <Text  bold color={theme.colors.accent}>Leave Group</Text>
                                    </TouchableOpacity>
                                    <Feather name="log-out" size={20}   color={theme.colors.accent}/>
                                </View>
                            </View>
                    :null
                }
                
                            
                </Block>
                
                <Modal
                    visible={this.state.loading}
                    transparent={true}
                >
                    <Block style={{ backgroundColor: theme.colors.semiTransWhite }} center middle>
                        <ActivityIndicator size='large' />
                    </Block>
                </Modal>

                <Modal
                    visible={this.state.showInfo}
                    transparent={false}
                >
                    <Block >
                      <View style={{ justifyContent:'center', alignItems:'center', height:'100%'}}>
                        <Text>Group Name: {this.state.group.groupName}</Text>
                        <Text>Group Price: {this.state.group.totalPrice && parseFloat(this.state.group.totalPrice).toFixed(2)}</Text>
                        <Text>Price Per Head: {this.state.group.groupPrice && parseFloat(this.state.group.groupPrice).toFixed(2)}</Text>
                        <Text>Number Of Participants: {this.state.group.group.members.length}</Text>
                        <Text>Group Admin: {this.state.group.members[0].name}</Text>


                      </View>
                        <TouchableOpacity onPress={() => this.showInfo()} style={styles.closeBtn}>
                            <Text white bold>Close</Text>
                        </TouchableOpacity>
                    </Block>
                </Modal>

            </Block>
        ): null
        
    }
}

const styles = StyleSheet.create({
    header:{
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 20,
        paddingTop: 50,
        position:'relative',
        top:0,
        width: '100%',
        backgroundColor: theme.colors.white
    },
    avatar:{
        width: 64,
        height: 64,
        borderRadius: 24,
        margin: 5,
        marginBottom:10
    },
    profileItem:{
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        paddingVertical:20,
        borderBottomColor: 'rgba(44,41,41, 0.1)',
        borderBottomWidth: 2
    },
    role:{
        color: '#6F41E9',
        fontWeight: '400',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        backgroundColor: 'rgba(103,63,230, 0.1)',
        marginHorizontal: 10,
        textTransform: 'capitalize'
    },
    name:{
        fontWeight: '700',
        fontSize: 18,
        textTransform: 'capitalize'
    },
    listItem:{
        width: '100%',
        paddingVertical: 30,
        backgroundColor:theme.colors.white,
        borderBottomColor: theme.colors.gray3,
        borderBottomWidth:1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    closeBtn:{
        width:'100%',
        alignItems: 'center',
        justifyContent:'center',
        position:'absolute',
        bottom:0,
        backgroundColor: theme.colors.secondary,
        paddingVertical: 20
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

const mapStateToProps = (state) => {
    return {
        user: state.firebase.auth,
    }
}


const mapDispatchToProps = (dispatch) => {
    return {
        addMsg: ( conversationId, uid1, uid2, avatar, name, chatData ) => dispatch(sendOneOnOneMessage( conversationId, uid1, uid2, avatar, name, chatData )),
        getAnnouncements: (groupId) => dispatch(getAnnouncement(groupId))

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupDetails)