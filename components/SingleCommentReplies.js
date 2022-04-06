import React, { Component, useState, useEffect } from 'react'
import { View, Modal, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native'
import { Block, Text } from '../components'
import { Feather } from '@expo/vector-icons'
import firebase from '../config/firebaseCon'
import { theme } from '../constants'
import moment from 'moment'

const db = firebase.firestore()

const SingleCommentReplies = (props) => {



    const { postId, user, posts } = props


    return (
        <Block>
          
        </Block>
    )
}



const styles = StyleSheet.create({

})


export default SingleCommentReplies