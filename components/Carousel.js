
import React, { Component } from 'react'
import {StyleSheet} from 'react-native'
import { Block, Text, Button } from '../components'
import {Dimensions, Animated, Image, FlatList} from 'react-native'
import {theme} from '../constants'
import { Ionicons } from '@expo/vector-icons'


const scrollX = new Animated.Value(0)
const {width, height} = Dimensions.get('window')

const getImageHeight = (item) => {
    const {height, width} =   Image.getSize(item.source)
    console.log(width,height)
    return  {height, width}
}

const renderIllustrations = (illustrations, renderFrom="addPost", customStyle = null) => {

    const [ loadingImage, setLoadingImage ] = React.useState(true)

        return (
            <FlatList
                horizontal
                pagingEnabled
                scrollEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                snapToAlignment="center"
                data={illustrations}
                keyExtractor={(item, index) => `${item.id}` }
                renderItem={({item, index}) => (
                    <Block>
                        {
                           renderFrom == 'addPost'?
                           <Block >
                                <Image 
                                    key={index}
                                    onLoadStart={() => setLoadingImage(true)}
                                    onLoadEnd={() => setLoadingImage(false)}
                                    progressiveRenderingEnabled={true}
                                    loadingIndicatorSource={require('../assets/images/chatLoader.gif')}
                                    resizeMethod={"scale"}
                                    source={{ uri: item.source }}
                                    resizeMode="contain"
                                    style={customStyle == null?{ width, height: 366, overflow: 'visible' }: customStyle} />
                                <Button  opacity={true} style={styles.delImage}><Ionicons name="md-trash" size={24} color={theme.colors.gray}/></Button>
                            </Block>
                            :
                            null

                        }

                        {
                            renderFrom == 'singlePost'?
                                <Block>
                                    <Image 
                                        key={index}
                                        onLoadStart={() => setLoadingImage(true)}
                                        onLoadEnd={() => setLoadingImage(false)}
                                        progressiveRenderingEnabled={true}
                                        loadingIndicatorSource={require('../assets/images/chatLoader.gif')}
                                        resizeMethod={"scale"}
                                        source={{ uri: item }}
                                        resizeMode="contain"
                                        style={customStyle == null?{ width, height: 366, overflow: 'visible' }: customStyle} />
                                    {/* <Button  opacity={true} style={styles.delImage}><Ionicons name="md-trash" size={24} color={theme.colors.gray}/></Button> */}
                                </Block>
                            :
                            null
                        }   
                    </Block>
                )}
                onScroll = {
                    Animated.event([
                        { 
                            nativeEvent: { contentOffset: { x: scrollX } }
                        }
                    ])
                }
            />
        )
}
    
const renderSteps = (illustrations) => {
    const stepPosition = Animated.divide(scrollX, width)
        return (
            <Block row center middle style={styles.stepsContainer}>
                { illustrations.map((item, index)=>{
                    const opacity = stepPosition.interpolate({
                        inputRange: [index - 1,  index, index + 1],
                        outputRange: [0.4, 1,0.4],
                        extrapolate: 'clamp',
                    })
                    return(
                        illustrations.length > 1?<Block animated flex={false} key={`step-${index}`} color="gray" style={[styles.step, { opacity } ]}/> : null
                    )
                })}
            </Block>
        )
}

export const Carousel = ( { illustrations } ) => {
   return ( <Block center middle>
        {renderIllustrations(illustrations)}
        {renderSteps(illustrations)}
    </Block>)
} 

export const CarouselFromUrl = ( { illustrations, customStyle = null } ) => {
    return ( <Block center middle>
         {renderIllustrations(illustrations, 'singlePost', customStyle)}
         {renderSteps(illustrations)}
     </Block>)
 } 

const styles = StyleSheet.create({
    stepsContainer: {
        position: 'absolute',
        bottom: theme.sizes.base * 3,
        right: 0,
        left: 0
    },
    step: {
        width: 5,
        height: 5,
        borderRadius: 5,
        marginHorizontal: 2.5
    },
    delImage:{
        position:'absolute',
        right: 0,
        padding: 30,
        backgroundColor: theme.colors.transparent
    }
    })
