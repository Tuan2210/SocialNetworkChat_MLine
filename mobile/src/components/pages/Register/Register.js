import { ImageBackground,Alert, SafeAreaView, Text, TextInput, View ,Image, TouchableOpacity, Dimensions} from 'react-native';
import styles from './Register.module.scss';
import { Link, useNavigate } from 'react-router-native';
import { useRef, useState } from 'react';
// import { Icon } from 'react-native-vector-icons/icon';
import PhoneInput from 'react-native-phone-number-input';
import {FirebaseRecaptchaVerifierModal} from 'expo-firebase-recaptcha';
import { firebaseConfig } from '../../../firebase-config-mobile';
import firebase from 'firebase/compat/app';

import Icon from 'react-native-vector-icons/FontAwesome5';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useDispatch } from 'react-redux';

const Tab = createBottomTabNavigator();

const widthScreen = Dimensions.get('window').width

function Register() {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [flagTabNewUser, setFlagTabNewUser] = useState(false);
    const [FlagNewUser, setFlagNewUser] = useState(false)
    function VerifyOtp(){

        const [Flag, setFlag] = useState(false)
        
        const [phonenumber, setPhoneNumber] = useState('')
        const [otp, setOtp] = useState('');
        const [verificationId, setVerificationId] = useState(null);
        const recaptchaVerifier = useRef(null);        
        const phoneInput = useRef(PhoneInput);

        let phoneNumber = phonenumber.trim();

        const getOtp = () => {
                if (phoneNumber === '' || phoneNumber === undefined)
                    Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại!');
                else if (phoneNumber.length !== 12) Alert.alert('Thông báo', 'Vui lòng nhập đủ 9 ký tự sau của số điện thoại!');
                else {
                    console.log(phonenumber);
                    try {
                        const phoneProvider = new firebase.auth.PhoneAuthProvider();
                        phoneProvider.verifyPhoneNumber(phoneNumber, recaptchaVerifier.current).then(setVerificationId);
                        setPhoneNumber(phoneNumber);
                        setFlag(true);
                    } catch (err) {
                        console.log(err.message);
                        Alert.alert('Thông báo', 'Vui lòng nhập lại só điện thoại!');
                    }
                }
            };
        const verifyyOtp = () => {
                if (otp === '' || otp === undefined) Alert.alert('Thông báo', 'Vui lòng nhập mã xác thực!');
                else if (otp.length !== 6) Alert.alert('Thông báo', 'Vui lòng nhập 6 ký tự!');
                else {
                    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
                    firebase
                        .auth()
                        .signInWithCredential(credential)
                        .then(() => {
                            setOtp('');
                            setFlagTabNewUser(true);
                            Alert.alert('Thông báo', "Xác thực thành công. Vui lòng chuyển tab 'Đăng ký'");
                        })
                        .catch((error) => {
                            console.log(error);
                            alert('Xác thực không thành công!');
                        });
                    console.log(otp);
                }
            };

        return (
            <SafeAreaView style={{margin:0, padding:0}}>
                <View style={{borderRadius:20}}>
                    <ImageBackground source={require('../../../../assets/bgcolor-vertical.png')} style={[styles.ImageBackground,{}]}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                borderTopColor: 'red',
                                borderStyle: 'solid',
                                borderTopWidth: 1,
                                marginTop:-5
                            }}>
                            {/* <View>
                                <Image
                                    source={require('../../../../assets/logo-no-bg.png')}
                                    style={styles.logo}
                                />
                                <Text style={styles.line}>LINE</Text>
                            </View> */}
                            

                            <View style={{display: !Flag ? 'flex' : 'none',}}>
                                <View style={{  backgroundColor:'white',
                                                width:350,
                                                height:485,
                                                margin:30,
                                                marginTop:90,
                                                borderRadius:30
                                                ,opacity:0.99999
                                }}>
                                    <Text style={styles.tittle}>Nhập số điện thoại của bạn</Text>
                                    <Text style={styles.info}> Vui lòng nhập số điện thoại đăng ký            của bạn</Text>
                                    <View style={{alignContent:'center', alignSelf:'center',marginTop:15}}>
                                        <PhoneInput  
                                                    defaultCode='VN' 
                                                    ref={phoneInput}
                                                    maxLength={9}
                                                    defaultValue={phonenumber}
                                                    withShadow
                                                    layout='first'
                                                    autoFocus
                                                    onChangeFormattedText={(text) => setPhoneNumber(text)}
                                                    placeholder='Số điện thoại'>
                                        </PhoneInput>
                                    </View>
                                    <Text style={[styles.info,{marginTop:18}]}>Bạn đã có tài khoản?</Text>
                                    <Link to="/">
                                        <Text style={{color: 'rgb(250, 139, 158)',
                                                fontWeight: 'bold',
                                                textAlign:'center',
                                                margin:10,
                                                fontSize: 20,}}>Đăng nhập ngay!</Text>
                                    </Link>

                                    <View style={{flexDirection:'row',justifyContent:'space-around', alignContent:'space-between'}}>
                                        <TouchableOpacity style={styles.btnCon} onPress={getOtp}>
                                            <Text style={styles.txtCon}> Tiếp tục </Text>
                                        </TouchableOpacity>
                                        <Link to="/" style={styles.btnCon}>
                                            <Text style={styles.txtCon}>Trở về </Text>  
                                        </Link>
                                    </View>
                                </View>
                        </View>
                        <View style={{display: !Flag ? 'none' : 'flex'}}>
                                <View style={{  backgroundColor:'white',
                                                    width:350,
                                                    height:420,
                                                    margin:30,
                                                    marginTop:150,
                                                    borderRadius:30
                                    }}>
                                        <Text style={styles.tittle}>     Vui lòng nhập mã OTP</Text>
                                        <Text style={[styles.info, {fontWeight:'300',marginBottom:20,opacity:0.6}]}> Hệ thống vừa gửi OTP đến số điện thoại {phonenumber}</Text>
                                        <View style={{flexDirection:'row', alignItems:'space-around'} }>
                                                <TextInput  keyboardType='number-pad' 
                                                    maxLength={6} autoComplete='tel'
                                                    onChangeText={setOtp}
                                                    placeholder='Nhập OTP' style={styles.inputSDT}>
                                                </TextInput>
                                        </View>
                                        <Text style={[styles.info,{marginTop:20,marginBottom:15}]}>Bạn chưa nhận được mã?</Text>
                                        <Text style={{color: 'rgb(250, 139, 158)',
                                                textDecorationLine:'underline',
                                                fontWeight: 'bold',
                                                textAlign:'center',
                                                fontSize: 20,}
                                                }>Gửi lại OTP</Text>
                                        <View style={{flexDirection:'row',justifyContent:'space-around', alignContent:'space-around'}}>
                                            <TouchableOpacity style={styles.btnCon} onPress={verifyyOtp}>
                                                <Text style={styles.txtCon}>Xác nhận</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setFlag(false)}  style={styles.btnCon}>
                                                <Text style={styles.txtCon}>Trở về</Text>
                                            </TouchableOpacity>
                                        </View>                
                                </View>
                            </View>
                            <View>
                                <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={firebaseConfig}/>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
            </SafeAreaView>
        );
    }
    function VerifyUser(){
        return(
            <SafeAreaView style={{margin:0, padding:0}}>
                <View
                    style={{
                        display: !flagTabNewUser ? 'flex' : 'none',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        width: '100%',
                        height: '100%',
                        marginBottom:52
                    }}
                >
                    <Image source={require('../../../../assets/stop.gif')} style={{ height: '45%', width: '50%' }} />
                    <Text
                        style={{
                            color: 'red',
                            fontWeight: 'bold',
                            fontSize: 16,
                            backgroundColor: '#fff',
                            marginTop: '-5%',
                            paddingTop: '2%',
                        }}
                    >
                        Vui lòng xác thực số điện thoại trước!
                    </Text>
                </View>

                <View style={styles.registercontainer}>
                    <ImageBackground source={require('../../../../assets/bgcolor-vertical.png')} style={[styles.ImageBackground,{}]}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                borderTopColor: 'red',
                                borderStyle: 'solid',
                                borderTopWidth: 1,
                                marginTop:-5
                            }}
                            >
                            {/* <View>
                                <Image
                                    source={require('../../../../assets/logo-no-bg.png')}
                                    style={styles.logo}
                                />
                                <Text style={styles.line}>LINE</Text>
                            </View> */}
                            
                            <View style={{display: !FlagNewUser ? 'flex' : 'none',}}>
                                <View style={{  backgroundColor:'white',
                                                width:350,
                                                height:250,
                                                margin:30,
                                                marginTop:90,
                                                borderRadius:30
                                                ,opacity:0.99999
                                }}>
                                    <Text style={[styles.tittle,{alignSelf:'center'}]}>Nhập tên của bạn</Text>
                                    <Text style={styles.info}> Vui lòng nhập tên của bạn</Text>
                                    <View style={{alignContent:'center', alignSelf:'center',marginTop:15, marginLeft:-28}}>
                                        <TextInput      numberOfLines={1}
                                                        maxLength={15} autoComplete='cc-number'
                                                        // blurOnSubmit='true'
                                                        placeholderTextColor={'#a9a9a9'}
                                                        textContentType='oneTimeCode'
                                                        placeholder='Tên của bạn' style={styles.inputSDT}>
                                                    </TextInput>
                                    </View>
                                    
                                </View>
                                
                                <View style={{flexDirection:'row', alignSelf:'center',marginBottom:80}}>
                                    <TouchableOpacity style={[styles.btnConUser]} onPress={() => setFlagNewUser(true)}>
                                        <Text style={styles.txtCon}> Tiếp tục </Text>
                                    </TouchableOpacity>
                                    {/* <Link to="/" style={styles.btnCon}>
                                        <Text style={styles.txtCon}>   Trở về </Text>
                                    </Link> */}
                                </View>
                            </View>


                            <View style={{display: !FlagNewUser ? 'none' : 'flex'}}>
                                <View style={{  backgroundColor:'white',
                                                    width:350,
                                                    height:300,
                                                    margin:30,
                                                    marginTop:90,
                                                    borderRadius:30,
                                                    alignSelf:'center'
                                    }}>
                                        <Text style={[styles.tittle, {alignSelf:'center'}]}>Chọn ảnh đại diện</Text>
                                        <View style={{flexDirection:'row', alignSelf:'center'} }>
                                            <TouchableOpacity style={styles.btnImgPicker}>
                                                <Image source={require('../../../../assets/camera.png')}
                                                style={styles.ImgPicker}/>
                                            </TouchableOpacity>
                                        </View>
                                        
                                </View>
                                <View style={{flexDirection:'row', marginTop:10, marginBottom:70, alignSelf:'center'}}>
                                    <Link to="/" style={styles.btnConUser} onPress={() => setFlagNewUser(false)}>
                                        <Text style={styles.txtCon}> Xác nhận </Text>
                                    </Link>
                                    {/* <TouchableOpacity onPress={() => setFlagNewUser(false)}  style={styles.btnCon}>
                                        <Text style={styles.txtCon}>   Trở về </Text>
                                    </TouchableOpacity> */}
                                </View>
                            </View>
                            

                            </View>
                    </ImageBackground>
                </View>
            </SafeAreaView>
        )
    }
    
    return(
        <SafeAreaView style={{margin:0, padding:0}}>
                <View style={styles.registercontainer}>
                <ImageBackground source={require('../../../../assets/bgcolor-vertical.png')} style={[styles.imgBackground,{}]}>
                        <View
                            style={{
                                width: widthScreen - 100,
                                height: '80%',
                                alignItems: 'center',
                            }}>
                            <View style={{ marginBottom: 10 }}></View>
                            <NavigationContainer>
                                <Tab.Navigator
                                    initialRouteName="Xác thực SĐT"
                                    screenOptions={({ route }) => ({
                                        tabBarIcon: ({ focused, color, size }) => {
                                            let iconName;
                                            if (route.name === 'Xác thực SĐT') {
                                                iconName = 'sms';
                                                size = focused ? 24 : 18;
                                                color = focused ? '#fff' : '#555';
                                            } else if (route.name === 'Đăng ký') {
                                                iconName = focused ? 'lock-open' : 'lock';
                                                size = focused ? 22 : 18;
                                                color = focused ? '#fff' : '#555';
                                            }
                                            return <Icon name={iconName} size={size} color={color} />;
                                        },
                                        tabBarStyle: {
                                            width: widthScreen - 100,
                                            height: 60,
                                        },
                                        tabBarItemStyle: {
                                            margin: 2,
                                            padding: 5,
                                        },
                                        tabBarActiveTintColor: '#fff',
                                        tabBarActiveBackgroundColor: 'rgb(250, 139, 158)',
                                        tabBarInactiveTintColor: '#555',
                                        tabBarInactiveBackgroundColor: '#fff',
                                        headerTitleAlign: 'center',
                                        headerTitleStyle: {
                                            color: 'rgb(250, 139, 158)',
                                        },
                                    })}
                                >
                                    <Tab.Screen name="Xác thực SĐT" component={VerifyOtp} />
                                    <Tab.Screen name="Đăng ký" component={VerifyUser} />
                                </Tab.Navigator>
                            </NavigationContainer>
                            

                            </View>
                    </ImageBackground>
                </View>
            </SafeAreaView>
        // VerifyOtp() 
        // verifyUser()

        ) 
}

export default Register;
