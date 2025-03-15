/**
 * @author Xanders
 * @see https://team.xsamtech.com/xanderssamoth
 */
import React, { createContext, useEffect, useState } from 'react'
import { ToastAndroid } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../tools/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [splashLoading, setSplashLoading] = useState(false);

    const getDaysDifference = () => {
        // Supposons que la date soit dans data.date
        const apiDate = new Date(userInfo.date);
        const today = new Date();

        // Calculer la différence en millisecondes
        const differenceInTime = apiDate - today;

        // Convertir en jours
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

        setDaysDifference(differenceInDays);
    };

    const register = (firstname, lastname, surname, gender, birthdate, city, country, address_1, address_2, p_o_box, email, phone, username, password, confirm_password, role_id) => {
        setIsLoading(true);

        axios.post(`${API.url}/user`, {
            firstname, lastname, surname, gender, birthdate, city, country, address_1, address_2, p_o_box, email, phone, username, password, confirm_password, role_id
        }).then(res => {
            let message = res.data.message;
            let userData = res.data.data.user;

            setUserInfo(userData);

            AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            ToastAndroid.show(`${message}`, ToastAndroid.LONG);
            console.log(`${message}`);

            setIsLoading(false);

        }).catch(error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                ToastAndroid.show(`${error.response.data.message || error.response.data}`, ToastAndroid.LONG);
                console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);

            } else if (error.request) {
                // The request was made but no response was received
                ToastAndroid.show(t('error') + ' ' + t('error_message.no_server_response'), ToastAndroid.LONG);

            } else {
                // An error occurred while configuring the query
                ToastAndroid.show(`${error}`, ToastAndroid.LONG);
            }

            setIsLoading(false);
        });
    };

    const update = (id, firstname, lastname, surname, gender, birthdate, city, country, address_1, address_2, p_o_box, email, phone, username) => {
        setIsLoading(true);

        axios.put(`${API.url}/user/${id}`, {
            id, firstname, lastname, surname, gender, birthdate, city, country, address_1, address_2, p_o_box, email, phone, username
        }, {
            headers: { 'Authorization': `Bearer ${userInfo.api_token}` }
        }).then(res => {
            let message = res.data.message;
            let userData = res.data.data;

            setUserInfo(userData);

            AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            ToastAndroid.show(`${message}`, ToastAndroid.LONG);
            console.log(`${message}`);

            setIsLoading(false);

        }).catch(error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                ToastAndroid.show(`${error.response.data.message || error.response.data}`, ToastAndroid.LONG);
                console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);

            } else if (error.request) {
                // The request was made but no response was received
                ToastAndroid.show(t('error') + ' ' + t('error_message.no_server_response'), ToastAndroid.LONG);

            } else {
                // An error occurred while configuring the query
                ToastAndroid.show(`${error}`, ToastAndroid.LONG);
            }

            setIsLoading(false);
        });
    };

    const updateAvatar = (user_id, image_64) => {
        setIsLoading(true);

        axios.put(`${API.url}/user/update_avatar_picture/${user_id}`, {
            user_id, image_64
        }, {
            headers: { 'Authorization': `Bearer ${userInfo.api_token}` }
        }).then(res => {
            let message = res.data.message;
            let userData = res.data.data;

            setUserInfo(userData);

            AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            ToastAndroid.show(`${message}`, ToastAndroid.LONG);
            console.log(`${message}`);

            setIsLoading(false);

        }).catch(error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                ToastAndroid.show(`${error.response.data.message || error.response.data}`, ToastAndroid.LONG);
                console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);

            } else if (error.request) {
                // The request was made but no response was received
                ToastAndroid.show(t('error') + ' ' + t('error_message.no_server_response'), ToastAndroid.LONG);

            } else {
                // An error occurred while configuring the query
                ToastAndroid.show(`${error}`, ToastAndroid.LONG);
            }

            setIsLoading(false);
        });
    };

    const changePassword = (id, former_password, new_password, confirm_new_password) => {
        setIsLoading(true);

        axios.put(`${API.url}/user/update_password/${id}`, {
            former_password, new_password, confirm_new_password
        }, {
            headers: { 'Authorization': `Bearer ${userInfo.api_token}` }
        }).then(res => {
            let message = res.data.message;

            ToastAndroid.show(`${message}`, ToastAndroid.LONG);
            console.log(`${message}`);

            setIsLoading(false);

        }).catch(error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                ToastAndroid.show(`${error.response.data.message || error.response.data}`, ToastAndroid.LONG);
                console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);

            } else if (error.request) {
                // The request was made but no response was received
                ToastAndroid.show(t('error') + ' ' + t('error_message.no_server_response'), ToastAndroid.LONG);

            } else {
                // An error occurred while configuring the query
                ToastAndroid.show(`${error}`, ToastAndroid.LONG);
            }

            setIsLoading(false);
        });
    };

    const changeStatus = (user_id, status_id) => {
        setIsLoading(true);

        axios.put(`${API.url}/user/switch_status/${user_id}/${status_id}`, null, {
            headers: { 'Authorization': `Bearer ${userInfo.api_token}` }
        }).then(res => {
            let message = res.data.message;
            let userData = res.data.data;

            setUserInfo(userData);

            AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            ToastAndroid.show(`${message}`, ToastAndroid.LONG);
            console.log(`${message}`);

            setIsLoading(false);

        }).catch(error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                ToastAndroid.show(`${error.response.data.message || error.response.data}`, ToastAndroid.LONG);
                console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);

            } else if (error.request) {
                // The request was made but no response was received
                ToastAndroid.show(t('error') + ' ' + t('error_message.no_server_response'), ToastAndroid.LONG);

            } else {
                // An error occurred while configuring the query
                ToastAndroid.show(`${error}`, ToastAndroid.LONG);
            }

            setIsLoading(false);
        });
    };

    const validateSubscription = (user_id) => {
        axios.get(`${API.url}/user/${user_id}`, {
            headers: { 'Authorization': `Bearer ${userInfo.api_token}`, 'X-localization': 'fr' }
        }).then(rs => {
            const currentUser = rs.data.data.user;

            if (currentUser.recent_payment.status.status_name_fr == 'Effectué') {
                axios.put(`${API.url}/subscription/validate_subscription/${user_id}`, null, {
                    headers: { 'Authorization': `Bearer ${userInfo.api_token}` }
                }).then(res => {
                    let success = res.data.success;

                    if (success) {
                        let userData = res.data.data;

                        setUserInfo(userData);

                        AsyncStorage.setItem('userInfo', JSON.stringify(userData));
                    }

                }).catch(error => {
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        // console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);

                    } else if (error.request) {
                        // The request was made but no response was received
                        console.log(t('error') + ' ' + t('error_message.no_server_response'));

                    } else {
                        // An error occurred while configuring the query
                        // console.log(`${error}`);
                    }
                });
            }
        }).catch(err => {
            if (err.response) {
                // The request was made and the server responded with a status code
                // console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);

            } else if (err.request) {
                // The request was made but no response was received
                console.log(t('error') + ' ' + t('error_message.no_server_response'));

            } else {
                // An error occurred while configuring the query
                // console.log(`${error}`);
            }
        });
    };

    const invalidateSubscription = (user_id) => {
        axios.put(`${API.url}/subscription/invalidate_subscription/${user_id}`, null, {
            headers: { 'Authorization': `Bearer ${userInfo.api_token}` }
        }).then(res => {
            let success = res.data.success;

            if (success) {
                let userData = res.data.data;

                setUserInfo(userData);

                AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            }

        }).catch(error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);

            } else if (error.request) {
                // The request was made but no response was received
                console.log(t('error') + ' ' + t('error_message.no_server_response'));

            } else {
                // An error occurred while configuring the query
                // console.log(`${error}`);
            }
        });
    };

    const login = (username, password) => {
        setIsLoading(true);

        axios.post(`${API.url}/user/login`, {
            username, password
        }).then(res => {
            // let success = res.data.sucess;
            let message = res.data.message;
            let userData = res.data.data;

            setUserInfo(userData);

            AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            ToastAndroid.show(`${message}`, ToastAndroid.LONG);

            console.log(`${message}`);
            setIsLoading(false);
        }).catch(error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                ToastAndroid.show(`${error.response.data.message || error.response.data}`, ToastAndroid.LONG);
                console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);

            } else if (error.request) {
                // The request was made but no response was received
                ToastAndroid.show(t('error') + ' ' + t('error_message.no_server_response'), ToastAndroid.LONG);

            } else {
                // An error occurred while configuring the query
                ToastAndroid.show(`${error}`, ToastAndroid.LONG);
            }

            setIsLoading(false);
        });
    };

    const logout = () => {
        setIsLoading(true);

        AsyncStorage.removeItem('userInfo');

        setUserInfo({});
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setSplashLoading(true);

            let userInfo = await AsyncStorage.getItem('userInfo');
            userInfo = JSON.parse(userInfo);

            if (userInfo) {
                setUserInfo(userInfo);
            }

            setSplashLoading(false);

        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                ToastAndroid.show(`${error.response.data.message || error.response.data}`, ToastAndroid.LONG);
                console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);

            } else if (error.request) {
                // The request was made but no response was received
                ToastAndroid.show(t('error') + ' ' + t('error_message.no_server_response'), ToastAndroid.LONG);

            } else {
                // An error occurred while configuring the query
                ToastAndroid.show(`${error}`, ToastAndroid.LONG);
            }

            setSplashLoading(false);
        }

        setIsLoading(true);

        AsyncStorage.removeItem('userInfo');

        setUserInfo({});
        setIsLoading(false);
    };

    useEffect(() => {
        isLoggedIn();
    }, [])

    return (
        <AuthContext.Provider
            value={{ isLoading, userInfo, splashLoading, register, update, updateAvatar, changePassword, changeStatus, validateSubscription, invalidateSubscription, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}