import React, { useState, useEffect } from 'react';

import {
    View, Image, TouchableOpacity, StyleSheet
} from 'react-native';
import { Button, TextInput, Dialog, Appbar, Text } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DropDownPicker from 'react-native-dropdown-picker';
import GoogleImage from './GoogleImage';
export default function EditCategory(props) {

    const [expenseName, setExpenseName] = useState(props.currentItem.name);
    const [imgURI, setimgURI] = useState(props.currentItem.img);
    const [screen, setScreen] = useState(1);
    const [loader, setLoader] = useState(false);
    const [save, setSave] = useState(false);
    const [fireBaseURI, setFireBaseURI] = useState(props.currentItem.img);
    const animation = React.useRef(null);
    const [fav, setfav] = useState(false);
    const [categories, setCategories] = useState([]);
    const [currentCategory, setcurrentCategory] = useState({});
    const [open, setOpen] = useState(false);
    useEffect(() => {
        props.currentItem.key.length > 0 && firestore().collection('favs').where('user', '==', auth().currentUser.email).
            where('category', '==', props.currentItem.key).get().then(favData => {
                if (favData.size > 0) {
                    setfav(true);
                    animation.current.play(66, 66)
                } else {
                    setfav(false);
                    animation.current.play(19, 19)
                }
            })

        firestore().collection('categories').orderBy('name','asc').get().then(cats => {
            setCategories(cats.docs.map(doc => {
                return {
                    'value': doc.id,
                    label: doc.data().name
                }
            }))
            setcurrentCategory(props.currentItem.category)
        })
    }, [])

    const styles = StyleSheet.create({
        button:
        {
            marginRight: 13,
        },
        center:
        {

            justifyContent: 'center',
            alignItems: 'center',

        },
        img_add:
        {
            width: 140,
            height: 100, margin: 10
        },
        loader:
        {
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,

        }, heartLottie: {
            width: 50,
            height: 150,
        },
        textNeat: {
            fontSize: 20,
            color: '#6200ee',
            fontWeight: 'bold',
            textAlign: 'center',
            paddingTop: 10,
        },

    });

    const ImgUpload = (item) => {
        setLoader(true);
        setimgURI(item)
        var ref = storage().ref().child(expenseName + ".jpg")
        fetch(item).then
            (res => {
                res.blob().then
                    (blob => {
                        var upload = ref.put(blob)
                        upload.then
                            (x => {
                                upload.snapshot.ref.getDownloadURL().then
                                    (url => {
                                        setFireBaseURI(url)
                                        setScreen(1)
                                        setLoader(false);
                                    })
                            })
                    })
            })
    }
    const SaveContent = () => {
        setSave(true)
        if (expenseName.length > 0) {
            setLoader(true);
            firestore()
                .collection('expenses').doc(props.currentItem.key).update({
                    name: expenseName,
                    img: fireBaseURI,
                    category: currentCategory,                    
                    lcase: expenseName.toLowerCase(),
                }).then(() => {
                    setLoader(false);
                    props.dataFetch();
                    setSave(false);
                    props.close()
                })
        }

    }

    const deleteContent = () => {
        const batch = firestore().batch();
        setLoader(true);
        firestore()
            .collection('expenseDetails').where('expenseId', '==', props.currentItem.key).get().then(data => {
                data.forEach(doc => {
                    batch.delete(doc.ref)
                })
                batch.commit().then(() => {
                    firestore().collection('expenses').doc(props.currentItem.key).delete().then(() => {
                        props.dataFetch();
                        setLoader(false);
                        props.close()
                    })
                })
            })
    }



    const updateFav = () => {
        if (fav) {
            firestore().collection('favs').where('user', '==', auth().currentUser.email).
                where('category', '==', props.currentItem.key).get().then(favData => {
                    favData.forEach(doc => { doc.ref.delete() })
                })
            animation.current.play(0, 19)
            setfav(false);

        }
        else {
            firestore().collection('favs').add({ user: auth().currentUser.email, category: props.currentItem.key })
            animation.current.play(19, 50)
            setfav(true)

        }
    }
    return (

        <View>
            {loader == true && <View style={styles.loader}>
                <LottieView source={require('./spinner.json')} autoPlay loop />
            </View>}
            {
                screen == 1 &&
                <View>
                    <Appbar.Header>
                        <Appbar.Content title="Edit Expense" />

                    </Appbar.Header>
                    <Dialog.Content>
                        <TouchableOpacity disabled={loader} style={styles.center} onPress={() => setScreen(2)}>
                            <Image
                                style={styles.img_add}
                                source={{ uri: imgURI }}
                            />
                        </TouchableOpacity>
                        <TextInput disabled={loader}
                            label="Expense Name"
                            value={expenseName}
                            error={save && expenseName.length <= 0}
                            placeholder="Enter Expense Name"
                            mode='outlined'
                            onChangeText={text => setExpenseName(text)}
                        />
                        <DropDownPicker
                        style={{ marginTop: 10,zIndex:0 }}
                        placeholder='Select Category'
                            open={open}
                            listMode='SCROLLVIEW'
                            value={currentCategory}
                            items={categories}
                            setOpen={setOpen}
                            setValue={setcurrentCategory}
                        />
                        <TouchableOpacity
                            onPress={() => {
                                updateFav()
                            }}
                            style={[styles.center]}>
                        
                            <LottieView
                                ref={animation}
                                style={styles.heartLottie}
                                source={require("./heart.json")}
                                autoPlay={false}
                                loop={false}
                            />
                        </TouchableOpacity>
                    </Dialog.Content>
                    <View style={styles.center}>
                        <Dialog.Actions>
                            <Button style={styles.button} mode="contained" disabled={loader} onPress={() => props.close()}>Cancel</Button>
                            <Button style={styles.button} mode="contained" disabled={loader} onPress={() => deleteContent()}>Delete</Button>
                            <Button style={styles.button} mode="contained" disabled={loader} onPress={() => SaveContent()}>Save</Button>
                        </Dialog.Actions>
                    </View>

                </View>
            }
            {
                screen == 2 &&
                <GoogleImage back={() => setScreen(1)} expenseName={expenseName} ImgUpload={(item) => ImgUpload(item)} />
           
            }

        </View>
    )
}
