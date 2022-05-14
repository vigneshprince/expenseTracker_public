import React,{useEffect} from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from "react-native";
import LottieView from "lottie-react-native";

export const SingleItem = ({
    item
}) => {
    const animation = React.useRef(null);
    const isFirstRun = React.useRef(true);

    useEffect(() => {
        animation.current.play(19, 50)
      }, [item]);

    const styles = StyleSheet.create({
        container: {
            flex: 1
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
            backgroundColor: '#2980b9',
            height: 150, justifyContent: 'center',
        },
        itemName: {
            fontSize: 16,
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

        }
,heartLottie: {
    width: 50,
    height: 50,
  }
    })

    return (
        <View style={[styles.itemContainer]}>

            <View style={styles.img_view}>
                <Image
                    style={styles.img_search}
                    source={{ uri: item.img }}
                />
            </View>
            <Text style={styles.itemName}>{item.name}</Text>
        </View>
    )
}