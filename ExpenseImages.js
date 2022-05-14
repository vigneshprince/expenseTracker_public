import React, { useState, useEffect } from 'react';

import {
    View, Image, PermissionsAndroid, TouchableHighlight, StyleSheet, Pressable, Linking
} from 'react-native';
import { Button, TextInput, Dialog, Appbar, Text } from 'react-native-paper';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import RNFetchBlob from 'rn-fetch-blob';
export default function ExpenseImages(props) {


    const [imagesList, setImagesList] = useState(props.imagesList);
    const [loader, setLoader] = useState(false);

    useEffect(() => {

    }, [])
    const styles = StyleSheet.create({
        button:
        {
            marginRight: 13,
        },
        iconView:
        {
            flexDirection: 'row',
            justifyContent: 'center',
        },
        center:
        {

            justifyContent: 'center',
            alignItems: 'center',

        },

        body: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            minHeight: 100,
        },
        icons:
        {
            marginTop: 10, marginLeft: 20,

        },
        img_add:
        {
            width: 120,
            height: 100,
            marginTop: 10, marginLeft: 10,

        }, loader:
        {
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,

        }

    });



    const fromGallery = () => {

        ImagePicker.openPicker({
            cropping: true,
            compressImageQuality: 0.8
        }).then(image => {
            processImage(image)

        }).catch(err => {
        })
    }

    const fromCamera = () => {
        ImagePicker.openCamera({
            cropping: true,
            compressImageQuality: 0.8
        }).then(image => {
            processImage(image)

        }).catch(err => {
        })
    }

    const processImage = (image) => {
        setLoader(true);
        var ref = storage().ref(image.path.replace(/^.*[\\\/]/, ''))
        var upload = ref.putFile(image.path)
        upload.then(
            () => {
                upload.snapshot.ref.getDownloadURL().then
                    (url => {

                        setImagesList([...imagesList, url])
                        setLoader(false);
                    })
            }).catch(err => {
                setLoader(false);
            })

    }


    const removeImage = (item) => {
        setImagesList(imagesList.filter(image => image !== item))
        storage().refFromURL(item).delete()
    }

    const DownloadImg = (item) => {
        let dirs = RNFetchBlob.fs.dirs

        PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
                'title': 'Storage Permission',
                'message': 'App needs access to your storage to download the image',
            }
        ).then((granted) => {
            // if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            //     RNFetchBlob
            //         .config({
            //             // response data will be saved to this path if it has access right.
            //             path: dirs.DownloadDir + '/' + item.match(/\/([^\/?#]+)[^\/]*$/)[1]
            //         })
            //         .fetch('GET', item)
            //         .then((res) => {
            //             // the path should be dirs.DocumentDir + 'path-to-file.anything'
            //             
            //         })
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                RNFetchBlob
                    .config({
                        addAndroidDownloads: {
                            useDownloadManager: true,
                            path: dirs.DownloadDir + '/' + item.match(/\/([^\/?#]+)[^\/]*$/)[1],
                            mediaScannable: true,
                            mime: 'image/*',
                            description: 'File downloaded by download manager.',
                            notification: true

                        }
                    })
                    .fetch('GET', item)
            }




        })
    }


    return (

        <View>
            {loader == true && <View style={styles.loader}>
                <LottieView source={require('./spinner.json')} autoPlay loop />
            </View>}
            <Appbar.Header>
                <Appbar.BackAction onPress={() => { props.setImagesList(imagesList); props.back() }} />
                <Appbar.Content title="Expense Images" />

            </Appbar.Header>
            <Dialog.Content>
                <View style={styles.body}>
                    {
                        imagesList.map((item) => {
                            return (
                                <View key={item}>
                                    <TouchableHighlight onPress={() => DownloadImg(item)} underlayColor='white' disabled={!props.download}>
                                        <Image
                                            style={styles.img_add}
                                            source={{ uri: item }}
                                        />
                                    </TouchableHighlight>
                                    <Pressable style={{
                                        position: 'absolute',
                                        right: 5,
                                        top: 15,
                                        backgroundColor: "white"
                                    }}
                                        onPress={() => removeImage(item)}
                                    >
                                        <Icon name="trash-sharp"
                                            size={20}
                                            color="black"
                                        />
                                    </Pressable>
                                </View>
                            )
                        })
                    }
                </View>
                <View style={styles.iconView}>
                    <Icon style={styles.icons} onPress={fromCamera} name="ios-camera-sharp" size={40} color="black" />
                    <Icon style={styles.icons} onPress={fromGallery} name="ios-image" size={40} color="black" />
                </View>

            </Dialog.Content>
            <View style={styles.center}>
                <Dialog.Actions>
                    <Button style={styles.button} mode="contained" disabled={loader} onPress={() => props.close()}>Cancel</Button>
                    <Button style={styles.button} mode="contained" disabled={loader} onPress={() => {props.setImagesList(imagesList); props.back();props.save()}}>Save</Button>
                </Dialog.Actions>
            </View>
        </View>
    )
}
