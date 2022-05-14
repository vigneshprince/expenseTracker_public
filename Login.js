import React, { useEffect, useContext } from 'react';
import { GoogleSignin, GoogleSigninButton } from '@react-native-community/google-signin';
import { AuthContext } from './AuthProvider';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
const Login = () => {
    const { googleLogin, loader } = useContext(AuthContext);
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
    useEffect(() => {

        GoogleSignin.configure({
            webClientId: '678536524149-a7kj53ai50a1h4tuvbmb55r5cchmk2sj.apps.googleusercontent.com',
        });

    }, []);


    return (
        <View style={styles.container}>
            {
                loader ? <LottieView source={require('./animation.json')} autoPlay loop />
                    : <GoogleSigninButton
                        style={{ width: 192, height: 48 }}
                        size={GoogleSigninButton.Size.Wide}
                        color={GoogleSigninButton.Color.Dark}
                        onPress={() => googleLogin()}
                    />
            }

        </View>
    );
};

export default Login;