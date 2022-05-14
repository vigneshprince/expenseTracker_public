import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet, Dimensions,
    SafeAreaView, ScrollView,
    RefreshControl, Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DatePicker from 'react-native-modern-datepicker';
import { FAB, Button, List } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import _, { sumBy } from 'lodash';
import moment from 'moment';
import Modal from './Modal';

const Status = ({ route, navigation }) => {
    const [currentmonth, setCurrentmonth] = useState(new Date(route.params.month));
    const [datePicker1, setDatePicker1] = useState(false);
    const [monthExpense, setMonthExpense] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [groupedData, setgroupedData] = useState([]);
    const [expenselist, setexpenselist] = useState([]);
    const [categorylist, setcategorylist] = useState([]);
    const [loader, setLoader] = useState(false);
    useEffect(() => {
        setCurrentmonth(route.params.month)
    }, [route.params.month]);

    useEffect(() => {
        dataFetch();
    }, [currentmonth]);
    const dataFetch = () => {
        setRefreshing(true)

        const all = Promise.all([
            firestore().collection('expenseDetails').where('addedDate', '>=', moment(currentmonth).startOf('month').toDate()).where('addedDate', '<=', moment(currentmonth).endOf('month').toDate()).get(),
            firestore().collection('expenses').get(),
            firestore().collection('categories').get()
        ])

        //details to json
        let finalData = [];
        all.then(([expenseDetails, expenses, categories]) => {
            let expenses_list = expenses.docs.map(doc => {
                return { ...doc.data(), id: doc.id }
            })
            let categories_list = categories.docs.map(doc => {
                return { ...doc.data(), id: doc.id }
            })
            setexpenselist(expenses_list);
            setcategorylist(categories_list);
            // console.log(categories_list);
            if (expenseDetails.size > 0) {
                expenseDetails.forEach(details => {
                    let current_expense = expenses_list.find(expense => expense.id === details.data().expenseId)
                    let current_category = categories_list.find(category => category.id === current_expense.category)
                    finalData.push({
                        ...details.data(),
                        'key': details.id,
                        'category': current_category.name,
                        'expense': current_expense.name,
                        'img': current_expense.img,
                    })
                })
                setMonthExpense(finalData)
            }
            else {
                setMonthExpense([])
                setgroupedData([])
                setRefreshing(false)
            }
        })





    }

    useEffect(() => {
        if (monthExpense.length > 0) {
            let temp = _(monthExpense).groupBy('category').map((value, key) => (
                { 'category': key, 'amount': _.sumBy(value, 'amount'), open: false, expense: _.orderBy(monthExpense.filter(exp => exp.category == key), ['amount'], ['desc']) }
            )
            ).value();

            setgroupedData(_.orderBy(temp, ['amount'], ['desc']));
            setRefreshing(false);

        }
    }, [monthExpense]);

    const { width, height } = Dimensions.get("window");
    const styles = StyleSheet.create({
        calender:
        {
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            padding: 20
        },
        img_search:
        {
            width: 75,
            height: 50,

        }, refreshButton: {
            marginTop: 10,
            backgroundColor: '#ba4089',
        },
        calenderButton: {
            backgroundColor: '#ba4089',
            marginBottom: 20
        },
        container: {
            flex: 1,
            backgroundColor: '#ffb3f5',
        },
        shadow: {
            shadowColor: "#000",
            shadowOffset: {
                width: 2,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 3,
        },
        listview: {

            marginTop: 10,
            marginBottom: 5,
            marginLeft: 5,
            marginRight: 5

        },
        listitem: {
            backgroundColor: '#7a68fd',
            marginLeft: 20,
            marginRight: 10,
            marginTop: 5,
            borderRadius: 10,
            borderColor: '#ba4089',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 10,
        },
        total: {
            backgroundColor: '#7a68fd',
            borderRadius: 10,
            margin: 10
            /* justifyContent: 'center',
            alignItems: 'center',
            padding: 5,
            margin: 10,
            flexWrap: 'wrap',
            flex: 1, */
        },
        expHead:
        {
            backgroundColor: '#3a0283',
            borderTopEndRadius: 10,
            borderTopLeftRadius: 10,
            marginBottom: 5,
            padding: 5,
            alignItems: 'center',
        },
        expItems:
        {
            margin: 5,
            padding: 5,
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
    });

    const expandChange = (index) => {
        groupedData[index].open = !groupedData[index].open;
        setgroupedData([...groupedData]);
    }
    return (
        <SafeAreaView style={styles.container}>
            {loader == true && groupedData.length == 0 && <View style={styles.loader}>
                <LottieView source={require('./spinner.json')} autoPlay loop />
            </View>}
            <ScrollView refreshControl={
                <RefreshControl
                    onRefresh={() => dataFetch()}
                    refreshing={refreshing}
                />
            }>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ margin: 10 }}>
                        <Button style={styles.calenderButton} mode="contained" onPress={() => setDatePicker1(!datePicker1)}>{moment(currentmonth).format('MMM-YYYY')}</Button>
                    </View>
                    <View style={{ margin: 10 }}>
                        <Button style={styles.calenderButton} mode="contained" onPress={() => navigation.navigate('StatusStack', { screen: 'Consolidated', params: { 'expenselist': expenselist, 'categorylist': categorylist } })}

                        >All</Button>
                    </View>
                    <View style={styles.total}>
                        <View style={styles.expHead}>
                            <Text style={{ paddingHorizontal: 5, fontSize: 15, color: 'white', fontWeight: '500' }}>Expense</Text>
                        </View>
                        <View style={styles.expItems}>
                            <Text style={{ fontSize: 15, color: 'white', fontWeight: '500' }}>Rs.{_.sumBy(_.filter(monthExpense, x => x.category != 'Investment'), 'amount')}</Text>
                        </View>
                    </View>
                </View>
                <Modal

                    visible={datePicker1}
                    onRequestClose={() => setDatePicker1(false)}
                    dismiss={() => setDatePicker1(false)}
                    animationType={'fade'}
                    transparent={true}>

                    <View style={{ justifyContent: "center", alignItems: "center" }}>
                        <DatePicker

                            options={{
                                backgroundColor: '#a13ffd',
                                textHeaderColor: '#fdf25ed9',
                                textDefaultColor: '#F6E7C1',
                                selectedTextColor: '#fff',
                                mainColor: '#F4722B',
                                textSecondaryColor: '#D6C7A1',
                                borderColor: 'rgba(122, 146, 165, 0.1)',
                                textFontSize: 18,
                                textHeaderFontSize: 20,
                            }}
                            mode="monthYear"
                            selectorStartingYear={moment().year()}
                            onMonthYearChange={(selectedDate) => { setCurrentmonth(moment(selectedDate, 'YYYY MM').toDate()); setDatePicker1(false) }}
                        />
                    </View>

                </Modal>

                {groupedData.map((expense, index) => {
                    return (

                        <List.Accordion
                            style={[styles.listview, { backgroundColor: expense.category != 'Investment' ? '#ba4089' : '#007539' }]}
                            title={<Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>{expense.category}</Text>}
                            right={() => <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>Rs. {expense.amount}</Text>}
                            expanded={expense.open}
                            key={expense.category}
                            onPress={() => { expandChange(index) }}>
                            {expense.expense.map(exp => {
                                return (
                                    <View key={exp.key} style={styles.listitem}>
                                        <Image
                                            style={styles.img_search}
                                            source={{ uri: exp.img }}
                                        />
                                        <View style={{ flexDirection: 'column' }}>
                                            <Text style={{ fontSize: 17, fontWeight: 'bold', color: 'white' }}>{exp.expense}</Text>
                                            <Text style={{ fontSize: 15, fontWeight: 'bold', fontStyle: "italic", color: 'white' }}>{exp.notes}</Text>
                                        </View>
                                        <Text style={{ alignItems: 'center', fontSize: 15, fontWeight: 'bold', color: 'white' }}>Rs. {exp.amount}</Text>
                                    </View>

                                )
                            })
                            }

                        </List.Accordion>
                    )
                })}

                {
                    groupedData.length == 0 && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>No Expenses Found</Text>
                        <Button style={styles.refreshButton} mode="contained" onPress={() => dataFetch()}>Refresh</Button>

                    </View>
                }




            </ScrollView>
        </SafeAreaView>
    )
}

export default Status;