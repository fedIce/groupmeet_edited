import React, { Component } from 'react'
import { Block, Text, Button, Divider } from '../../components'
import  {CustomHeader } from '../../components/header'
import { Ionicons, Feather } from '@expo/vector-icons'
import { Image, TouchableOpacity, StyleSheet, View, ScrollView,ActivityIndicator, Modal } from 'react-native'
import { theme } from '../../constants'
import { connect } from 'react-redux'
import {fetchEventGroups} from '../../constants/store/utils/actions'
import Event from '../../config/Event'
import * as Analytics from 'expo-firebase-analytics';



class SelectGroup extends Component {

    state = {
        showMenu : false,
        activeMenuId: '',
        group: {}
    }

    UNSAFE_componentWillMount(){

        // Analytics.setCurrentScreen('SelectGroup');

        console.log("GROUp: ", this.props.navigation.state.params.prop.post.pid)
        this.props.getGroups(this.props.navigation.state.params.prop.post.pid)
    }

    checkRegistrationStatus = (members, maxCapacity) => {
       return members.filter( (member) => member.uid == this.props.user.uid ).length > 0 || members.length >= maxCapacity
    }

    renderGroups = (group) => {
        
        if(group){
        return(
            <View style={styles.groupContain} >
                <TouchableOpacity onPress={() => this.toggleMenu(group.eventId, group)} style={{ alignSelf:'flex-end'}}>
                    <Feather name="more-horizontal" size={34} color={theme.colors.gray}/>
                </TouchableOpacity>
                <Text title color="">{group.groupName}</Text>

                {
                    group.totalPrice?
                <Text caption color={theme.colors.gray}>${parseFloat( group.groupPrice).toFixed(2)} / ${group.totalPrice.toFixed(2)}</Text>
                    :
                <Text caption color={theme.colors.gray}>${parseFloat(group.groupPrice).toFixed(2)} / ${parseFloat(group.eventPrice).toFixed(2)}</Text>

                }
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>

                {
                   group && group.group?
                        group.group.members && group.group.members.slice(0,2).map( member => {
                            return (
                                <Image source={{uri: member.avatar}} style={styles.groupAvatar} />
                            )
                        })
                    :
                        group.members && group.members.slice(0,2).map( member => {
                            return (
                                <Image source={{uri: member.avatar}} style={styles.groupAvatar} />
                            )
                        })
                }
                </View>
                {
                    group && group.group?
                        <Text bold caption color={theme.colors.gray}>{group.group.members.length} / {group.maxCapacity} Participants</Text>
                    :
                    <Text bold caption color={theme.colors.gray}>{group.members.length} / {group.maxCapacity} Participants</Text>
                }
            </View>
        )
            }
    }

    showModalMenu = () => {
        if(this.state.group.eventId == this.state.activeMenuId && this.state.showMenu ){
            return (
                <Modal 
                visible={this.state.showMenu}
                transparent={true}
            >
                <Block>
                    <TouchableOpacity onPress={() => this.toggleMenu(1)} style={styles.menuModal}>
                            <TouchableOpacity onPress={() => this.goTo("groupDetails", {...this.state.group, user: this.props.user})} style={styles.menuBtn} >
                                <Feather name="eye" size={100} color={theme.colors.black} />
                                <Text bold color={theme.colors.gray}>View</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.register('groupChat', this.state.group)}  style={styles.menuBtn} >
                                <Feather name="log-in" size={100} color={theme.colors.black} />
                                <Text bold color={theme.colors.gray}>Join </Text>
                            </TouchableOpacity> 
                    </TouchableOpacity>
                
                </Block>
            </Modal>
            )
        }
    }

    toggleMenu = (id, group = {}) => {
        this.setState({ showMenu: !this.state.showMenu, activeMenuId: id, group: group})
    }

    goTo = (des, group) => {
        this.toggleMenu(1)
        this.props.navigation.navigate(des,{ group, user: this.props.user })
    }

    register = async (des , group) => {
        this.toggleMenu(1)
        await Event.shared.AssignGroup(this.props.user, { groupId: group })
        this.props.navigation.navigate(des, group )
    }

    render(){
        const {navigation}  = this.props

        console.log(this.props.groups.status)

         switch(this.props.groups.status){
            case 'done':
                return (
                    <Block>
                         <CustomHeader left={
                            <Ionicons name="md-arrow-back" size={24} color={theme.colors.gray2}/>
                        } 
                        navL={this.props.navigation}
                        />
                        <Block row middle style={{maxHeight: 100 , borderBottomWidth: 2, borderBottomColor: theme.colors.gray3}} padding={[theme.sizes.padding, theme.sizes.padding]}>
                            <Block flex={8}>
                                <Text h2>Event Groups</Text>
                                <Text styles={{ fontSize: 15}} color={theme.colors.gray}> {this.props.groups.groups? this.props.groups.groups.length: 0} Groups created</Text>
                            </Block>
                            <Block flex={1}>
                                <Image 
                                source={{uri: 'https://lh3.googleusercontent.com/proxy/hBXB5IRcN9izrKrsLihBX4pCfqDgKTwZVG8EAJWj2bKaNI0bXD_NOHGuEYCFWUG9G9kCIRQkrkFaXcubG-nDfC-AD4XfFm3Zwbmo37zH4UuQvn_2mC-e'}}
                                style={{ width: 40, height: 40, borderRadius: 20 }}
                                />
                            </Block>
                        </Block>
                         <Block>
                            <ScrollView>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', flexWrap:'wrap'}} >
                                        {
                                            this.props.groups.groups  && this.props.groups.groups.map( group => {
                                                return group && group.group? 
                                                    !this.checkRegistrationStatus(group.group.members, parseInt(group.maxCapacity))?
                                                            this.renderGroups(group)
                                                        :
                                                        null
                                                    :
                                                    this.renderGroups(group)
                                            })
                                        }
                                    </View>
                                    {
                                        !this.props.groups.groups.length > 0?
                                            <Block center middle margin={[50, 0]} padding={[0, 20]}>
                                                <Text bold color={theme.colors.gray}>No Groups Yet</Text>
                                                <Text caption center bold color={theme.colors.gray2}>Yo, C'mon, Click the Plus icon on the lower right to create your own group and start planning for this event</Text>
                                            </Block>
                                        : null
                                    }
                            </ScrollView>
                        </Block>
                        <TouchableOpacity onPress={() => navigation.navigate('createGroup',{ prop: this.props.navigation.state.params})} style={styles.addGroup}>
                            <Feather name='plus' size={24} color={theme.colors.white} />
                        </TouchableOpacity>
        
                        {this.showModalMenu()}
                    </Block>
                )
            case 'fetching':
                return (
                    <Block center middle>
                        <ActivityIndicator size="large" />
                        <Text>Loading Groups</Text>
                    </Block>
                )
            case 'failed':
                    return (
                        <Block center middle>
                            <Feather name="alert-triangle" size={100} color={theme.colors.accent} />
                            <Text h2 bold>Something went wrong </Text>
                            <Text bold>Please Check Your Internet Connection And try Again</Text>
                        </Block>
                    )
        }
    }
}

const styles = StyleSheet.create({
    addGroup:{
        backgroundColor: theme.colors.primary,
        padding:15,
        position: 'absolute',
        borderRadius: 30,
        bottom: 20,
        right: 20
    },
    groupAvatar:{
        width: 40,
        height: 40,
        borderRadius: 10,
        margin: 5,
        marginBottom:10
    },
    groupContain:{
        backgroundColor: theme.colors.white,
        padding: 10,
        paddingHorizontal:20,
        width: '43%',
        borderRadius: 25,
        margin: 13,
        justifyContent: 'flex-start',
        flexShrink: 1
    },
    menuBtn:{
        backgroundColor: theme.colors.white,
        padding:20,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        margin:20
    },
    menuModal:{
        backgroundColor: theme.colors.semiTransBlack,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%',
        height:'100%',
        
    }
})


const mapStateToProps =(state) => {
    return {
        groups: state.groups,
        user: state.firebase.auth
    }
}

const mapDispatchtoProps = (dispatch) => {
    return {
        getGroups: (eventId) => dispatch(fetchEventGroups(eventId))
    }
}


export default connect(mapStateToProps, mapDispatchtoProps)(SelectGroup)