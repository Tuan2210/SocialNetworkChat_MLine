import { createContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
    addIndividualChat4NewUser,
    addMessage,
    getListGroupChat,
    getListIndividualChat,
    updateGroupChatNewMsg,
    updateIndividualChatNewMsg,
} from '../redux/apiRequest/chatApiRequest';
import { loginSuccess } from '../redux/authSlice';
import { createAxios, url } from '../redux/createInstance';
import { TYPE_NOTIFICATION } from './TypeChat';

const ChatContext = createContext();

function ChatContextProvider({ children }) {

    const currentIndividualChat = useSelector((state) => state.chat.individualChat?.actor);
    const currentGroupChat = useSelector((state) => state.groupChat.groupChat?.actor);
    const user = useSelector((state) => state.auth.login?.currentUser);
    const sender = useSelector((state) => state.user.sender?.user);
    const isGroupChat = useSelector((state) => state.groupChat?.groupChat.isGroupChat);

    const dispatch = useDispatch();
    const socket = useRef();

    const currentUserId = user?._id;
    const currentSenderId = sender?._id;
    const accessToken = user?.accessToken;

    let axiosJWTLogin = createAxios(user, dispatch, loginSuccess);

    const [individualChatId, setIndividualChatId] = useState('');

    const [chatActors, setChatActors] = useState([]);


    const [sendData, setSendData] = useState([
        {
            type_Msg: null,
            sender: null,
            message: {
                content: null,
                time: null,
                imageContent: [],
            },
        },
    ]);

    const [listFriend, setListFriend] = useState([]);

    const createChat = (
        typeChat,
        mess,
        imageContent,
        individualId = individualChatId,
        groupChat = isGroupChat,
        currentSender = sender,
    ) => {
        const time = new Date();
        const newChat = {
            sender: currentUserId,
            receiver: currentSender._id,
            message: {
                type_Msg: typeChat,
                content: mess,
                imageContent: imageContent,
                time: time,
                userGroupChat: {
                    _id: currentUserId,
                    profileName: user.profileName,
                    profileImg: user.profileImg
                },
            },
            isNewChat: false,
            isGroupChat: groupChat,
            senderName: currentSender.profileName,
        };

        if (sendData.length <= 0) {
            newChat.isNewChat = true;
        }

        addMsg(typeChat, mess, imageContent, individualId, groupChat);

        socket.current.emit('on-chat', newChat);
        //delete receiver property
        delete newChat.receiver;
        delete newChat.isNewChat;
        delete newChat.senderName;
        delete newChat.isGroupChat;
        delete newChat.userGroupChat;
        //add chat on content
        if (typeChat !== TYPE_NOTIFICATION) {
            setSendData((prev) => [...prev, newChat]);
        }
    };

    const addMsg = (typeChat, mess, imageContent, individualId, isGroupChat) => {
        if (!isGroupChat) {
            if (sendData.length <= 0 && typeChat !== TYPE_NOTIFICATION) {
                addChat4NewUser(typeChat, mess, imageContent);
            } else {
                addMsgWithInfo(typeChat, mess, imageContent, individualId);
            }
        } else {
            addMsgWithInfoGroupChat(typeChat, mess, imageContent);
        }
    };

    //
    const addChat4NewUser = async (typeChat, mess, imageContent) => {
        const msg = {
            type_Msg: typeChat,
            content: mess,
            imageContent: imageContent,
        };
        const indiviSender = {
            sender: currentUserId,
            status: 'Active',
            chatStatus: 0,
            user: currentSenderId,
            newMsg: { ...msg, profileName: user.profileName },
        };
        const indiviUser = {
            sender: currentSenderId,
            status: 'Active',
            chatStatus: 0,
            user: currentUserId,
            newMsg: { ...msg, profileName: user.profileName },
        };

        await addIndividualChat4NewUser(accessToken, msg, indiviUser, indiviSender, dispatch, axiosJWTLogin);
        getListIndividualChat(accessToken, currentUserId, dispatch, axiosJWTLogin);
    };

    const addMsgWithInfoGroupChat = async (typeChat, mess, imageContent) => {
        const msg = {
            type_Msg: typeChat,
            content: mess,
            imageContent: imageContent,
            groupChat: currentSenderId,
            userGroupChat: currentUserId,
        };

        addMessage(msg, accessToken, dispatch, axiosJWTLogin);

        const apiNewMsg = {
            newMsg: { ...msg, profileName: user.profileName },
            groupChatId: currentSenderId,
        };

        await updateGroupChatNewMsg(accessToken, apiNewMsg, dispatch, axiosJWTLogin);
        getListGroupChat(accessToken, currentUserId, dispatch, axiosJWTLogin);
    };

    const addMsgWithInfo = async (typeChat, mess, imageContent, individualId) => {
        const msg = {
            type_Msg: typeChat,
            content: mess,
            imageContent: imageContent,
            individualChat: individualId,
        };
        addMessage(msg, accessToken, dispatch, axiosJWTLogin);

        const apiNewMsg = {
            sender: currentSenderId,
            user: currentUserId,
            newMsg: { ...msg, profileName: user.profileName },
            individualId: individualId,
        };

        await updateIndividualChatNewMsg(accessToken, apiNewMsg, dispatch, axiosJWTLogin);
        getListIndividualChat(accessToken, currentUserId, dispatch, axiosJWTLogin);
    };

    useEffect(() => {
        if (currentIndividualChat !== null) {
            const listChat = currentIndividualChat?.concat(currentGroupChat);
            const listSort = listChat?.sort(function (a, b) {
                return new Date(b?.message[0]?.time) - new Date(a?.message[0]?.time);
            });
            setChatActors(listSort);
            //set actor chat in context
            setListFriend(currentIndividualChat);
        }
    }, [currentIndividualChat, currentGroupChat]);

    //SOCKET CHAT
    useEffect(() => {
        const handler = (chatMessage) => {
            if (chatMessage.isNewChat) {
                window.setTimeout(function () {
                    //add chat finish before get one second
                    getListIndividualChat(accessToken, currentUserId, dispatch, axiosJWTLogin);
                }, 1000);
            }

            if (chatMessage.isGroupChat) {
                if (chatMessage.receiver === currentSenderId && chatMessage.sender !== currentUserId) {
                    setSendData((prev) => {
                        return [...prev, chatMessage];
                    });
                }

                if (chatMessage.sender !== currentSenderId) {
                    window.setTimeout(function () {
                        getListGroupChat(accessToken, currentUserId, dispatch, axiosJWTLogin);
                    }, 1000);
                }
            } else {
                if (chatMessage.sender === currentSenderId && chatMessage.receiver === currentUserId) {
                    setSendData((prev) => {
                        return [...prev, chatMessage];
                    });
                }
                if (chatMessage.sender === currentUserId) {
                    window.setTimeout(function () {
                        getListIndividualChat(accessToken, currentUserId, dispatch, axiosJWTLogin);
                    }, 1000);
                }

                if (chatMessage.receiver === currentUserId) {
                    window.setTimeout(function () {
                        getListIndividualChat(accessToken, currentUserId, dispatch, axiosJWTLogin);
                    }, 1000);
                }
            }




            //displaying a notification
            if (chatMessage.receiver === currentUserId) {
                Push.create(chatMessage.senderName, {
                    body: chatMessage.message.content,
                    silent: true,
                });
                Push.clear();
            }
        };
        if (user?.accessToken) {
            socket.current = io(url, {
                transports: ['websocket'],
                'Access-Control-Allow-Credentials': true,
            });

            socket.current.on('user-chat', handler);
            return () => socket.current.off('user-chat', handler);
        }


    }, [sendData]);

    const sendText4JoinGroup = (listFriend, nameGroup, idGroup) => {
        //send text join group to friend
        listFriend.forEach((friend) => {
            const individualChatId = friend._id;
            const msg = `Đã thêm bạn vào nhóm ${nameGroup}. Bạn có đồng ý tham gia không?/=/${idGroup}`;
            createChat(TYPE_NOTIFICATION, msg, [], individualChatId, false, friend.sender);
        });
    };

    const contextValue = {
        createChat,
        setIndividualChatId,
        sendData,
        setSendData,
        individualChatId,
        listFriend,
        setListFriend,
        sendText4JoinGroup,
        chatActors,
        setChatActors
    };

    return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export { ChatContextProvider, ChatContext };
