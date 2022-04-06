import * as actions from '../constants/store/utils/actions'
import firebase from './firebaseCon'
const fb = require('firebase')

const db = firebase.firestore()


class Feed  {
    constructor () {

    }

   
    

   
} 

Feed.shared = new Feed()

export default Feed