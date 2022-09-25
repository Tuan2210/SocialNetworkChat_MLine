import classNames from 'classnames/bind';
import styles from '../Content.module.scss';
import io from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logOut } from '../../../../redux/apiRequest/authApiRequest';
import { createAxios, url } from '../../../../redux/createInstance';
import { loginSuccess, logoutSuccess } from '../../../../redux/authSlice';
import Loading from '../../Loading/Loading';
import {
    addIndividualChat4NewUser,
    addMessage,
    getListIndividualChat,
    getMsgs,
} from '../../../../redux/apiRequest/chatApiRequest';
import { popupCenter } from '../PopupCenter';

const cx = classNames.bind(styles);

function Chat({ setRightBar }) {
    const user = useSelector((state) => state.auth.login?.currentUser);
    const sender = useSelector((state) => state.user.sender?.user);
    const chat = useSelector((state) => state.chat.message?.content);
    const individualChat = useSelector((state) => state.chat.individualChat);
    const currentContent = useSelector((state) => state.chat?.message);

    const socket = useRef();

    const [individualChatId, setIndividualChatId] = useState('');
    const [message, setMessage] = useState('');
    const [sendData, setSendData] = useState([
        {
            sender: null,
            message: {
                content: null,
                time: null,
            },
        },
    ]);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const id = user?._id;
    const accessToken = user?.accessToken;

    let axiosJWTLogout = createAxios(user, dispatch, logoutSuccess);
    let axiosJWTLogin = createAxios(user, dispatch, loginSuccess);

    const callPopupFunction = () => {
        popupCenter({ url: '../call', title: 'xtf', w: 500, h: 650 });
    };

    const handleLogout = () => {
        logOut(dispatch, navigate, id, accessToken, axiosJWTLogout);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const time = new Date();
        if (message !== '') {
            socket.current.emit('on-chat', {
                sender: sender?._id,
                message: {
                    content: message,
                    time: time,
                },
            });

            if (sendData.length <= 0) {
                addChat4NewUser();
                getListIndividualChat(accessToken, id, dispatch, axiosJWTLogin);
            } else {
                addMsgWithInfo();
            }

            setMessage('');
        }
    };

    const addMsgWithInfo = () => {
        const msg = {
            type_Msg: 0,
            content: message,
            individualChat: individualChatId,
        };

        addMessage(msg, accessToken, dispatch, axiosJWTLogin);
    };

    //
    const addChat4NewUser = () => {
        const msg = {
            type_Msg: 0,
            content: message,
        };
        const indiviSender = {
            sender: user?._id,
            status: 'Active',
            chatStatus: 0,
            user: sender?._id,
        };
        const indiviUser = {
            sender: sender?._id,
            status: 'Active',
            chatStatus: 0,
            user: user?._id,
        };

        addIndividualChat4NewUser(accessToken, msg, indiviUser, indiviSender, dispatch, axiosJWTLogin);
    };

    useEffect(() => {
        setIndividualChatId(individualChat.idChat);
    }, [individualChat.idChat]);

    useEffect(() => {
        setSendData(chat);
    }, [chat]);

    //SOCKET CHAT
    useEffect(() => {
        const handler = (chatMessage) => {
            setSendData((prev) => {
                return [...prev, chatMessage];
            });
            getListIndividualChat(accessToken, id, dispatch, axiosJWTLogin);
        };
        if (user?.accessToken) {
            socket.current = io(url, {
                'Access-Control-Allow-Credentials': true,
            });

            socket.current.on('user-chat', handler);

            return () => socket.current.off('user-chat', handler);
        }
    }, [sendData]);
    return (
        <>
            {currentContent.isFetching === true ? (
                <Loading />
            ) : (
                <>
                    <div className={cx('flex-row', 'header-center')}>
                        <div className={cx('flex-row', 'info-friend')}>
                            <img
                                src={`https://demoaccesss3week2.s3.ap-southeast-1.amazonaws.com/avata01.png`}
                                alt="avata"
                            />
                            <div className={cx('flex-column', 'info-content')}>
                                <p>{sender?.profileName}</p>
                                <span>Active</span>
                            </div>
                        </div>

                        <div className={cx('flex-row', 'btn-event')}>
                            <button onClick={() => callPopupFunction()}>Call</button>
                            <button onClick={() => callPopupFunction()}>Video</button>
                            <button className="navbar-logout" onClick={() => handleLogout()}>
                                {' '}
                                Log out
                            </button>
                            <button onClick={setRightBar.handleClickSetRightBar}>Info</button>
                        </div>
                    </div>

                    <div className={cx('flex-column', 'scroller-column', 'body-center')}>
                        <div className={cx('space-big-height')}></div>
                        <div className={cx('flex-column', 'info-friend-chat')}>
                            <img
                                src={`https://demoaccesss3week2.s3.ap-southeast-1.amazonaws.com/avata01.png`}
                                alt="avata"
                            />
                            <p>{sender?.profileName}</p>
                            <span>Hãy nói gì đó với tôi</span>
                        </div>
                        <div className={cx('space-big-height')}></div>

                        <div className={cx('flex-column', 'contain-chat')}>
                            <div className={cx('real-time')}>
                                <span className={cx('time')}>11:20,</span>
                                <span className={cx('date')}>03/08/2000</span>
                            </div>

                            {sendData?.map((mess, index) => {
                                return (
                                    <div key={index} className={cx('flex-column')}>
                                        <div
                                            className={cx('flex-row', mess.sender === id ? 'friend-send' : 'user-send')}
                                        >
                                            <img
                                                className={cx('img-chat')}
                                                src={`https://demoaccesss3week2.s3.ap-southeast-1.amazonaws.com/avata01.png`}
                                                alt="avata"
                                            />
                                            <div className={cx('box-text-chat', 'tooltip')}>
                                                <p className={cx('text-chat')}>{mess.message.content}</p>
                                                <span
                                                    className={cx(
                                                        'box-tooltip',
                                                        mess.sender === id ? 'tooltiptextFriend' : 'tooltiptextUser',
                                                    )}
                                                >
                                                    {mess.message.time}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={cx('space-height')}></div>
                                    </div>
                                );
                            })}
                            <div className={cx('space-height')}></div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className={cx('flex-row', 'input-chat')}>
                        <button className={cx('btn-chat', 'file')}>File</button>
                        <div className={cx('input-text')}>
                            <input
                                type="text"
                                placeholder="Input chat ...."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        <button type="submit" className={cx('btn-chat', 'send')}>
                            Gửi
                        </button>
                    </form>
                </>
            )}
        </>
    );
}

export default Chat;