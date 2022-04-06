import React, {Component} from'react'
import {  Dimensions, View, StyleSheet } from 'react-native'
import { Text } from '../components'
import { HeaderBackground } from 'react-navigation-stack';
import { theme } from '../constants';
let {width} = Dimensions.get('window') 
let widthTab = width /2;


export const Tabs = ({children})=>{
    return(
        <View 
            style={{
            height: 50,
            width: width,
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexDirection: 'row'
    }}>
        {children}
    </View>
    )    
};

export const Tab = ({ title , active = false}) =>{
    return (
        <View style={[{
            width: widthTab,
            height: 50,
            justifyContent:'center',
            alignItems: 'center',

        },  active ? { borderBottomWidth:2,  borderBottomColor: theme.colors.primary } : {} ]}>
            {title}
        </View>
    )
};
