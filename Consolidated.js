import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet, Dimensions,
    SafeAreaView, ScrollView,
    RefreshControl, Image,TouchableOpacity
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DatePicker from 'react-native-modern-datepicker';
import { FAB, Button, List } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import _, { sumBy } from 'lodash';
import moment from 'moment';
import Modal from './Modal';
const Consolidated = ({ navigation, route }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [groupedData, setgroupedData] = useState([]);
    const [loader, setLoader] = useState(false);
    useEffect(() => {
        console.log(moment('Mar-2022').format('MMM-YYYY'));
        setLoader(true);
        firestore().collection('expenseDetails').get().then(details => {
            const expenseData = details.docs.map(doc => {
                let current_expense = route.params.expenselist.find(expense => expense.id === doc.data().expenseId)
                let current_category = route.params.categorylist.find(category => category.id === current_expense.category)
                return {
                    month: moment(doc.data().addedDate.toDate()).format('MMM-YYYY'),
                    amount: doc.data().amount,
                    category: current_category.name,
                }
            })
            let investment_summary = _(expenseData.filter(x => x.category == 'Investment')).groupBy('month').map((value, key) => ({ month: key, invest_amount: sumBy(value, 'amount') })).value()
            let non_invest_summary = _(expenseData.filter(x => x.category != 'Investment')).groupBy('month').map((value, key) => ({ordercheck:moment('01-'+key,'DD-MMM-YYYY').toDate(), month: key, exp_amount: sumBy(value, 'amount') })).value()
            console.log(_.merge(investment_summary, non_invest_summary));
            setgroupedData(_.orderBy(_.merge(investment_summary, non_invest_summary),['ordercheck'],'desc') )
            //setMonthExpense(expenseData);
            setLoader(false);
        })
    }, [])

    const { width, height } = Dimensions.get("window");
    const styles = StyleSheet.create({
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
        container: {
            flex: 1,
            backgroundColor: '#ffb3f5',
        },
        expHead:
        {
            flex: 1,
            backgroundColor: '#3a0283',
            borderTopEndRadius: 10,
            borderTopLeftRadius: 10,
            marginBottom: 5,
            alignItems: 'center',
            padding: 10,
        },
        expLine:
        {
            flex: 1,
            backgroundColor: '#7a68fd',
            borderRadius: 10,
            margin: 10,
            paddingBottom: 10,

        },
        line:
        {
            flexDirection: 'row'
        }

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

                {groupedData.map((expense, index) => {
                    return (
                        <List.Section >
                            <List.Subheader style={{ backgroundColor: '#9e2f23', color: 'white' }}>{expense.month}</List.Subheader>
                            <View style={styles.line}>

                                <TouchableOpacity onPress={() => navigation.navigate('StatusStack', {screen:'Status' ,params: { 'month': moment('01-'+expense.month).format('DD-MMM-YYYY')} })} style={styles.expLine}>
                                    <View style={styles.expHead}>
                                        <Text style={{ color: 'white', fontSize: 15 }}>Expense</Text>
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{color: 'white', fontSize: 20 }}>Rs. {expense.exp_amount}</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate('StatusStack', {screen:'Status' ,params: { 'month': moment('01-'+expense.month).format('DD-MMM-YYYY')} })} style={styles.expLine}>
                                    <View style={styles.expHead}>
                                        <Text style={{ color: 'white', fontSize: 15 }}>Investment</Text>
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: 'white', fontSize: 20 }}>Rs. {expense.invest_amount}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </List.Section>
                    )
                })}



            </ScrollView>
        </SafeAreaView >
    )
}

export default Consolidated;