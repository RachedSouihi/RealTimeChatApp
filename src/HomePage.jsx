import * as React from 'react'
import { AppBar, Box, Button, Container, Grid, Toolbar, Typography, FormControl, InputLabel, OutlinedInput, InputAdornment, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Avatar, Slider, Snackbar, Alert } from '@mui/material'
import TextField from '@mui/material/TextField';
import { styled } from '@mui/system';
import { styled as styl } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import InfoIcon from '@mui/icons-material/Info'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { useTheme } from '@mui/material/styles';
import {Link, useNavigate} from 'react-router-dom'

import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import logo from './images/logo.png'
import img1 from './images/img1.jpg'
import img2 from './images/480_F_547445483_E1OEKSvVV8Vl0oHBL8NBpaZkVnOaaygXagg.jpg'

import hearts from './images/hearts.png';

import './App.css'
import AvatarEditor from 'react-avatar-editor';
import { useUserData } from './userDataContext';

const allFields = [['firstName', 'lastName', 'country'], ['email', 'emailConf', 'password', 'passwordConf']];



export default function HomePage() {
    const [activeStep, setActiveStep] = React.useState(0);
    const [confirmationCode, setConfirmationCode] = React.useState([-1, -1, -1, -1, -1, -1])
    const [confCodeResp, setConfCodeResp] = React.useState({success: false, message: ""});
    const [token, setToken] = React.useState(null)
    const prevStep = React.useRef(null);
    const [showPassword, setShowPassword] = React.useState(false);
    const [screenWidth, setScreenWidth] = React.useState(window.innerWidth);
    const [loading, setLoading] = React.useState(true);
    const [imgPos, setImgPos] = React.useState({ x: 0.5, y: 0.5 })


    const [allFieldError, setAllFieldError] = React.useState(allFields);

    const theme = useTheme();
    const navigate = useNavigate();

    const useUser = useUserData();

    const formik = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            country: "",
            dialingCode: "",
            phoneNumber: "",
            aboutYourself: "",
            email: "",
            emailConf: "",
            password: "",
            passwordConf: "",

        },

        validationSchema: Yup.object({
            firstName: Yup.string().min(2).required('First name is required'),
            lastName: Yup.string().min(2).required('Last name is required'),
            //dateOfBirth: Yup.date().required('Date of birth is required'),

            country: Yup.string().required('Country is required'),
            email: Yup.string().email().required('Email is required'),
            emailConf: Yup.string().required("You have to confirm your email").email().test("email diffrent3", "email doesn't match", function (value) {
                return value === this.resolve(Yup.ref('email'))
            }),
            password: Yup.string().min(8).required(),
            passwordConf: Yup.string().test('different password', "Password doesn't match", function (value) {
                return value === this.resolve(Yup.ref("password"))
            })

            //aboutYourself: Yup.string().required('About yourself is required'),
        }),



        onSubmit: (values) => {
            // Handle form submission
            
            fetch("http://127.0.0.1:5000/confirmAccount", {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },

                body: JSON.stringify({ ...values, token: token, number: Number(confirmationCode.join('')) })
            }).then(response => response.json())
                .then(response => {
                    setConfCodeResp(response);
                     if(response.success){
                        useUser.setUserData({...values, firstTime: true});
                        localStorage.setItem('userData', JSON.stringify({...values, firstTime: true}))
                        const timeOutId = setTimeout(() => {
                            navigate('/Chat')
                        }, 3500)



                        
                     }
                    })
            

        },

    })
    function checkIsError(fieldName) {
        if (formik.errors[fieldName]) {
            setAllFieldError(allFieldErr => allFieldErr.map((fieldsByStep, index) => {
                if (index === activeStep)
                    return [...fieldsByStep, fieldName];
                else
                    return fieldsByStep;
            }))
        } else {
            setAllFieldError(allFieldErr => allFieldErr.map((fieldsByStep, index) => {
                if (index === activeStep)
                    return fieldsByStep.filter(field => field !== fieldName);
                else
                    return fieldsByStep;
            }))
        }

    }

    const nextStep = () => {
        if (activeStep === 0) {
            formik.setTouched({
                firstName: true,
                lastName: true,
                country: true,
            });
        } else {
            formik.setTouched({
                email: true,
                emailConf: true,
                password: true,
                passwordConf: true,
            })

        }



        if (!allFieldError[activeStep].length) {
            if (activeStep === 1) {
                sendVerificationCode()
            }
            prevStep.current = activeStep;
            setActiveStep(prevStep => prevStep + 1)

        }


    }

    const previousStep = () => {
        prevStep.current = activeStep;
        setActiveStep(step => step - 1)

    }


    const sendVerificationCode = () => {
        setActiveStep(2)
        fetch('http://127.0.0.1:5000/sendVerifCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({ email: formik.values.email })

        }).then(response => response.json())
            .then(response => { console.log(response.message); setToken(response.token) })

    }
    const handleKeyDown = (e, index) => {
        e.preventDefault();
        const verifCodeInput = document.getElementsByClassName('verif-code');
        if (e.key !== 'Backspace') {
            document.getElementsByClassName('verif-code')[index].value = e.key >= 0 && e.key <= 9 ? e.key : '';
            setConfirmationCode(prevCode => prevCode.map((digit, i) => i === index ? e.key >= 0 && e.key <= 9 ? e.key : -1 : digit))
            if (index + 1 < verifCodeInput.length && e.key >= 0 && e.key <= 9) {

                document.getElementsByClassName('verif-code')[index + 1].focus()

            }
        } else if (e.key === 'Backspace') {
            document.getElementsByClassName('verif-code')[index].value = ''
            setConfirmationCode(prevCode => prevCode.map((digit, i) => i === index ? -1 : digit))
            if (index - 1 >= 0) {
                document.getElementsByClassName('verif-code')[index - 1].focus()

            }
        }


    }





    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const ColorlibConnector = styl(StepConnector)(({ theme }) => ({
        [`&.${stepConnectorClasses.alternativeLabel}`]: {
            top: 22,
        },
        [`&.${stepConnectorClasses.active}`]: {
            [`& .${stepConnectorClasses.line}`]: {
                backgroundImage:
                    'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
            },
        },
        [`&.${stepConnectorClasses.completed}`]: {
            [`& .${stepConnectorClasses.line}`]: {
                backgroundImage:
                    'linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)',
            },
        },
        [`& .${stepConnectorClasses.line}`]: {
            height: 2,
            border: 0,
            backgroundColor:
                theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
            borderRadius: 1,
        },
    }));

    const ColorlibStepIconRoot = styl('div')(({ theme, ownerState }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
        zIndex: 1,
        color: '#fff',
        width: 50,
        height: 50,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        ...(ownerState.active && {
            backgroundImage:
                'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
            boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
        }),
        ...(ownerState.completed && {
            backgroundImage:
                'linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)',
        }),
    }));

    function ColorlibStepIcon(props) {
        const { active, completed, className } = props;


        const icons = {
            1: <InfoIcon />,
            2: <PersonIcon />,
            3: <EmailIcon />,
        };

        return (
            <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
                {icons[String(props.icon)]}
            </ColorlibStepIconRoot>
        );
    }
    const CustomizedButtonNext = styled(Button)(({ }) => ({
        backgroundColor: '#000',
        marginInline: theme.breakpoints.values.sm > screenWidth ? '5px' : '20px',
        padding: '8px 3rem',
        borderRadius: '16px',
        fontSize: theme.breakpoints.values.sm >= screenWidth ? '10px' : ''


    }))
    const CustomizedButtonBack = styled(Button)(({ }) => ({
        backgroundColor: 'transparent',
        color: '#000',
        padding: '8px 3rem',
        borderRadius: '16px',
        fontSize: theme.breakpoints.values.sm >= screenWidth ? '10px' : ''



    }))


    React.useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth)
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])
    const handleXPositionChange = (event, newX) => {
        setImgPos((prevPos) => ({ ...prevPos, x: newX }));
    };

    const handleYPositionChange = (event, newY) => {
        setImgPos((prevPos) => ({ ...prevPos, y: newY }));
    };

    const steps = ['General Info', 'Connection data', 'Check email'];

    return (
        <Grid container >
            <Grid p={screenWidth < theme.breakpoints.values.sm ? theme.spacing(0) : theme.spacing(6)} sx={{
                backgroundImage: "linear-gradient(to bottom, #ffffff, #f5f5f5)",

            }}>
                <AppBar position='static' sx={{ bgcolor: 'white', boxShadow: '0 0 0 0' }} >
                    <Box sx={{
                        bgcolor: "auto",
                    }}>
                        <img src={logo} alt="logo" style={{ display: 'block', maxWidth: '120px' }} />
                    </Box>

                </AppBar>
                <Grid item container >
                    <Grid item md={6}>
                        <Typography variant='h3' p={0} sx={{ marginTop: 7 }}>
                            Join <span style={{ color: '#0038FF', fontWeight: '700' }}>RSChat</span> and unlock a
                            world of possibilities! Let's
                            get started by creating your account


                        </Typography>
                        <Button href='#create-an-account' variant='contained' sx={{ bgcolor: '#000', fontSize: '1.5rem', textTransform: 'capitalize', p: '5px 35px', margin: '7rem 0px', borderRadius: 3 }}>let's start</Button>


                    </Grid>
                    <Grid item md={6}>
                        <Box maxWidth='100%'>
                            <img src={img1} alt="" style={{ display: 'block', width: '100%' }} />
                        </Box>

                    </Grid>




                </Grid>
            </Grid>

            <Grid container item sx={{ bgcolor: '#F5F5F5', }} p={screenWidth < theme.breakpoints.values.sm ? theme.spacing(0) : theme.spacing(6)}>
                <Grid item md={5} sm={12}>
                    <Box maxWidth='600px'>
                        <img src={img2} alt="" style={{ maxWidth: '100%' }} />
                    </Box>
                </Grid>
                <Grid item md={7} sm={12} rowSpacing={0}>
                    <Container maxWidth="md" style={{
                        border: '2px solid #01579b',
                        borderRadius: 5,
                        height: '100%'


                    }}>

                        <Typography variant='h4' id='create-an-account' textAlign={'center'} fontFamily='Inria Sans, sans-serif' mt={2}>
                            Create an account
                        </Typography>
                        <Grid md={12}>
                            <Stack sx={{ width: '100%' }} spacing={4}>
                                <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
                                    {steps.map((label) => (
                                        <Step key={label}>
                                            <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Stack>

                        </Grid>

                        <form onSubmit={formik.handleSubmit}>
                            {
                                activeStep === 0 ?
                                    <Grid item container rowSpacing={2} columnSpacing={1} justifyContent='space-evenly' sx={{
                                        padding: screenWidth <= theme.breakpoints.values.sm ? theme.spacing(0) : theme.spacing(7),


                                    }}>
                                        <Grid item md={6} sm={6} xs={12}>
                                            <TextField id="outlined-basic" onKeyUp={() => checkIsError('firstName')} error={formik.touched.firstName && Boolean(formik.errors.firstName)} helperText={formik.touched.firstName && formik.errors.firstName} label="FirstName" variant="outlined" {...formik.getFieldProps('firstName')} fullWidth />
                                        </Grid>
                                        <Grid item md={6} sm={6} xs={12}>
                                            <TextField id="outlined-basic" onKeyUp={() => checkIsError('lastName')} error={formik.touched.lastName && Boolean(formik.errors.lastName)} helperText={formik.touched.lastName && formik.errors.lastName} label="LastName" variant="outlined" {...formik.getFieldProps('lastName')} fullWidth />
                                        </Grid>
                                        <Grid item md={6} sm={6} xs={12}>
                                            <FormControl fullWidth>
                                                <InputLabel htmlFor="date-of-birth">Date of birth</InputLabel>
                                                <OutlinedInput type='date' {...formik.getFieldProps('dateOfBirth')} error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)} id="date-of-birth" label="Date of birth" startAdornment />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={6} sm={6} xs={12}>
                                            <TextField id="outlined-basic" onKeyUp={() => checkIsError('country')} {...formik.getFieldProps('country')} label="Country" error={formik.touched.country && Boolean(formik.errors.country)} helperText={formik.touched.country && formik.errors.country} variant="outlined" fullWidth />
                                        </Grid>
                                        <Grid item md={3} sm={3} xs={4}>
                                            <FormControl fullWidth>
                                                <InputLabel htmlFor="outlined-adornment-dc">Dialing code</InputLabel>
                                                <OutlinedInput
                                                    id="outlined-adornment-dc"
                                                    startAdornment={<InputAdornment position="start">+</InputAdornment>}
                                                    label="Dialing code"
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item md={9} sm={9} xs={8}>
                                            <TextField id="outlined-basic" label="Phone Number" variant="outlined" fullWidth />
                                        </Grid>
                                        <Grid item md={12} sm={12} xs={12}>
                                            <textarea name="" id="" style={{ width: '100%' }} rows="10" placeholder='About yourself...' />
                                        </Grid>




                                    </Grid>

                                    :

                                    activeStep === 1 ?

                                        <Grid item container rowSpacing={2} columnSpacing={2} p={screenWidth <= theme.breakpoints.values.sm ? 0 : 7} justifyContent='space-evenly'>
                                            <Grid item md={6} sm={12} xs={12}>
                                                <TextField onKeyUp={() => checkIsError('email')} error={formik.touched.email && Boolean(formik.errors.email)} helperText={formik.touched.email && formik.errors.email} label="email" variant="outlined" {...formik.getFieldProps('email')} fullWidth />
                                            </Grid>
                                            <Grid item md={6} sm={12} xs={12}>
                                                <TextField onKeyUp={() => checkIsError('emailConf')} error={formik.touched.emailConf && Boolean(formik.errors.emailConf)} helperText={formik.touched.emailConf && formik.errors.emailConf} label="confirm email" variant="outlined" {...formik.getFieldProps('emailConf')} fullWidth />
                                            </Grid>
                                            <Grid item md={6} sm={12} xs={12}>
                                                <FormControl variant="outlined" fullWidth>
                                                    <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                                    <OutlinedInput
                                                        type={showPassword ? 'text' : 'password'}
                                                        {...formik.getFieldProps('password')}
                                                        error={formik.touched.password && Boolean(formik.errors.password)}
                                                        onKeyUp={() => checkIsError('password')}
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={handleClickShowPassword}
                                                                    onMouseDown={handleMouseDownPassword}
                                                                    edge="end"
                                                                >
                                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        }
                                                        label="Password"
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item md={6} sm={12} xs={12}>
                                                <FormControl variant="outlined" fullWidth>
                                                    <InputLabel htmlFor="outlined-adornment-password">confirm password</InputLabel>
                                                    <OutlinedInput

                                                        type={showPassword ? 'text' : 'password'}
                                                        {...formik.getFieldProps('passwordConf')}
                                                        error={formik.touched.passwordConf && Boolean(formik.errors.passwordConf)}
                                                        onKeyUp={() => checkIsError('passwordConf')}
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={handleClickShowPassword}
                                                                    onMouseDown={handleMouseDownPassword}
                                                                    edge="end"
                                                                >
                                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        }
                                                        label="confirm password"
                                                    />
                                                </FormControl>
                                            </Grid>


                                        </Grid>
                                        :
                                        <Grid mt={5} mb={5} md={12} display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
                                            <Typography variant='h5' textAlign='center'>Verify your email address</Typography>
                                            <Typography variant='subtitle1' width='60%' textAlign={'center'} m='auto'>We emailed you a six-digit code to <span style={{ color: '#283593', fontWeight: 600 }}>{formik.values.email}</span>. You have 5 minutes to enter the code below to confirm your email address</Typography>
                                            <Grid>
                                                <Stack direction='row' spacing={1}>
                                                    <input type='text' onKeyDown={(e) => handleKeyDown(e, 0)} maxLength={1} className='verif-code' />
                                                    <input type='text' onKeyDown={(e) => handleKeyDown(e, 1)} maxLength={1} className='verif-code' />
                                                    <input type='text' onKeyDown={(e) => handleKeyDown(e, 2)} maxLength={1} className='verif-code' />
                                                    <input type='text' onKeyDown={(e) => handleKeyDown(e, 3)} maxLength={1} className='verif-code' />
                                                    <input type='text' onKeyDown={(e) => handleKeyDown(e, 4)} maxLength={1} className='verif-code' />
                                                    <input type='text' onKeyDown={(e) => handleKeyDown(e, 5)} maxLength={1} className='verif-code' />

                                                </Stack>
                                            </Grid>
                                            {confCodeResp.tokenDone === true &&
                                            <Button type='button' variant='text' onClick={() => {
                                                setConfCodeResp({success: false, message: ""})
                                                sendVerificationCode();
                                            }} style={{
                                                marginTop: '10px'
                                                
                                            }}>Resend confirmation code</Button>}
                                        </Grid>

                            }

                            <Grid item textAlign='center' xs={12} alignItems='center' justifyContent='center'>
                                <CustomizedButtonBack type='button' disabled={activeStep === 0 || confCodeResp.success} onClick={previousStep} variant="outlined">Back</CustomizedButtonBack>
                                {activeStep < 2 ?
                                    <CustomizedButtonNext type='button' onClick={nextStep} variant='contained'>Next</CustomizedButtonNext>
                                    : <CustomizedButtonNext type='submit' variant='contained' disabled={confirmationCode.includes(-1) ? true : false || confCodeResp.success}>Verify</CustomizedButtonNext>
                                }
                            </Grid>

                            <Grid sm={12} textAlign='center' mt={4}>
                                <Typography variant='caption'>Already have an account?<Link>Sign </Link></Typography>
                            </Grid>
                            <Snackbar open={confCodeResp.message} onClose={() => setConfCodeResp(resp => ({...resp, message: ""}))}>
                                <Alert
                                    onClose={() => setConfCodeResp(resp => ({...resp, message: ""}))}
                                    severity={confCodeResp.success ? 'success' : 'error'}
                                    variant="filled"
                                    sx={{ width: '100%' }}
                                >
                                    {confCodeResp.message}
                                </Alert>
                            </Snackbar>
                        </form>







                    </Container>
                </Grid>
            </Grid>
        </Grid>
    )
}