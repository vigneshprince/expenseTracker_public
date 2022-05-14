import React, { useState,useEffect } from 'react';

import {
    View, Image, TouchableOpacity, StyleSheet, RefreshControl, Dimensions
} from 'react-native';
import {Dialog, Appbar } from 'react-native-paper';
import axios from 'axios';
import { FlatGrid } from 'react-native-super-grid';
const GoogleImage = (props) => {


    const [gpage, setgpage] = useState(1);
    const [imgRefresh, setimgRefresh] = useState(false);
    const [images, setImages] = useState([]);

    const styles = StyleSheet.create({

        center:
        {

            justifyContent: 'center',
            alignItems: 'center',

        }, gridView: {
            marginTop: 20,
        },

        img_search:
        {
            width: 130,
            height: 100
        },


    });

    useEffect(() => {
        getImgs();
    }, [gpage]);


    const getImgs = () => {
        setimgRefresh(true);
        axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                cx: '53744aca8bb8fa0f2',
                q: props.expenseName.length > 0 ? props.expenseName : 'No Image',
                searchType: "image",
                key: 'AIzaSyD29681Eydl-ArbQnqx1Xs9q0x_20etyeQ',
                start: gpage
            }
        }).then(

            res => {
                setImages([...images, ...res.data.items.map(x => x.link)])
                setimgRefresh(false);
            })

    }

    return (

        
        <View style={{height: Dimensions.get('window').height-200}}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => props.back()} />
                <Appbar.Content title="Add Image" />
            </Appbar.Header>
                <FlatGrid
                    itemDimension={100}
                    data={images}
                    style={styles.gridView}
                    spacing={20}
                    onEndReached={() => {console.log('hit') ;setgpage(gpage + 10) }}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            onRefresh={() => { setgpage(1)}}
                            refreshing={imgRefresh}
                        />
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.center} onPress={() => props.ImgUpload(item)}>
                            <Image
                                style={styles.img_search}
                                source={{ uri: item }}
                            />
                        </TouchableOpacity>
                    )}
                />
        </View>

    )
}

export default GoogleImage;