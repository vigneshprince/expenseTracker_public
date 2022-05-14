import React, { useState, useEffect } from 'react';

import {
    View, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Button, TextInput, Dialog, Appbar, Text } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';
import GoogleImage from './GoogleImage';
import ExpenseImages from './ExpenseImages';
const NewExpense = (props) => {

    const [expenseName, setExpenseName] = useState('');
    const [expenseAmt, setExpenseAmt] = useState('');
    const [notes, setNotes] = useState('');
    const [imgURI, setimgURI] = useState("https://img.icons8.com/plasticine/100/000000/image.png");
    const [screen, setScreen] = useState(1);
    const [loader, setLoader] = useState(false);
    const [save, setSave] = useState(false);
    const [fireBaseURI, setFireBaseURI] = useState("https://img.icons8.com/plasticine/100/000000/image.png");
    const [expDate, setexpDate] = useState(new Date());
    const [datePicker1, setDatePicker1] = useState(false);
    const [categories, setCategories] = useState([]);
    const [currentCategory, setcurrentCategory] = useState('2nTOgG1mmpGnPmWhkPjS');
    const [open, setOpen] = useState(false);
    const [imagesList, setImagesList] = useState([]);
    useEffect(() => {
        firestore().collection('categories').orderBy('name', 'asc').get().then(cats => {
            setCategories(cats.docs.map(doc => {
                return {
                    'value': doc.id,
                    label: doc.data().name
                }
            }))
        })
    }, [])
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
        
        button_photo:
        {
            marginRight: 5,
            marginTop: 10
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
            width: 75,
            height: 75,
        },
        textNeat: {
            fontSize: 20,
            color: '#6200ee',
            fontWeight: 'bold',
            textAlign: 'center',
            paddingTop: 10,
        }, button:
        {
            marginRight: 13,
        }, calenderButton: {
            backgroundColor: '#ba4089',
            marginTop: 10,
        }

    });

    const ImgUpload = (item) => {
        setScreen(1)
        setLoader(true);
        setimgURI(item)
        var ref = storage().ref().child(expenseName + ".jpg")
        fetch(item).then
            (res => {
                res.blob().then
                    (blob => {
                        var upload = ref.put(blob)
                        upload.then
                            (x => {
                                upload.snapshot.ref.getDownloadURL().then
                                    (url => {
                                        setFireBaseURI(url)
                                        setScreen(1)
                                        setLoader(false);
                                    })
                            })
                    })
            })
    }
    const SaveContent = () => {
        setSave(true)
        if (expenseAmt.length > 0 && Number.isInteger(parseInt(expenseAmt)) && expenseName.length > 0) {
            setLoader(true);
            firestore()
                .collection('expenses')
                .add({
                    name: expenseName,
                    lcase: expenseName.toLowerCase(),
                    img: fireBaseURI,
                    category: currentCategory
                })
                .then((docref) => {
                    props.dataFetch();
                    firestore()
                        .collection('expenseDetails')
                        .add({
                            expenseId: docref.id,
                            amount: parseInt(expenseAmt),
                            notes: notes,
                            addedDate: expDate,
                            bill: [],
                            fav: false,
                            bill: imagesList,
                            category: currentCategory
                        }).then(() => {
                            props.close()
                            setLoader(false);

                        })
                })
        }


    }

    const ImgScreen = () => {
        setSave(true)
        if (expenseAmt.length > 0 && Number.isInteger(parseInt(expenseAmt)) && expenseName.length > 0) setScreen(3)
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
                        <Appbar.Content title="Add Expense" />

                    </Appbar.Header>
                    <Dialog.Content>
                        <TouchableOpacity disabled={loader} style={styles.center} onPress={() => setScreen(2)}>
                            <Image
                                style={styles.img_add}
                                source={{ uri: imgURI }}
                            />
                        </TouchableOpacity>
                        <TextInput disabled={loader}
                            label="Expense Name"
                            value={expenseName}
                            error={save && expenseName.length <= 0}
                            placeholder="Enter Expense Name"
                            mode='outlined'
                            onChangeText={text => setExpenseName(text)}
                        />

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
                        <DropDownPicker
                            style={{ marginTop: 10 }}
                            dropDownDirection="TOP"
                            zIndex={1000}
                            placeholder='Select Category'
                            open={open}
                            listMode='SCROLLVIEW'
                            value={currentCategory}
                            items={categories}
                            setOpen={setOpen}
                            setValue={setcurrentCategory}
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
                <GoogleImage back={() => setScreen(1)} expenseName={expenseName} ImgUpload={(item) => ImgUpload(item)} />
            }

            {
                screen == 3 &&
                <ExpenseImages close={()=>props.close()} save={()=>SaveContent()} download={false} imagesList={imagesList} setImagesList={(images) => setImagesList(images)} back={() => setScreen(1)} />
            }

        </View>
    )
}

export default NewExpense;