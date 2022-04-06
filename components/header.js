import React from 'react'
import { StyleSheet, TouchableOpacity, SafeAreaView, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {theme} from '../constants'
import  {Button, Block, Text, Input} from './'



export const CustomHeader = ({left=null, right=null, navL=null, navR=null, noNav = false, color=null } ) => {
    return (
        <SafeAreaView >
            <Block style={[styles.header,{ backgroundColor: color != null? color : null,  borderBottomWidth: color != null? 0 : 1}]}>
                {
                    left != null? 
                    <Block>
                       {
                           noNav?
                                <View>
                                    {left}
                                </View>
                           :
                           <TouchableOpacity onPress={() => navL != 'none'? navL.goBack(): null} style={{ padding: 20}}>
                           {left}
                       </TouchableOpacity>
                       }
                    </Block>
                    :
                    null
                }
    
               {
                   right != null?
                   <Block style={{ alignItems: 'flex-end' }}>
                        {right}
                    </Block>
                   :
                   null
               }
                
            </Block>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    header:{
        flexDirection:'row',
        justifyContent: 'space-between',
        alignItems:'center',
        paddingTop: 42,
        paddingVertical: 32,
        paddingHorizontal: 12,
       
        borderBottomColor: theme.colors.gray3,
        backgroundColor: theme.colors.white
    },
})