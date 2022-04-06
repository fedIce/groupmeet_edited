import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, Image, Dimensions, View , FlatList} from "react-native";

import {Block, Button, Text} from './index'
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { theme } from "../constants";
import  { Carousel, CarouselFromUrl } from './Carousel' 
// import CashedImage from '../components/CachedImage'



export const Post = ({user, mediaUrl, title,description, id, active=false, avatar}) => {
    const [modalVisible, setModalVisible] = useState(false);
    return(
        <Block>

            <Block style={{ marginVertical: 10}}>
            <Block>
                <Block row center space="between" padding={[5, theme.sizes.base]} style={{ flex:1 }}>
                    <Image 
                    style={styles.profile}
                        source={{uri:avatar}}
                    />
                    <Text header bold style={styles.username}>{user}</Text>
                    <TouchableOpacity  onPress={() => setModalVisible(true)} style={{ paddingHorizontal: 10}}>
                        <FontAwesome5 name='ellipsis-v' size={14} color={theme.colors.black} />
                    </TouchableOpacity>
                </Block>
                {
                    mediaUrl.length?
                    <Block center middle style={{ backgroundColor: theme.colors.semiTransWhite, flex: 7}}>
                        <CarouselFromUrl illustrations={mediaUrl} /> 
                    </Block>
                :
                null
                }
            </Block>
            <Block style={styles.icons, { margin: 5}} row space="between" >
                <TouchableOpacity style={{ flex:1, marginHorizontal: 3 }} >
                    <Ionicons name="md-heart-empty" size={24} color={theme.colors.gray} style={{ flex:1, marginHorizontal: 3 }}/>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex:1, marginHorizontal: 3 }} >
                    <Ionicons name="md-chatboxes" size={24} color={theme.colors.gray} style={{ flex:1, marginHorizontal: 3 }}/>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex:1, marginHorizontal: 3 }} >
                    <Ionicons name="md-send" size={24} color={theme.colors.gray} style={{ flex:9, marginHorizontal: 3 }}/>
                </TouchableOpacity>
                <Block style={{ flex: 8 }}></Block>
                <TouchableOpacity style={{ flex:1 }} >
                    <Ionicons name="md-bookmark" size={24} color={theme.colors.gray} style={{ flex:1 }}/>
                </TouchableOpacity>
            </Block>
            <View style={{ backgroundColor: 'red'}}>
                <Text style={styles.desc} caption  color={theme.colors.black}>{description}</Text>
            </View>
            </Block>


            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                presentationStyle="overFullScreen"

            >
                <TouchableOpacity style={styles.modalMenu} onPress={() => setModalVisible(false)}>
                    <Block style={styles.menuBox}>
                        <Button style={[styles.menuItem,{ borderBottomEndRadius: 0, borderBottomLeftRadius:0 }]}>
                            <Text color={theme.colors.gray}>{user}</Text>
                        </Button>
                        <Button style={[styles.menuItem,{ borderRadius:0}]}>
                            <Text color={theme.colors.gray}>{user}</Text>
                        </Button>
                        <Button style={[styles.menuItem,{ borderRadius:0}]}>
                            <Text color={theme.colors.gray}>{user}</Text>
                        </Button>
                        <Button style={styles.menuItemDel}>
                            <Text color={theme.colors.red}>Delete</Text>
                        </Button>
                    </Block>
                </TouchableOpacity>
            </Modal>


        </Block>
    )
}


export const EventPost = ({user, photoUrl, title,description, id, active=false, avatar}) => {
    const [modalVisible, setModalVisible] = useState(false);

    return(
        <Block style={{ justifyContent: 'flex-start'}}>
             <Block row center space="between" padding={[5, theme.sizes.base]} style={{  maxHeight: 30, marginVertical: 10 }}>
                <Image 
                    style={styles.profile}
                    source={{uri: avatar}}
                />
                <Text header bold style={styles.username}>{user}'s Event {title}</Text> 
                <TouchableOpacity  onPress={() => setModalVisible(true)} style={{ paddingHorizontal: 10}}>
                    <FontAwesome5 name='ellipsis-v' size={14} color={theme.colors.black} />
                </TouchableOpacity>
            </Block>
                <Image 
                    source={{uri: photoUrl}}
                    style={styles.eventMedia} 
                    resizeMode="contain"/>
                    
               
            <Block style={styles.icons, { margin: 5, maxHeight: 30}} row space="between" >
                <TouchableOpacity style={{ flex:1, marginHorizontal: 3 }} >
                    <Ionicons name="md-heart-empty" size={24} color={theme.colors.gray} style={{ flex:1, marginHorizontal: 3 }}/>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex:1, marginHorizontal: 3 }} >
                    <Ionicons name="md-chatboxes" size={24} color={theme.colors.gray} style={{ flex:1, marginHorizontal: 3 }}/>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex:1, marginHorizontal: 3 }} >
                    <Ionicons name="md-send" size={24} color={theme.colors.gray} style={{ flex:9, marginHorizontal: 3 }}/>
                </TouchableOpacity>
                <Block style={{ flex: 8 }}></Block>
                <TouchableOpacity style={{ flex:1 }} >
                    <Ionicons name="md-bookmark" size={24} color={theme.colors.gray} style={{ flex:1 }}/>
                </TouchableOpacity>
            </Block>
            <Text style={styles.desc} caption  color={theme.colors.black}>{description}</Text>


            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                presentationStyle="overFullScreen"

            >
                <TouchableOpacity style={styles.modalMenu} onPress={() => setModalVisible(false)}>
                    <Block style={styles.menuBox}>
                        <Button style={[styles.menuItem,{ borderBottomEndRadius: 0, borderBottomLeftRadius:0 }]}>
                            <Text color={theme.colors.gray}>{user}</Text>
                        </Button>
                        <Button style={[styles.menuItem,{ borderRadius:0}]}>
                            <Text color={theme.colors.gray}>{user}</Text>
                        </Button>
                        <Button style={[styles.menuItem,{ borderRadius:0}]}>
                            <Text color={theme.colors.gray}>{user}</Text>
                        </Button>
                        <Button style={styles.menuItemDel}>
                            <Text color={theme.colors.red}>Delete</Text>
                        </Button>
                    </Block>
                </TouchableOpacity>
            </Modal>


        </Block>
    )
}



var width = Dimensions.get("window").width;
const styles = StyleSheet.create({
    profile: {
        height: 40,
        width: 40,
        borderRadius: 20
    },
    username:{
        flex: 1,
        marginHorizontal: 5
    },
    media:{
        flexWrap: 'wrap',
        height: undefined,
        minWidth: width,
        aspectRatio: 1,
        maxHeight:274,
        resizeMode:'contain',
    },
    eventMedia:{
        width: '100%',
        height: '100%',
        // aspectRatio: 1,
        maxHeight: 330,
    },
    desc:{
        marginStart: 20,
        marginEnd: 20
    },
    modalMenu: {
        flex:1,
        alignItems: 'center',
        justifyContent:'center',
        width: '100%',
        height:'100%',
        backgroundColor:'rgba(255,255,255, .8)' ,
    },
    menuBox:{
        width:274,
        alignSelf: 'center',
        marginVertical: '70%',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,
        elevation: 13,    

    },
    menuItem:{
        width: '100%',
        alignItems: 'center',
        marginVertical: 0,
        justifyContent: 'center'
    },
    menuItemDel:{
        width: '100%',
        alignItems: 'center',
        marginVertical: 0,
        justifyContent: 'center',
        borderTopColor: theme.colors.gray3,
        borderTopWidth: .5,
        borderTopEndRadius: 0,
        borderTopLeftRadius: 0
        
    }
})
