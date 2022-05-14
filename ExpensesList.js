import React, { useEffect, useState, useRef } from 'react';
import { SwipeListView } from 'react-native-swipe-list-view';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import {
    View,
    Text,
    StyleSheet, Dimensions,
    FlatList,
    SafeAreaView, Animated,
    Alert, Image, Pressable, RefreshControl
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { FAB, Button, TextInput, Dialog, Portal, Appbar, Searchbar } from 'react-native-paper';
import EditExpense from './EditExpense';
import firestore from '@react-native-firebase/firestore';
import LottieView from 'lottie-react-native';
import _ from 'lodash';
import moment from 'moment';
const ExpensesList = ({ navigation }) => {

    const [editDialog, setEditDialog] = useState(false);
    const [expenseData, setExpenseData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [currentItem, setCurrentItem] = useState([]);
    const [rawdata, setrawdata] = useState([]);
    const [startAfter, setstartAfter] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [fetchLength, setFetchLength] = useState(0);
    const [datePicker1, setDatePicker1] = useState(false);
    const [datePicker2, setDatePicker2] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [expenseNames, setexpenseNames] = useState([]);

    useEffect(() => {
        getexpensenames();
    }, [])

    const getexpensenames = () => {
        firestore().collection('expenses').get().then(snapshot => {
            setexpenseNames(snapshot.docs.map(doc => {
                return { ...doc.data(), id: doc.id }
            })
            )


        })
    }

    useEffect(() => {
        if (expenseNames.length > 0) {
            dataFetch();
        }
    }, [expenseNames])

    useEffect(() => {
        console.log('useEffect');
        if (rawdata.length > 0) {
            setExpenseData(createGroup(rawdata));
        }
        else
            setExpenseData([]);
    }, [rawdata]);


    useEffect(() => {
        if (fromDate && toDate) {
            setRefreshing(true);
            firestore().collection('expenseDetails').where('addedDate', '>=', fromDate).where('addedDate', '<=', toDate).orderBy('addedDate', 'desc').get().then(details => {
                if (details.size > 0)
                    processFetchedData(details, [])
                else {
                    setrawdata([]);
                    setRefreshing(false);

                }
            });
        }
    }, [fromDate, toDate]);

    const dataFetch = () => {
        setRefreshing(true)
        setLoader(true);
        firestore().collection('expenseDetails').orderBy('addedDate', 'desc').limit(10).get().then(details => {
            processFetchedData(details, []);
        })

    }


    const styles = StyleSheet.create({
        refreshButton: {
            marginTop: 10,
            backgroundColor: '#4e3b82',
        },
        searchbar: {
            marginTop: 10,
            borderRadius: 15,
            marginLeft: 5,
            marginRight: 5,
        },
        container: {
            flex: 1,
            backgroundColor: '#d5bef4',
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
            flexDirection: 'row',

        },
        rowFront: {
            margin: 5,
            shadowColor: '#999',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 5,
            borderRadius: 5,
            padding: 10,
            marginTop: 10,
            flex: 1,
            flexDirection: 'row',
        },
        title: {
            fontSize: 20,
            color: 'white',
            fontWeight: 'bold',
            marginTop: 10,
            textAlign: 'center',
        },
        notes: {
            fontSize: 15,
            color: 'white',
            textAlign: 'center',
            flexWrap: 'wrap'
        },

        dataview: {
            flexDirection: "column",
            flex: 4
        },
        amountview: {
            flex: 2,
            backgroundColor: '#4e3b82',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
        },
        amount:
        {
            color: 'white',
            fontSize: 17,
            fontWeight: 'bold',
            textAlign: 'center',
        },
        headerview: {
            backgroundColor: '#9e2f23',
            height: 25,
            marginTop: 10,
            paddingLeft: 10,
            borderRadius: 10,
            marginLeft: 5,
            marginRight: 5
        },
        headertext: {
            fontSize: 15,
            color: 'white',
            fontWeight: 'bold',
        },
        rowBack: {
            alignItems: 'center',
            backgroundColor: '#f56177',
            flex: 1,
            margin: 5,
            borderRadius: 5,
            flexDirection: 'row',
            padding: 10,
            marginTop: 10,


        },
        backRightBtn: {
            alignItems: 'center',
            bottom: 0,
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            width: 75,
        },
        backRightBtnRight: {
            backgroundColor: '#f3304d',
            right: 0,
        },
        calenderView: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 10,
            marginLeft: 10,
            marginRight: 10,
            backgroundColor: '#79064f',
            padding: 10,
        }
        ,
        calenderButton: {
            backgroundColor: '#ba4089',
        }

    });

    const onChangeSearch = () => {
        if (searchQuery.length > 0) {
            setRefreshing(true)
            let filtedIds = expenseNames.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => item.id)
            if (filtedIds.length > 0) {
                firestore().collection('expenseDetails').where('expenseId', "in", filtedIds.slice(0, 10)).orderBy('addedDate', 'desc').get().then(details => {
                    let expenseData = []
                    details.forEach(data_ => {
                        expenseData.push({
                            ...data_.data(),
                            addedDate: moment(data_.data().addedDate.toDate()).format('LL'),
                            addedDate_1: data_.data().addedDate.toDate(),
                            ...expenseNames.find(doc => doc.id === data_.data().expenseId),
                            key: data_.id
                        })
                    })
                    setrawdata(expenseData)
                    setRefreshing(false);
                })
            }
            else {
                setrawdata([]);
                setRefreshing(false);
            }
        }
        else {
            dataFetch()
        }
    }
    const renderSectionHeader = ({ section }) => <View style={styles.headerview}><Text style={styles.headertext}>{section.title}</Text></View>;



    const renderHiddenItem = (data, props) => {

        return (
            <View style={styles.rowBack}>
                <View style={[styles.backRightBtn, styles.backRightBtnRight]}>
                    <Icon name="ios-close-circle" size={30} color="white" />
                </View>
            </View>
        );
    }

    const createGroup = (dataToGroup) => {
        let grouped = []
        dataToGroup.forEach(item => {
            let idx = grouped.findIndex(group => group.title === item.addedDate);
            console.log(item.addedDate)
            if (idx === -1)
                grouped.push({
                    title: item.addedDate,
                    data: [item]
                })
            else
                grouped[idx].data.push(item)
        }
        )
        return grouped
    }


    const onSwipeValueChange = swipeData => {
        if (
            swipeData.value < -Dimensions.get('window').width
        ) {
            setrawdata(rawdata.filter(x => x.key !== swipeData.key));
            firestore().collection('expenseDetails').doc(swipeData.key).delete();
        }
    };

    const renderItem = (data) => {
        return (
            <Pressable style={({ pressed }) => [{ backgroundColor: pressed ? '#493778' : '#694fad' }, styles.rowFront]} onPress={() => { setCurrentItem(data.item); setEditDialog(true) }}>
                <View style={styles.img_view}>
                    <Image
                        style={styles.img_search}
                        source={{ uri: data.item.img }}
                    />
                </View>
                <View style={styles.dataview}>
                    <Text style={styles.title}>{data.item.name}</Text>
                    <Text style={styles.notes}>{data.item.notes}</Text>
                </View>
                <View style={styles.amountview}>
                    <Text style={styles.amount}>Rs. {data.item.amount}</Text>
                </View>
            </Pressable>


        );


    }
    const processFetchedData = (details, maindata) => {
        if (details.size > 0) {

            let expenses = [];

            details.forEach(data_ => {

                expenses.push({
                    ...data_.data(),
                    addedDate: moment(data_.data().addedDate.toDate()).format('LL'),
                    addedDate_1: data_.data().addedDate.toDate(),
                    ...expenseNames.find(doc => doc.id === data_.data().expenseId),
                    key: data_.id

                })
            })

            setrawdata([...maindata, ...expenses])
            setstartAfter(details.docs[details.size - 1]);
            setFetchLength(details.size)

            setRefreshing(false);
            setLoader(false);

        }
        else {
            setRefreshing(false);
            setLoader(false);
            setExpenseData([]);
        }
    }
    const loadMore = () => {
        if (fetchLength > 9 && fromDate === null && toDate === null && searchQuery === '') {
            setRefreshing(true)
            firestore().collection('expenseDetails').orderBy('addedDate', 'desc').startAfter(startAfter).limit(10).get().then(details => {
                if (details.size > 0)
                    processFetchedData(details, rawdata)
                else
                    setRefreshing(false);
            });
        }
    }



    const modifyLocal = (data) => {
        let temp = rawdata
        let idx = rawdata.findIndex(x => x.key === currentItem.key)
        temp[idx]['notes'] = data.notes
        temp[idx]['amount'] = data.amount
        temp[idx]['bill'] = data.bill
        temp[idx]['addedDate_1'] = data.addedDate
        temp[idx]['addedDate'] = moment(data.addedDate).format('LL')
        setrawdata([...temp])
    }

    return (
        <SafeAreaView style={styles.container}>
            {loader == true && expenseData.length == 0 && <View style={styles.loader}>
                <LottieView source={require('./spinner.json')} autoPlay loop />
            </View>}
            <View style={{ flex: 1 }}>
                <Searchbar
                    style={styles.searchbar}
                    placeholder="Search"
                    onChangeText={(txt) => setSearchQuery(txt)}
                    value={searchQuery}
                    onSubmitEditing={onChangeSearch}

                />
                <View style={styles.calenderView}>
                    <Button style={styles.calenderButton} mode="contained" onPress={() => setDatePicker1(true)}>{fromDate ? moment(fromDate).format('MMM-D-YYYY') : 'From Date'}</Button>
                    <Button style={styles.calenderButton} mode="contained" onPress={() => setDatePicker2(true)}>{toDate ? moment(toDate).format('MMM-D-YYYY') : 'To Date'}</Button>
                    <Icon onPress={() => { setFromDate(null); setToDate(null); dataFetch() }} name="md-trash-bin" size={35} color="white" />
                </View>

                <DateTimePickerModal
                    isVisible={datePicker1}
                    mode="date"
                    onConfirm={(date) => { setFromDate(date); setDatePicker1(false) }}
                    onCancel={() => setDatePicker1(false)}
                />

                <DateTimePickerModal
                    isVisible={datePicker2}
                    mode="date"
                    onConfirm={(date) => { setToDate(date); setDatePicker2(false) }}
                    onCancel={() => setDatePicker2(false)}
                />
                {
                    expenseData.length > 0 &&
                    <SwipeListView
                        renderSectionHeader={renderSectionHeader}
                        renderHiddenItem={renderHiddenItem}
                        useSectionList
                        sections={expenseData}
                        disableRightSwipe
                        rightOpenValue={-Dimensions.get('window').width}
                        previewRowKey={'0'}
                        previewOpenValue={-40}
                        previewOpenDelay={3000}
                        onSwipeValueChange={onSwipeValueChange}
                        useNativeDriver={false}
                        renderItem={renderItem}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0}
                        refreshControl={
                            <RefreshControl
                                onRefresh={() => getexpensenames()}
                                refreshing={refreshing}
                            />
                        }

                    />
                }
                {
                    expenseData.length == 0 && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',zIndex:0  }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>No Expenses Found</Text>
                        <Button style={styles.refreshButton} mode="contained" onPress={() => getexpensenames()}>Refresh</Button>

                    </View>
                }
                <Portal>
                    <Dialog visible={editDialog} onDismiss={() => setEditDialog(false)}>
                        <EditExpense modifyLocal={(data) => modifyLocal(data)} currentItem={currentItem} close={() => setEditDialog(false)} />

                    </Dialog>
                </Portal>
            </View>
        </SafeAreaView>
    )
}

export default ExpensesList;