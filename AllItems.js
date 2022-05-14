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
import { SectionGrid } from 'react-native-super-grid';
import { createStackNavigator } from '@react-navigation/stack';
import NewExpense from './NewExpense';
import EditCategory from './EditCategory';
import ExistingCategory from './ExistingCategory';
import firestore from '@react-native-firebase/firestore';
import LottieView from 'lottie-react-native';
import _ from 'lodash';
import auth from '@react-native-firebase/auth';
const AllItems = ({ navigation }) => {
    const Stack = createStackNavigator();
    const [visible, setVisible] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [existingDialog, setExistingDialog] = useState(false);
    const [expenseData, setExpenseData] = useState([]);
    const [expenseDataOriginal, setExpenseDataOriginal] = useState([]);
    const [loader, setLoader] = useState(false);
    const [rawData, setRawData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
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

    const dataFetch = () => {
        setRefreshing(true)
        setLoader(true)
        firestore()
            .collection('expenses')
            .get()
            .then(querySnapshot => {
                var data = [];
                var raw_data = []
                var promises = [];
                querySnapshot.forEach(doc => {

                    let firstLetter = doc.data().name.charAt(0).toUpperCase();
                    let index = data.findIndex(x => x.title === firstLetter)
                    index == -1 ? data.push({ title: firstLetter, data: [{ ...doc.data(), 'key': doc.id }] }) : data[index].data.push({ ...doc.data(), 'key': doc.id })
                    raw_data.push({ ...doc.data(), 'key': doc.id })

                });
                data = _.orderBy(data, ['title'], ['asc'])

                setExpenseData(data);
                setExpenseDataOriginal(data);
                setRawData(raw_data);
                setRefreshing(false)
                setLoader(false);

            });

    }
    useEffect(() => {
        if (searchQuery.length > 0) {
            setExpenseData([{ title: 'Search', data: _.filter(rawData, (item) => item.name.toLowerCase().includes(searchQuery.toLowerCase())) }])
        }
        else {
            //
            setExpenseData(expenseDataOriginal)
        }
    }, [searchQuery])
    const styles = StyleSheet.create({
        refreshButton: {
            marginTop: 10,
            backgroundColor: '#2562cb',
        },
        container: {
            flex: 1,
            backgroundColor: '#86b2fd',
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
            backgroundColor: '#2562cb',
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
        }, searchbar: {
            marginTop: 10,
            borderRadius: 15,
            marginLeft: 5,
            marginRight: 5,
        },


    });

    const onChangeSearch = (text) => {
        setSearchQuery(text);

    }

    return (
        <SafeAreaView style={styles.container}>

            {loader == true && expenseData.length == 0  && <View style={styles.loader}>
                <LottieView source={require('./spinner.json')} autoPlay loop />
            </View>}

            <Searchbar
                placeholder="Search"
                style={styles.searchbar}
                onChangeText={onChangeSearch}
                value={searchQuery}
            />
            {
                expenseData.length > 0 &&
                <SectionGrid
                    refreshControl={
                        <RefreshControl
                            onRefresh={() => dataFetch()}
                            refreshing={refreshing}
                        />
                    }
                    itemDimension={100}
                    sections={expenseData}
                    style={styles.gridView}
                    renderItem={({ item, section, index }) => (
                        <TouchableOpacity onPress={() => { setCurrentItem(item); setExistingDialog(true) }} onLongPress={() => { setCurrentItem(item); setEditDialog(true) }}>
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
                    renderSectionHeader={({ section }) => (
                        <Text style={styles.sectionHeader}>{section.title}</Text>
                    )}
                />
            }
            {
                expenseData.length == 0 && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',zIndex:0  }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>No Expenses Found</Text>
                    <Button style={styles.refreshButton} mode="contained" onPress={() => dataFetch()}>Refresh</Button>

                </View>
            }
            <FAB
                style={styles.fab}
                small
                icon="plus"
                onPress={() => setVisible(true)}
            />
            <Portal>
                <Dialog visible={visible} onDismiss={() => setVisible(false)}>
                    <NewExpense dataFetch={() => dataFetch()} close={() => setVisible(false)} />
                </Dialog>
                <Dialog visible={editDialog} onDismiss={() => setEditDialog(false)}>
                    <EditCategory dataFetch={() => dataFetch()} currentItem={currentItem} close={() => setEditDialog(false)} />
                </Dialog>
                <Dialog visible={existingDialog} onDismiss={() => setExistingDialog(false)}>
                    <ExistingCategory currentItem={currentItem} close={() => setExistingDialog(false)} />
                </Dialog>
            </Portal>
        </SafeAreaView>
    )
}

export default AllItems;