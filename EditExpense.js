import React, { useState, useEffect } from 'react';

import {
    View, Image, TouchableOpacity, StyleSheet
} from 'react-native';
import { Button, TextInput, Dialog, Appbar, Text } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import LottieView from 'lottie-react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ExpenseImages from './ExpenseImages';
import moment from 'moment';
export default function EditExpense(props) {
    const [expenseAmt, setExpenseAmt] = useState(props.currentItem.amount.toString());
    const [notes, setnotes] = useState(props.currentItem.notes);
    const [imgURI, setimgURI] = useState(props.currentItem.img);
    const [imagesList, setImagesList] = useState(props.currentItem.bill);
    const [loader, setLoader] = useState(false);
    const [save, setSave] = useState(false);
    const [screen, setScreen] = useState(1);
    const [expDate, setexpDate] = useState(props.currentItem.addedDate_1);
    const [datePicker1, setDatePicker1] = useState(false);
 
    const styles = StyleSheet.create({
        calenderButton: {
            backgroundColor: '#6200ee',
            marginTop: 10,
        },

        button:
        {
            marginRight: 13,
        },
        center:
        {

            justifyContent: 'center',
            alignItems: 'center',

        }, gridView: {
            marginTop: 20,
            flex: 1,
        },
        img_add:
        {
            width: 140,
            height: 100, margin: 10
        },
        img_search:
        {
            width: 130,
            height: 100
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
        button_photo:
        {
            marginLeft: 10,
            marginRight: 10,
        }

    });


    const SaveContent = () => {
        setSave(true)
        if (expenseAmt.length > 0 && Number.isInteger(parseInt(expenseAmt))) {
            setLoader(true);
            let editDict = {
                amount: parseInt(expenseAmt),
                notes: notes,
                bill: imagesList,
                addedDate: expDate
            }
            firestore()
                .collection('expenseDetails').doc(props.currentItem.key).update(editDict)
            props.modifyLocal(editDict);
            setLoader(false);
            setSave(false);
            props.close()

        }

    }

    const ImgScreen = () => {
        setSave(true)
        if (expenseAmt.length > 0 && Number.isInteger(parseInt(expenseAmt))) setScreen(2)
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
                        <View style={styles.center}>
                            <Image
                                style={styles.img_add}
                                source={{ uri: imgURI }}
                            />
                        </View>
                        <TextInput disabled={loader}
                            label="Amount"
                            value={expenseAmt}
                            error={save && !/^\d+$/.test(expenseAmt)}
                            placeholder="Enter Amount"
                            mode='outlined'
                            keyboardType='numeric'
                            onChangeText={text => setExpenseAmt(text)}
                            left={<TextInput.Affix text="Rs." />}
                        />

                        <TextInput disabled={loader}
                            label="Notes"
                            value={notes}
                            placeholder="Enter notes"
                            mode='outlined'
                            onChangeText={text => setnotes(text)}
                        />
                        <Button style={styles.calenderButton} mode="contained" onPress={() => setDatePicker1(true)}>{moment(expDate).format('MMM-D-YYYY')}</Button>

                        <DateTimePickerModal
                            isVisible={datePicker1}
                            mode="date"
                            onConfirm={(date) => { setexpDate(date); setDatePicker1(false) }}
                            onCancel={() => setDatePicker1(false)}
                        />
                    </Dialog.Content>
                    <Button style={styles.button_photo} mode="contained" disabled={loader} onPress={() => ImgScreen()}>Images for expense</Button>
                    <View style={styles.center}>
                        <Dialog.Actions>
                            <Button style={styles.button} mode="contained" disabled={loader} onPress={() => props.close()}>Cancel</Button>
                            <Button style={styles.button} mode="contained" disabled={loader} onPress={() => SaveContent()}>Save</Button>
                        </Dialog.Actions>
                    </View>

                </View>
            }

            {
                screen == 2 &&
                <ExpenseImages close={() => props.close()} save={() => SaveContent()} download={true} imagesList={imagesList} setImagesList={(images) => setImagesList(images)} back={() => setScreen(1)} />
            }



        </View>
    )
}
