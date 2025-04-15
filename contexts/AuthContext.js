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
    // =============== Get data ===============
    const [userInfo, setUserInfo] = useState({});
    const [startRegisterInfo, setStartRegisterInfo] = useState({});
    const [endRegisterInfo, setEndRegisterInfo] = useState({});
    const [registerError, setRegisterError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [splashLoading, setSplashLoading] = useState(false);
    const [pushToken, setPushToken] = useState(null);

    const getPushToken = async () => {
        try {
            const token = await messaging().getToken();

            setPushToken(token);
            await AsyncStorage.setItem('pushToken', token);

        } catch (error) {
            // If the user is logged in and the token does not exist, display the error
            if (userInfo && Object.keys(userInfo).length > 0) {
                ToastAndroid.show(`Error retrieving push token: ${error}`, ToastAndroid.LONG);
                console.error(`Error retrieving push token: ${error}`);
            }
            // If the user is logged out, do not display anything
        }
    };

    const startRegister = (firstname, lastname, surname, gender, birthdate, city, address_1, address_2, p_o_box, email, phone, username, password, confirm_password, country_id, role_id, organization_id) => {
        setIsLoading(true);
        setRegisterError(null);

        axios.post(`${API.url}/user`, {
            firstname, lastname, surname, gender, birthdate, city, address_1, address_2, p_o_box, email, phone, username, password, confirm_password, country_id, role_id, organization_id
        }).then(res => {
            const message = res.data.message;
            const userData = res.data.data.user;

            setStartRegisterInfo(userData);

            AsyncStorage.setItem('startRegisterInfo', JSON.stringify(userData));
            ToastAndroid.show(`${message}`, ToastAndroid.LONG);
            console.log(`${message}`);

            setIsLoading(false);
            setRegisterError(null);

        }).catch(error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                ToastAndroid.show(`${error.response.data.message || error.response.data}`, ToastAndroid.LONG);
                console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);
                setRegisterError(`${error.response.data.message || error.response.data}`);

            } else if (error.request) {
                // The request was made but no response was received
                ToastAndroid.show(t('error') + ' ' + t('error_message.no_server_response'), ToastAndroid.LONG);
                setRegisterError(t('error') + ' ' + t('error_message.no_server_response'));

            } else {
                // An error occurred while configuring the query
                ToastAndroid.show(`${error}`, ToastAndroid.LONG);
                setRegisterError(`${error}`);
            }

            setIsLoading(false);
        });
    };

    const checkOTP = async (email, phone, token) => {
        setIsLoading(true);

        try {
            const res = await axios.post(`${API.url}/password_reset/check_token`, {
                email, phone, token
            });

            const message = res.data.message;
            const userData = res.data.data.user;

            if (email && phone) {
                const emailVerified = !!userData.email_verified_at;
                const phoneVerified = !!userData.phone_verified_at;

                if (emailVerified && phoneVerified) {
                    setStartRegisterInfo({});
                    setEndRegisterInfo(userData);

                    await AsyncStorage.removeItem('startRegisterInfo');
                    await AsyncStorage.setItem('endRegisterInfo', JSON.stringify(userData));

                    setIsLoading(false);

                    return 'done';
                }

            } else {
                if (email) {
                    const emailVerified = !!userData.email_verified_at;

                    if (emailVerified) {
                        setStartRegisterInfo({});
                        setEndRegisterInfo(userData);

                        await AsyncStorage.removeItem('startRegisterInfo');
                        await AsyncStorage.setItem('endRegisterInfo', JSON.stringify(userData));

                        setIsLoading(false);

                        return 'done';
                    }
                }

                if (phone) {
                    const phoneVerified = !!userData.phone_verified_at;

                    if (phoneVerified) {
                        setStartRegisterInfo({});
                        setEndRegisterInfo(userData);

                        await AsyncStorage.removeItem('startRegisterInfo');
                        await AsyncStorage.setItem('endRegisterInfo', JSON.stringify(userData));

                        setIsLoading(false);

                        return 'done';
                    }
                }
            }

            ToastAndroid.show(`${message}`, ToastAndroid.LONG);

            setStartRegisterInfo(userData);

            await AsyncStorage.setItem('startRegisterInfo', JSON.stringify(userData));

            setIsLoading(false);

            if (emailVerified) return 'email_validated';

            return 'email_not_validated';

        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                ToastAndroid.show(`${error.response.data.message || error.response.data}`, ToastAndroid.LONG);
                console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);
                setRegisterError(`${error.response.data.message || error.response.data}`);

            } else if (error.request) {
                // The request was made but no response was received
                ToastAndroid.show(t('error') + ' ' + t('error_message.no_server_response'), ToastAndroid.LONG);
                setRegisterError(t('error') + ' ' + t('error_message.no_server_response'));

            } else {
                // An error occurred while configuring the query
                ToastAndroid.show(`${error}`, ToastAndroid.LONG);
                setRegisterError(`${error}`);
            }

            setIsLoading(false);

            return 'error';
        }
    };

    const endRegister = (id, firstname, lastname, surname, gender, birthdate, city, address_1, address_2, p_o_box, email, phone, username, password, confirm_password, country_id, role_id, organization_id) => {
        setIsLoading(true);

        axios.put(`${API.url}/user/${id}`, {
            id, firstname, lastname, surname, gender, birthdate, city, address_1, address_2, p_o_box, email, phone, username, password, confirm_password, country_id, role_id, organization_id
        }, {
            headers: { 'Authorization': `Bearer ${endRegisterInfo.api_token}` }
        }).then(res => {
            const message = res.data.message;
            const userData = res.data.data;

            setEndRegisterInfo({});
            setUserInfo(userData);

            AsyncStorage.removeItem('endRegisterInfo');
            AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            ToastAndroid.show(`${message}`, ToastAndroid.LONG);
            console.log(`${message}`);

            setIsLoading(false);

        }).catch(error => {
            if (error.response) {
                // The request was made and the server responded with a status code
                ToastAndroid.show(`${error.response.data.message || error.response.data}`, ToastAndroid.LONG);
                console.log(`${error.response.status} -> ${error.response.data.message || error.response.data}`);
                setRegisterError(`${error.response.data.message || error.response.data}`);

            } else if (error.request) {
                // The request was made but no response was received
                ToastAndroid.show(t('error') + ' ' + t('error_message.no_server_response'), ToastAndroid.LONG);
                setRegisterError(t('error') + ' ' + t('error_message.no_server_response'));

            } else {
                // An error occurred while configuring the query
                ToastAndroid.show(`${error}`, ToastAndroid.LONG);
                setRegisterError(`${error}`);
            }

            setIsLoading(false);
        });
    };

    const update = (id, firstname, lastname, surname, gender, birthdate, city, address_1, address_2, p_o_box, email, phone, username, password, confirm_password, country_id, role_id, organization_id) => {
        setIsLoading(true);

        axios.put(`${API.url}/user/${id}`, {
            id, firstname, lastname, surname, gender, birthdate, city, address_1, address_2, p_o_box, email, phone, username, password, confirm_password, country_id, role_id, organization_id
        }, {
            headers: { 'Authorization': `Bearer ${userInfo.api_token}` }
        }).then(res => {
            const message = res.data.message;
            const userData = res.data.data;

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
            const message = res.data.message;
            const userData = res.data.data;

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
            const message = res.data.message;

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

    const changeRole = (user_id, role_id) => {
        setIsLoading(true);

        axios.put(`${API.url}/user/update_role/${user_id}`, { role_id }, {
            headers: { 'Authorization': `Bearer ${userInfo.api_token}` }
        }).then(res => {
            const message = res.data.message;
            const userData = res.data.data;

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

    const changeOrganization = (user_id, organization_id) => {
        setIsLoading(true);

        axios.put(`${API.url}/user/update_organization/${user_id}`, { organization_id }, {
            headers: { 'Authorization': `Bearer ${userInfo.api_token}` }
        }).then(res => {
            const message = res.data.message;
            const userData = res.data.data;

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

    const changeStatus = (user_id, status_id) => {
        setIsLoading(true);

        axios.put(`${API.url}/user/switch_status/${user_id}/${status_id}`, null, {
            headers: { 'Authorization': `Bearer ${userInfo.api_token}` }
        }).then(res => {
            const message = res.data.message;
            const userData = res.data.data;

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

    const login = (username, password) => {
        setIsLoading(true);

        axios.post(`${API.url}/user/login`, {
            username, password
        }).then(res => {
            const message = res.data.message;
            const userData = res.data.data;

            setUserInfo(userData);

            AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            ToastAndroid.show(`${message}`, ToastAndroid.LONG);

            console.log(`${message}`);
            setIsLoading(false);
            getPushToken();
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
        AsyncStorage.removeItem('pushToken');

        setUserInfo({});
        setPushToken(null);
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
        getPushToken();
    }, [])

    return (
        <AuthContext.Provider
            value={{ isLoading, userInfo, startRegisterInfo, endRegisterInfo, registerError, splashLoading, pushToken, login, logout, startRegister, checkOTP, endRegister, update, updateAvatar, changePassword, changeRole, changeOrganization, changeStatus, validateSubscription }}>
            {children}
        </AuthContext.Provider>
    );
}