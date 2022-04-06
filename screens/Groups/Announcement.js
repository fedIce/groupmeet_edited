import React, { useState, useEffect } from 'react'
import {StyleSheet, FlatList, TouchableOpacity, View, Modal, TextInput, Picker, ActivityIndicator } from 'react-native'
import {Block, Text } from '../../components'
import {connect} from 'react-redux'
import moment from 'moment'
import { theme } from '../../constants'
import {addAnnouncement, getAnnouncement} from '../../constants/store/utils/actions'
import { Feather } from '@expo/vector-icons'

// import { addAnnouncement, removeAnnouncement } from '../../constants/store/utils/actions'

function Announcement(props){

    const [openModal, setOpenModal] = useState(false)
    const [title, setTitle] = useState('')
    const [status, setStatus] = useState(true)
    const [body, setBody] = useState('')
    const [level, setLevel] = useState('normal')
    const [ announcement, setAnnouncement ] = useState([])

    useEffect(() => {
        setStatus(true)
        fetchAll().then(async () => {
            await props.announcements.data  && setAnnouncement(props.announcements.data)
            setStatus(false)
       }).then(() => {
           
       })

    }, [])

    const fetchAll = async () => {
        setStatus(true)
        if(props.announcements.data) return
       await props.getAnnouncements(props.navigation.state.params.group.groupId)
    }

    const postItem = async (announcement) => {
        setStatus(true)
        await props.addAnnouncemt(props.navigation.state.params.group.groupId, announcement )
     }

    const closeModal = async () => {
       
        updateAnnouncementsList().then(() => {
            postItem([...announcement,{
                id: announcement.length+1,
                title,
                body,
                level,
                time: new Date()
            }]).then(() => {
                setOpenModal(false)
                setStatus(false)
                fetchAll().then(() => {
                    setStatus(false)
                })
            })
        })

    }

    const updateAnnouncementsList = async () => {
        if(!Array.isArray(announcement)) return
        const newAnn = announcement
        newAnn.push({
            id: announcement.length+1,
            title,
            body,
            level,
            time: new Date()
        })

        setAnnouncement(newAnn)
    }

    const deleteAnnouncement = async (time) => {

        const temp = []

        if(announcement && announcement.length == 1){
           postItem(temp).then(() => {
               setAnnouncement(temp)
               setStatus(false)
           })
        }


        announcement.map( item => {
            if(item.time != time){
                temp.push(item)
            }
        })

        if(temp.length > 0){
            props.addAnnouncemt(props.navigation.state.params.group.groupId, temp)
            if(props.status == 'done'){
                setStatus(false)
           }else{
               setStatus(true)
           }
            setAnnouncement(temp)
            fetchAll().then(() => {
                setStatus(false)
            })
        }
    }


    const { navigation } = props

    return (
        <Block style={{paddingBottom: 100}}>
            <View>
            <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="chevron-left" size={24} color={theme.colors.gray}/></TouchableOpacity>
                </View>
                {
                    announcement && announcement.length > 0?
                
                <FlatList
                    data={announcement}
                    renderItem={({item, index}) => {
                        return (
                            <View style={styles.box} key={index}>
                                
                                <View style={[styles.level,{ backgroundColor: item.level == 'urgent'? theme.colors.accent: item.level == 'normal'? theme.colors.secondary: '#FFCC00'}]}></View>
                                <View style={{ justifyContent:'center', alignItems:'center' }}>
                                    <Text bold h2 >{moment( item.time.toString()[0] == 'T'? item.time.toDate(): item.time ).format('l').toString().split('/')[0]}</Text>
                                    <Text style={styles.date}>{moment( item.time.toString()[0] == 'T'? item.time.toDate(): item.time ).format('ll').toString().split(' ')[0]}</Text>
                                </View>
                                <View style={[styles.contain,{ backgroundColor: item.level == 'urgent'? theme.colors.accent: item.level == 'normal'? theme.colors.secondary: '#FFCC00'}]}>
                                    <Text white bold h4 style={{ textTransform:'uppercase'}}>{item.title}</Text>
                                    <Text white >
                                        {item.body}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() =>  deleteAnnouncement(item.time)} style={{position:'absolute', top: 15, right: 25}}>
                                    <Feather name="x" size={20} color={theme.colors.white}/>
                                </TouchableOpacity>

                            </View>
                        )
                    }}
                />
                :
                <Block center middle style={{ marginTop: 200 }}>
                    <Text color={theme.colors.gray2} bold>No Announcements</Text>
                </Block>
}
            </View>
            {
                props.navigation.state.params.admin?
                    <TouchableOpacity onPress={() => setOpenModal(true)} style={styles.addNew}>
                        <Feather name="plus" size={30} color={theme.colors.white} />
                    </TouchableOpacity>
                    :null
            }
            <Modal 
                visible={openModal}
                transparent={true}
            >
                <Block style={{ backgroundColor: theme.colors.white, paddingTop: 30}}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <TextInput onChangeText={(text) => setTitle(text)} style={styles.input} placeholder="Title" />
                        <TextInput onChangeText={(text) => setBody(text)} style={styles.input} placeholder="Message..." multiline={true} numberOfLines={10} />
                        <View style={{ paddingVertical: 10 }}>
                            <Text bold color={level == 'urgent'? theme.colors.accent: level == 'normal'? theme.colors.secondary: '#FFCC00' }>Importance Level</Text>
                            <Picker
                            selectedValue={level}
                            onValueChange={(itemValue, itemIndex) => setLevel(itemValue)}>
                                <Picker.Item label="Low" value="low"/>
                                <Picker.Item label="Normal" value="normal" />
                                <Picker.Item label="Critical" value="urgent" />
                            </Picker>
                        </View>
                    </View>

                    <TouchableOpacity onPress={()=> closeModal()} style={styles.closeBtn}>
                        <Text white bold>Close</Text>
                    </TouchableOpacity>

                </Block>
            </Modal>
            <Modal 
            visible={status}
            transparent={true}>
                <Block center middle style={{ backgroundColor: theme.colors.semiTransWhite }}>
                    <ActivityIndicator size="large" />
                </Block>

            </Modal>
        </Block>
    )

}

const styles = StyleSheet.create({
    header:{
        height: 90,
        width: '100%',
        backgroundColor: theme.colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 30,
        marginBottom: 10,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,
        elevation: 15
    },
    box:{
        width: '100%',
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
        paddingHorizontal:20
    },
    date:{
        textTransform: 'uppercase'
    },
    contain:{
        width: '75%',
        paddingHorizontal: 10,
        padding: 20,
        borderRadius: 10

    },
    level:{
        width: 15,
        height: 15,
        borderRadius: 8
    },
    addNew:{
        backgroundColor:theme.colors.secondary,
        width: 50,
        height: 50,
        justifyContent:'center',
        alignItems:'center',
        borderRadius: 25,
        position:'absolute',
        bottom: 20,
        right: 20
    },
    input:{
        borderBottomColor: theme.colors.gray3,
        width:'100%',
        paddingHorizontal: 20,
        borderBottomWidth: 2,
        paddingVertical: 10
    },
    closeBtn:{
        width:'100%',
        alignItems: 'center',
        justifyContent:'center',
        position:'absolute',
        bottom:0,
        backgroundColor: theme.colors.secondary,
        paddingVertical: 20
    }
})


const mapStateToprops = (state) => {
    return {
        announcements: state.announcements,
        status: state.announcements.status
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addAnnouncemt: ( groupId, announce ) =>  dispatch(addAnnouncement( groupId, announce )),
        getAnnouncements: (groupId) => dispatch(getAnnouncement(groupId))
    }
}


export default connect(mapStateToprops, mapDispatchToProps)(Announcement)