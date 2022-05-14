import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView, ScrollView,
    Alert, Image, TouchableOpacity, RefreshControl
} from 'react-native';

import { FAB, Button, TextInput, Dialog, Portal, Appbar, Searchbar } from 'react-native-paper';
import ExistingCategory from './ExistingCategory';
import firestore from '@react-native-firebase/firestore';
import LottieView from 'lottie-react-native';
import _ from 'lodash';
import auth from '@react-native-firebase/auth';
import { FlatGrid } from 'react-native-super-grid';
const Favourites = ({ navigation }) => {
    const [existingDialog, setExistingDialog] = useState(false);
    const [expenseData, setExpenseData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [currentItem, setCurrentItem] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {

        dataFetch();



    }, []);

    /* useEffect(() => {
        if(!visible)
        {
            setCurrentItem(itemStruct);
        }
    }, [visible]); */

    function fetchAsync(data) {
        return new Promise((resolve) => {
            firestore().collection('expenses').where(firestore.FieldPath.documentId(), "in", data).get()
                .then(querySnapshot => {
                    resolve(querySnapshot.docs.map(doc => {
                        return {
                            'key': doc.id,
                            ...doc.data()
                        }

                    }))
                })
        });
    }


    const dataFetch = () => {
        setRefreshing(true)
        setLoader(true)
        firestore().collection('favs').where('user', '==', auth().currentUser.email).get().then(favs => {
            var data = [];
            if (favs.size > 0) {
                favs.forEach(fav => { data.push(fav.data().category); });
                const promises = []
                for (var i = 0; i < data.length; i += 10) {
                    promises.push(fetchAsync(data.slice(i, i + 10)))
                }
                Promise.all(promises).then(values => {
                    setExpenseData(values.flat());
                    setRefreshing(false);
                    setLoader(false);
                })

            }
            else {
                setRefreshing(false);
                setLoader(false);
                setExpenseData([]);
            }

        });

    }

    const styles = StyleSheet.create({
        refreshButton: {
            marginTop: 10,
            backgroundColor: '#219c4e',
        },

        container: {
            flex: 1,
            backgroundColor: '#a7dcf6',
        }, fab: {
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0,
        },
        gridView: {
            marginTop: 20,
            flex: 1,
        },
        center:
        {

            justifyContent: 'center',
            alignItems: 'center',

        },
        itemContainer: {
            borderRadius: 5,
            backgroundColor: '#219c4e',
            height: 150, justifyContent: 'center',
        },
        itemName: {
            fontSize: 18,
            color: '#fff',
            fontWeight: '600',
            textAlign: 'center',
            paddingTop: 10,
        },
        sectionHeader: {
            flex: 1,
            fontSize: 15,
            fontWeight: '600',
            alignItems: 'center',
            backgroundColor: '#636e72',
            color: 'white',
            padding: 10,
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
            zIndex: 1
        },
        img_search:
        {
            width: 100,
            height: 75,

        },
        img_view:
        {
            alignItems: 'center',
            justifyContent: 'center',

        }, heartLottie: {
            width: 50,
            height: 50,
        }


    });


    return (
        <SafeAreaView style={styles.container}>

            {loader == true && expenseData.length == 0 && <View style={styles.loader}>
                <LottieView source={require('./spinner.json')} autoPlay loop />
            </View>}
            {
                expenseData.length > 0 &&
                <FlatGrid
                    scrollEnabled={true}
                    itemDimension={100}
                    data={expenseData}
                    refreshControl={
                        <RefreshControl
                            onRefresh={() => dataFetch()}
                            refreshing={refreshing}
                        />
                    }
                    style={styles.gridView}
                    spacing={5}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.center} onPress={() => { setCurrentItem(item); setExistingDialog(true) }}>
                            <View style={[styles.itemContainer]}>

                                <View style={styles.img_view}>
                                    <Image
                                        style={styles.img_search}
                                        source={{ uri: item.img }}
                                    />
                                </View>
                                <Text style={styles.itemName}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            }
            {
                expenseData.length == 0 && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 0 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>No Favourites Found</Text>
                    <Button style={styles.refreshButton} mode="contained" onPress={() => dataFetch()}>Refresh</Button>

                </View>
            }
            <Portal>
                <Dialog visible={existingDialog} onDismiss={() => setExistingDialog(false)}>
                    <ExistingCategory currentItem={currentItem} close={() => setExistingDialog(false)} />

                </Dialog>
            </Portal>
        </SafeAreaView>
    )
}

export default Favourites;