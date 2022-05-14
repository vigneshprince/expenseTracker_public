import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import AllItems from './AllItems';
import Favourites from './Favourites';
import ExpensesList from './ExpensesList';
import Status from './Status';
import Consolidated from './Consolidated';
const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();


const AppStack = () => {
    function StatusStack() {
        return (
            <Stack.Navigator>
                <Stack.Screen
                    name="Status"
                    component={Status}
                    options={{ headerShown: false }}
                    initialParams={{ month: new Date().toISOString() }}
                />
                <Stack.Screen name="Consolidated" component={Consolidated}
                    options={{ headerShown: false }} />
            </Stack.Navigator>
        );
    }
    return (
        <Tab.Navigator
            initialRouteName="Home"
            activeColor="#fff"
        >
            <Tab.Screen
                name="Favourites"
                component={Favourites}
                options={{
                    tabBarLabel: 'Favourites',
                    tabBarColor: '#009387',
                    tabBarIcon: ({ color }) => (
                        <Icon name="md-heart-sharp" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="All Items"
                component={AllItems}
                options={{
                    tabBarLabel: 'All Items',
                    tabBarColor: '#1f65ff',
                    tabBarIcon: ({ color }) => (
                        <Icon name="ios-layers" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="History"
                component={ExpensesList}
                options={{
                    tabBarLabel: 'History',
                    tabBarColor: '#5624aefc',
                    tabBarIcon: ({ color }) => (
                        <Icon name="md-file-tray-full-sharp" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="StatusStack"
                component={StatusStack}
                options={{
                    tabBarLabel: 'Status',
                    tabBarColor: '#d02860',
                    tabBarIcon: ({ color }) => (
                        <Icon name="bar-chart" color={color} size={26} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default AppStack;