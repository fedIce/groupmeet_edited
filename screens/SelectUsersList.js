import React, { Component } from 'react'
import { Block, Text } from '../components'
import {CustomHeader} from '../components/header'
import { Ionicons, FontAwesome5, Feather } from '@expo/vector-icons'
import {theme} from '../constants'
import { firestoreConnect } from 'react-redux-firebase'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native'
import {FetchFollowersAccounts} from '../constants/store/utils/actions'


class SelectUsersList extends Component {

    state={
        accounts : []
    }

    componentDidMount(){
        this.props.getListOfFollowings()
        this.setState({ accounts: this.props.allUsers })
    }

    runfilter =( query ) => {
        this.setState({
            accounts: this.state.accounts.filter( user => user.username.includes(query) )
        })
    }

    render(){

        const {navigation} = this.props
        const {filter} = this.props
        
        return (
            <Block>
                <Block>
                    <FlatList 
                        data={this.state.accounts}
                        renderItem={({item, index}) => {
                            return (
                                <TouchableOpacity onPress={() => navigation.navigate('chats',{
                                    item
                                })}>
                                    <Block row center style={styles.listItem} >
                                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                                    <Block>
                                        <Text bold style={{ paddingVertical: 5, color: theme.colors.black}}>{item.username}</Text>
                                        <Text caption color={theme.colors.gray2}>last Message</Text>
                                    </Block>
                                    </Block>
                                </TouchableOpacity>
                            )
                        }}
                        numColumns={1}
                        keyExtractor={(item, index) => item.uid }
                    />

                </Block>
            </Block>
        )
    }
}

const styles = StyleSheet.create({
avatar:{
    width: 56,
    height: 56,
    borderRadius: 23,
    marginHorizontal: 20,
    borderColor: '#e7e7e7',
    borderWidth: 1

},
listItem: {
    paddingVertical: 20,
    backgroundColor: theme.colors.white,
    marginVertical: 1
}
})


const mapStateToProps =(state)=>{
    return {
        allUsers: state.followingAccounts.accounts,
    }
}

const mapDispatchToProps =(dispatch)=>{
    return {
        getListOfFollowings : () => dispatch(FetchFollowersAccounts())
    }
}

export default compose(connect(mapStateToProps, mapDispatchToProps), firestoreConnect([
    { 'collection': 'Users'}
]))(SelectUsersList)