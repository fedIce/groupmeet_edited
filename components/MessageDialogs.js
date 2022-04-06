import React, { Component } from 'react'
import { Block, Text } from '../components'
import { View, StyleSheet, Image } from 'react-native'
import { theme } from '../constants'
import { Feather } from '@expo/vector-icons'


const renderStatus = (status, alignment ) =>{

    if(alignment == 'left'){
        alignment = 'flex-start'
    } else if(alignment == 'right'){
        alignment = 'flex-end'
    }

    switch(status){
        case 'loading':
            return <View style={[styles.messageStatus,{ alignItems: alignment }]}>
                    <Text bold caption color={theme.colors.gray}>
                        sending... <Feather name="rotate-ccw" size={10} color={theme.colors.gray} />
                    </Text>
                </View>
        case 'sent':
            return <View style={styles.messageStatus}>
                    <Text bold caption color={theme.colors.gray}>
                        Sent <Feather name="check" size={10} color={theme.colors.green} />
                    </Text>
                </View>
        case 'seen':
            return <View style={styles.messageStatus}>
                    {/* <Text bold caption color={theme.colors.gray}>
                        Sent <Feather name="check-circle" size={10} color={theme.colors.green} />
                    </Text> */}
                </View>
        case 'failed':
            return <View style={styles.messageStatus}>
                    <Text bold caption color={theme.colors.red}>
                        Failed <Feather name="alert-circle" size={10} color={theme.colors.red} />
                    </Text>
                </View>
    }
}


export const SendMessageDialog = ({message, status = 'loading'}) =>{
    return (
        <View style={[styles.container,{ alignItems: 'flex-end'}]}>
            <View style={styles.sendMessage}>
                <Text style={styles.messageTextSend}>
                 {message}
                </Text>
                {renderStatus(status, 'right' )}
            </View>
        </View>
    )
}

export const RecieveMessageDialog = ({message, status = 'seen'}) =>{
    return (
        <View style={[styles.container,{ alignItems: 'flex-start'}]}>
            <View style={styles.recieveMessage}>
                <Text style={styles.messageTextRecieve}>
                    {message}
                </Text>
                {renderStatus(status, 'left')}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        width: "100%",
        paddingVertical: 10
        
    },
    sendMessage:{
        justifyContent: "center" 
    },
    messageTextSend:{
        padding: 10,
        paddingVertical: 20,
        marginHorizontal: 10,
        marginVertical: 5,
        color: theme.colors.white,
        maxWidth: '80%',
        height: undefined,
        backgroundColor: theme.colors.primary,
        padding: 20,
        borderRadius: 24,
        borderTopRightRadius: 0,
        fontSize: 13,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,
        elevation: 13,   
    },
    messageTextRecieve:{
        padding: 10,
        paddingVertical: 20,
        marginHorizontal: 10,
        marginVertical: 5,
        color: theme.colors.white,
        maxWidth: '80%',
        height: undefined,
        backgroundColor: theme.colors.secondary,
        padding: 20,
        borderRadius: 24,
        borderTopLeftRadius: 0,
        fontSize: 13,
        
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,
        elevation: 13,   
    },
    messageStatus:{
        justifyContent: 'center',
        paddingHorizontal: 20
    }
})