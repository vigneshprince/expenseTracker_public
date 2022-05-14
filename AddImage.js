import React, { useEffect, useState } from 'react';

import {
    View, Image, TouchableOpacity, StyleSheet
} from 'react-native';
import { TextInput, Appbar, Dialog } from 'react-native-paper';
import axios from 'axios';
const AddImage = (props) => {
    const [images, setImages] = useState([]);
    useEffect(() => {
        /* axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                cx: '53744aca8bb8fa0f2',
                q: 'your name',
                searchType: "image",
                key: 'AIzaSyD29681Eydl-ArbQnqx1Xs9q0x_20etyeQ'
            }
        }).then(
            
                res => {setImages(res.data.items.map(x => x.link))
                

            }) */
        setImages(["https://cdn-japantimes.com/wp-content/uploads/2016/08/p11-schilling-your-a-20160901.jpg", "https://cdn.vox-cdn.com/thumbor/T-VABqDoNb2d1NgEcKQgvFMvTI0=/0x0:2067x1377/1400x1050/filters:focal(869x524:1199x854):format(jpeg)/cdn.vox-cdn.com/uploads/chorus_image/image/54120133/your_name_oped.0.jpg", "https://cdn.theatlantic.com/thumbor/wwN1-QWO5L7VGpSouvrSMBw1y3I=/79x44:1843x1036/1600x900/media/img/mt/2017/04/your_name-1/original.jpg", "https://i.guim.co.uk/img/media/d0758d24ecaec225371aa336eefd9c549cd2d5ce/0_173_2500_1500/master/2500.jpg?width=465&quality=45&auto=format&fit=max&dpr=2&s=14b3da084d27deeb3c3f35701388c1ee", "https://upload.wikimedia.org/wikipedia/en/0/0b/Your_Name_poster.png", "https://s3.amazonaws.com/media.thecrimson.com/photos/2018/02/12/230029_1327878.jpg", "https://m.media-amazon.com/images/M/MV5BMjM5MDA3NzczMl5BMl5BanBnXkFtZTgwNTY1NjYxMTI@._V1_QL75_UX500_CR0,0,500,281_.jpg", "https://www.funimationfilms.com/wp-content/uploads/2016/11/YourName-heading.jpg", "https://static01.nyt.com/images/2017/04/07/arts/07yourname1/07yourname1-jumbo.jpg", "https://www.denofgeek.com/wp-content/uploads/2017/03/your-name-trailer.png?fit=1920%2C1200"])
    }, []);
    const styles = StyleSheet.create({
        gridView: {
            marginTop: 10,
            flex: 1,
        },
        itemContainer: {
            justifyContent: 'flex-end',
            borderRadius: 5,
            padding: 10,
            height: 10,
            backgroundColor: '#2980b9',
        },
        itemName: {
            fontSize: 16,
            color: '#fff',
            fontWeight: '600',
        },
        itemCode: {
            fontWeight: '600',
            fontSize: 12,
            color: '#fff',
        }, img_add:
        {
            width: 130,
            height: 100
        }
    });
    const firstscreen = (uri) => {
        props.setimgURL(uri);
        props.setScreen(1)
        var ref = storage().ref().child("image.jpg")
        fetch(uri).then(res=>res.blob().then(blob=>ref.put(blob)))
    }
    return (
        <View style={{ height: '100%' }}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => props.setScreen(1)} />
                <Appbar.Content title="Add Image" />
            </Appbar.Header>
            {/*  */}
            <Dialog.ScrollArea>
                <FlatGrid
                    itemDimension={100}
                    data={images}
                    style={styles.gridView}
                    // staticDimension={300}
                    // fixed
                    spacing={5}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.center} onPress={() => firstscreen(item)}>
                            <Image
                                style={styles.img_add}
                                source={{ uri: item }}
                            />
                        </TouchableOpacity>
                    )}
                />
            </Dialog.ScrollArea>
        </View>
    )
}

export default AddImage;