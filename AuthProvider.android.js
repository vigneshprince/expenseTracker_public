import React, { createContext, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-community/google-signin';
import firestore from '@react-native-firebase/firestore';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loader, setLoader] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loader,
        googleLogin: async () => {
          try {
            setLoader(true);
            // Get the users ID token
            const { idToken, user } = await GoogleSignin.signIn();
            const users = await firestore().collection('user').where('email', '==', user.email).get().
              then(async querySnapshot => {
                querySnapshot.forEach(async documentSnapshot => {
                  
                  if (documentSnapshot.exists) {
                    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
                    auth().signInWithCredential(googleCredential).then(()=>setLoader(false));
                  }
                });
              });
          } catch (error) {
            
          }
        },
        logout: async () => {
          try {
            await auth().signOut();
          } catch (e) {
            
          }
        },
      }}>
      {children}
    </AuthContext.Provider>
  );
};