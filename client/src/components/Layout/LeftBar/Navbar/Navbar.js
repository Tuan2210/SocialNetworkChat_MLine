import classNames from 'classnames/bind';
import React, { useContext, useState } from 'react';
import Data from './Data';
import styles from './Navbar.scss';
import { useDispatch, useSelector } from 'react-redux';
import { comparePass, logOut } from '../../../../redux/apiRequest/authApiRequest';
import { useNavigate } from 'react-router-dom';
import { createAxios } from '../../../../redux/createInstance';
import { loginSuccess, logoutSuccess } from '../../../../redux/authSlice';
import {
    Avatar,
    Badge,
    Button,
    FormControl,
    FormLabel,
    Grid,
    IconButton,
    Modal,
    styled,
    TextField,
    Tooltip,
} from '@mui/material';
import { UserContext } from '../../../../context/UserContext';
import EditIcon from '@mui/icons-material/Edit';
import { changePassword, updateUser } from '../../../../redux/apiRequest/userApiRequest';
import { uploadFile } from '../../../../redux/apiRequest/fileApiRequest';
import TextInputCustom from './InpuText/InputTextCustom';

const cx = classNames.bind(styles);

const SmallAvatar = styled(Avatar)(({ theme }) => ({
    width: 26,
    height: 26,
    border: `2px solid ${theme.palette.background.paper}`,
}));

export default function Navbar({ setContainer }) {
    const currentUser = useSelector((state) => state.auth.login?.currentUser);
    const [select, setSelect] = useState(0);
    const [open, setOpen] = useState(false);
    const [inputName, setInputName] = useState(currentUser?.profileName);
    const [urlImage, setUrlImage] = useState(currentUser?.profileImg);
    const [image, setImage] = useState({});
    const [uiChangePw, setUIChangePw] = useState(false);
    const [passwordOld, setPasswordOld] = useState('');
    const [passwordNew, setPasswordNew] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [checkOldPass, setCheckOldPass] = useState(false);
    const [commentOldPass, setCommentOldPass] = useState(false);
    const [commentConfirmPass, setCommentConfirmPass] = useState(false);

    const userContext = useContext(UserContext);
    const removeUserActive2Socket = userContext.removeUserActive2Socket;

    const userId = currentUser?._id;
    const accessToken = currentUser?.accessToken;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    let axiosJWTLogout = createAxios(currentUser, dispatch, logoutSuccess);
    let axiosJWTLogin = createAxios(currentUser, dispatch, loginSuccess);

    const handleLogout = () => {
        removeUserActive2Socket(currentUser?.phoneNumber);
        localStorage.setItem('phones', JSON.stringify([]));
        logOut(dispatch, navigate, userId, accessToken, axiosJWTLogout);
    };
    const handleCloseModal = () => {
        setOpen(false);
        setUIChangePw(false);
        setInputName(currentUser?.profileName);
        setCheckOldPass(false);
    };
    const handleOpenModal = () => setOpen(true);
    const handleInputName = (event) => {
        setInputName(event.target.value);
    };
    const handleChangeImageGroup = (event) => {
        if (event.target.files && event.target.files[0]) {
            setUrlImage(URL.createObjectURL(event.target.files[0]));
            setImage(event.target.files[0]);
        }
    };

    const handleClickApply = async () => {
        if (currentUser?.profileName !== inputName.trim()) {
            const apiSetProfileName = {
                profileName: inputName.trim(),
            };

            const currentLogin = { ...currentUser, profileName: inputName.trim() };

            await updateUser(accessToken, dispatch, currentUser._id, apiSetProfileName, axiosJWTLogin);
            dispatch(loginSuccess(currentLogin));
        }

        if (currentUser?.profileImg !== urlImage) {
            //upload image to cloud
            const bodyFormData = new FormData();
            bodyFormData.append('file', image);
            const uploadImage = await uploadFile(accessToken, dispatch, axiosJWTLogin, bodyFormData);

            window.setTimeout(async function () {
                //set group chat profile img
                const apiSetGroupProfileImg = {
                    profileImg: uploadImage.url[0],
                };

                setUrlImage(uploadImage.url[0]);
                const currentLogin = { ...currentUser, profileImg: uploadImage.url[0] };

                await updateUser(accessToken, dispatch, currentUser._id, apiSetGroupProfileImg, axiosJWTLogin);
                dispatch(loginSuccess(currentLogin));
            }, 1000);
        }
    };

    const handleSubmitChangePW = async () => {
        if (passwordNew.trim() !== '' && passwordConfirm.trim() !== '') {
            if (passwordNew !== passwordConfirm) {
                setCommentConfirmPass(true);
            } else {
                handleChangePW(currentUser.phoneNumber.trim(), passwordNew);
                setUIChangePw(false);
                setCheckOldPass(false);
                setCommentConfirmPass(false);
            }
        }
    };

    const handleChangePW = (phoneNumber, pass) => {
        const account = {
            phoneNumber: phoneNumber,
            newPassword: pass
        };
        changePassword(account, dispatch);
    }

    const checkPassword = async () => {
        const pass = passwordOld.trim();

        if (pass !== '') {
            const user = {
                phoneNumber: currentUser.phoneNumber,
                password: pass
            }
            const isPassword = await comparePass(user, dispatch, accessToken, axiosJWTLogin);

            setCommentOldPass(!isPassword);
            setCheckOldPass(isPassword);

        }
    }

    return (
        <div className={cx('container')}>
            <div className={cx('avata')}>
                <Tooltip
                    title={currentUser?.profileName}
                    onClick={handleOpenModal}
                    placement="right"
                    disableInteractive
                    arrow
                >
                    <div className={cx('contain-avata')}>
                        <img className={cx('image-avata')} src={currentUser?.profileImg} alt={'avata'} />
                    </div>
                </Tooltip>
            </div>
            <ul className={cx('list-button')}>
                {Data.map((item, index) => {
                    const background = select === index ? item.backgroundSelect : item.background;
                    const image = select === index ? item.urcSelect : item.urc;
                    const toolTip = item.toolTip;

                    return (
                        <Tooltip key={index} title={toolTip} placement="right" disableInteractive arrow>
                            <li
                                className={cx(background)}
                                onClick={() => {
                                    setSelect(index);
                                    setContainer(index);
                                    if (index === 2) handleLogout();
                                }}
                            >
                                <img className={cx('iconButon')} src={image} alt={'icon-message'} />
                            </li>
                        </Tooltip>
                    );
                })}
            </ul>

            <Modal open={open} onClose={handleCloseModal}>
                <Grid container width={500} borderRadius={2} direction="column" className={cx('modalMainProfile')}>
                    <Grid container padding={1} borderBottom={2} borderColor={'#c4c4c4'}>
                        <span className={cx('title')}>Thông tin cá nhân</span>
                    </Grid>
                    {uiChangePw ? (
                        <div className={cx('contain-changePW')}>
                            <div className={cx('section')}>
                                <label>Mật khẩu hiện tại</label>

                                <TextInputCustom placeholder="Nhập mật khẩu hiện tại" onChangeText={setPasswordOld} disabled={checkOldPass} />
                                <button onClick={checkPassword}>Kiểm tra</button>
                                {commentOldPass ? <span className={cx('dialog')}>Nhập sai mật khẩu</span> : <></>}

                            </div>
                            <div className={cx('section')}>
                                <label>Mật khẩu mới</label>
                                <TextInputCustom placeholder="Nhập mật mới" onChangeText={setPasswordNew} disabled={!checkOldPass} />
                            </div>
                            <div className={cx('section')}>
                                <label>Nhập lại mật khẩu</label>
                                <TextInputCustom placeholder="Nhập lại mật khẩu" onChangeText={setPasswordConfirm} disabled={!checkOldPass} />
                                {commentConfirmPass ? <span className={cx('dialog')}>Nhập sai mật khẩu</span> : <></>}
                            </div>
                            <button className={cx('btn-submit')} onClick={handleSubmitChangePW}>
                                Xác nhận
                            </button>
                        </div>
                    ) : (
                        <Grid container padding={4}>
                            <Grid container justifyContent="center" marginBottom={4}>
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    badgeContent={
                                        <Tooltip title="Cập nhật ảnh đại diện" placement="right" arrow>
                                            <SmallAvatar className={cx('buttonEdit')} alt="Remy Sharp">
                                                <IconButton size="small" component="label" variant="contained">
                                                    <EditIcon sx={{ fontSize: 16 }} />
                                                    <input
                                                        hidden
                                                        onChange={handleChangeImageGroup}
                                                        accept="image/*"
                                                        type="file"
                                                    />
                                                </IconButton>
                                            </SmallAvatar>
                                        </Tooltip>
                                    }
                                >
                                    <Avatar sx={{ width: 80, height: 80 }} alt="Avata" src={urlImage} />
                                </Badge>
                            </Grid>
                            <Grid container direction={'column'} padding={1}>
                                <FormControl>
                                    <FormLabel>Số điện thoại</FormLabel>
                                    <TextField size="small" value={currentUser?.phoneNumber} disabled />
                                </FormControl>
                            </Grid>
                            <Grid
                                container
                                direction={'column'}
                                padding={1}
                                paddingBottom={3}
                                borderBottom={1}
                                borderColor={'#c4c4c4'}
                            >
                                <FormControl>
                                    <FormLabel>Tên người dùng</FormLabel>
                                    <TextField
                                        size="small"
                                        value={inputName}
                                        onChange={handleInputName}
                                        variant="outlined"
                                    />
                                </FormControl>
                            </Grid>
                            <div className={cx('bg-btn')} onClick={() => setUIChangePw(true)}>
                                <span className={cx('tt-btn')}>Thay đổi mật khẩu</span>
                            </div>
                        </Grid>
                    )}

                    <Grid container justifyContent="flex-end" padding={1} borderTop={2} borderColor={'#c4c4c4'}>
                        {uiChangePw ? <></>
                            : <Button onClick={handleClickApply}>Xác Nhận</Button>
                        }
                        <Button color="error" onClick={handleCloseModal}>
                            Thoát
                        </Button>
                    </Grid>
                </Grid>
            </Modal>
        </div>
    );
}
