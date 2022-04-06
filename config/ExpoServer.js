import React from 'react'
import * as Notifications from 'expo-notifications';

const icon = require('../assets/images/icon.png')


export default sendLocalPushNotificationAsync = async (data, queryString=null, moreData=null) => {

  try {

    console.log("Sending Notification", data)

    const dat = await fetch(`https://exp.host/--/api/v2/push/send?${queryString}`,{
      body: JSON.stringify({
        to: data.token,
        title: data.title,
        subtitle: 'Group Meet',
        body: data.body,
        data: {message: `${data.title} - ${data.body}`, ...moreData },
        sound:'default',
        icon:'../assets/images/icon.png',
        channelId: 'default',
        android:{
          icon: '../assets/images/icon.png',
          sound: "default",
        }
      }),
      headers:{
        'Content-type': 'application/json'
      },
      method: 'POST'
    })

    console.log("NOTIFIED: ", JSON.stringify(dat))
    return dat

  }catch (err) {
    console.log("Notification Error: ", err)
  }

console.log("Sent Notification")


}

export const sendPushNotification = async (expoPushToken) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 2 },
  });
}