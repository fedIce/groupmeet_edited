import React, { Component } from "react";
import { StyleSheet, TouchableOpacity, Image, Dimensions, ImageBackground } from "react-native";


import {Block, Button, Text} from './index';
import { theme } from "../constants";

const {width, height} = Dimensions.get('window')

export const MenuCard = ({title, url, prop, des }) => {
    return(
        <Block >
            <TouchableOpacity onPress={() => prop.navigation.navigate(des,{
                prop
            })} style={styles.contain}>
                <Image blurRadius={3} style={styles.image} source={{ uri: url }}/>
                <Text h1 style={styles.title}>{title}</Text>
            </TouchableOpacity>
        </Block>
    )
}

const styles = StyleSheet.create({
    image:{
        flex: 1,        
    },
    contain:{
        flex: 1,
        borderRadius: 14,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0, 0)',
        alignItems: 'center',
        width: width - 40,
        marginVertical: 20,
        marginHorizontal: 20,
        height: 274,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,
        elevation: 13,    
    },
    image:{
        flex:1,
        width: '100%',
        borderRadius: 14
    },
    title:{
        position: 'absolute',
        color: theme.colors.white,
        fontWeight: 'bold'
    }
})