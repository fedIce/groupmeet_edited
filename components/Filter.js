import React, { Component } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import {Block, Button, Text} from './index'
import { theme } from "../constants";
import { color } from "react-native-reanimated";
import { ScrollView } from "react-native-gesture-handler";


export const Filter = ({children}) => {
    return(
        <View row style={{marginVertical: 2, backgroundColor: 'rgba(0,0,0, 0)' }}>
            <ScrollView style={{ backgroundColor: 'rgba(0,0,0, 0)' }} horizontal height={25} showsHorizontalScrollIndicator={false}>
                  {children}
            </ScrollView>
        </View>
    )
}

export const FilterOptions = ({option, id, active=false }) => {
    return(
        <View  id={id} active={active} style={ !active? styles.option: styles.activeOption }>
            <Text style={ !active? { color: theme.colors.optionText, fontSize: 11 }: { fontSize: 11, color: theme.colors.activeOptionText }}>{option}</Text>
        </View>
    )
}

export const styles = StyleSheet.create({
  divider: {
    height: 0,
    margin: theme.sizes.base * 2,
    borderBottomColor: theme.colors.gray2,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  option:{
    backgroundColor: theme.colors.option,
    alignContent: 'flex-start',
    justifyContent: 'space-around',
    height:20,
    padding: 10,
    borderRadius: 15,
    margin: 2
  },
  activeOption:{
    backgroundColor: theme.colors.activeOption,
    alignContent: 'flex-start',
    justifyContent: 'space-around',
    height:20,
    padding: 9,
    borderRadius: 15,
    borderWidth:1,
    borderColor: theme.colors.option,
    margin: 2
  }
});
