import React, { Component } from "react";
import { StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";

import {Block, Button, Text} from './index'
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { FontAwesome5 } from '@expo/vector-icons'
import { theme } from "../constants";




export const FeedList = ({children}) => {
    return(
        <ScrollView >
           {children}
        </ScrollView>
    )
}

export const Post = ({user, mediaUrl, title,description, id, active=false, avatar}) => {
    return(
        <Block>
            <Block style={{ marginVertical: 10}}>
            <Block>
                <Block row center space="between" padding={[5, theme.sizes.base]}>
                    <Image 
                    style={styles.profile}
                        source={avatar}
                    />
                    <Text header bold style={styles.username}>{user}</Text>
                    <TouchableOpacity style={{ marginStart: 20}}>
                        <FontAwesome5 name='ellipsis-v' size={14} color={theme.colors.gray2} />
                    </TouchableOpacity>
                </Block>
                <Block center middle>
                    <Image 
                    
                        source={mediaUrl}
                        style={styles.media}
                        />
                </Block>
            </Block>
            <Block style={[styles.icons, { margin: 5}]} row space="between" >
                <FontAwesome5 name="heart" size={24} color={theme.colors.gray} style={{ flex:1 }}/>
                <FontAwesome5 name="comment" size={24} color={theme.colors.gray} style={{ flex:1 }}/>
                <FontAwesome5 name="paper-plane" size={24} color={theme.colors.gray} style={{ flex:9 }}/>
                <FontAwesome5 name="bookmark" size={24} color={theme.colors.gray} style={{ flex:1 }}/>
            </Block>
            <Text style={styles.desc} caption  color={theme.colors.black}>{description}</Text>
            </Block>
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
        resizeMode:'contain'
    },
    desc:{
        paddingHorizontal: 3
    }
})
