import React, { useState, useEffect } from 'react';

import {
    View, Image, TouchableOpacity, StyleSheet
} from 'react-native';
import { Button, TextInput, Dialog, Appbar, Text } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import LottieView from 'lottie-react-native';
import ExpenseImages from './ExpenseImages';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
export default function ExistingCategory(props) {

    const [expenseName, setExpenseName] = useState(props.currentItem.name);
    const [expenseAmt, setExpenseAmt] = useState('');
    const [notes, setNotes] = useState('');
    const [imgURI, setimgURI] = useState(props.currentItem.img);
    const [loader, setLoader] = useState(false);
    const [save, setSave] = useState(false);
    const [screen, setScreen] = useState(1);
    const [imagesList, setImagesList] = useState([]);
    const [expDate, setexpDate] = useState(new Date());
    const [datePicker1, setDatePicker1] = useState(false);
    const styles = StyleSheet.create({

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

        },
        textNeat: {
            fontSize: 20,
            color: '#6200ee',
            fontWeight: 'bold',
            fontStyle: 'italic',
            textAlign: 'center',
            paddingTop: 10,
        }, button:
        {
            marginRight: 13,
        },
        button_photo:
        {
            marginRight: 5,
            marginTop: 10
        },calenderButton: {
            backgroundColor: '#ba4089',
            marginTop: 10,
        }

    });


    const SaveContent = () => {
        setSave(true)
        if (expenseAmt.length > 0 && Number.isInteger(parseInt(expenseAmt))) {
            setLoader(true);

            firestore()
                .collection('expenseDetails')
                .add({
                    expenseId: props.currentItem.key,
                    amount: parseInt(expenseAmt),
                    notes: notes,
                    addedDate: expDate,
                    fav: false,
                    bill: imagesList
                }).then(() => {
                    props.close()
                    setLoader(false);

                })
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
            {screen == 1 &&
                <View>
                    <Appbar.Header>
                        <Appbar.Content title="Add Expense" />

                    </Appbar.Header>

                    <Dialog.Content>
                        <View style={styles.center}>
                            <Image
                                style={styles.img_add}
                                source={{ uri: imgURI }}
                            />
                        </View>
                        {props.currentItem.key.length > 0 ?
                            <Text style={styles.textNeat}>{props.currentItem.name}</Text> : <TextInput disabled={loader}
                                label="Expense Name"
                                value={expenseName}
                                error={save && expenseName.length <= 0}
                                placeholder="Enter Expense Name"
                                mode='outlined'
                                onChangeText={text => setExpenseName(text)}
                            />}

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
                            onChangeText={text => setNotes(text)}
                        />
                        <Button style={styles.calenderButton} mode="contained" onPress={() => setDatePicker1(true)}>{moment(expDate).format('MMM-D-YYYY')}</Button>

                        <DateTimePickerModal
                            isVisible={datePicker1}
                            mode="date"
                            onConfirm={(date) => { setexpDate(date); setDatePicker1(false) }}
                            onCancel={() => setDatePicker1(false)}
                        />

                        <Button style={styles.button_photo} mode="contained" disabled={loader} onPress={() => ImgScreen()}>Add images for expense</Button>


                    </Dialog.Content>
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
                <ExpenseImages close={()=>props.close()} save={()=>SaveContent()} download={false} imagesList={imagesList} setImagesList={(images) => setImagesList(images)} back={() => setScreen(1)} />
            }


        </View>
    )
}
