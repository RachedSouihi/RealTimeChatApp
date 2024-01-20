import React from "react";
import { useUserData } from "./userDataContext";
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Slider, Stack } from "@mui/material";
import { styled } from '@mui/material/styles'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
//import ReactCrop from "react-image-crop";



export default function Chat() {

    const [selectedImage, setSelectedImage] = React.useState(null);
    const [imagePreview, setImagePreview] = React.useState(null);
    const [chooseProfilePic, setChooseProfilePic] = React.useState(true)

    const [imgPos, setImgPos] = React.useState({ x: 0, y: 0 })
    const [imgSize, setImgSize] = React.useState(100)

    const useUser = useUserData();
    const userDatalocalStorage = localStorage.getItem('userData');
    let userData;
    if (userDatalocalStorage) {
        userData = JSON.parse(userDatalocalStorage)
    }

    console.log(userData)

    React.useEffect(() => {
        const dataObj = {
            firstname: "Rached",
            lastname: "Souihi",
            email: "souihiraached@gmail.com",
            password: "12345678",
            dateOfBirth: "",
            dialingCode: "216",
            phone: "20437407",
            country: "Tunisia",
            aboutYourself: "Software Engineer, God Willing",
            firstTime: true,
        }

        localStorage.setItem('userData', JSON.stringify(dataObj))

    }, [])

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file)
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };


        if (file) {
            reader.readAsDataURL(file);
            setChooseProfilePic(false)
        } else {
            setImagePreview(null);
        }
    }


    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });


    const saveProfilePicture = () => {
        fetch('http://127.0.0.1:5000/updateProfilePic', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                email: userData.email,
                picture: imagePreview,
                imagePosition: imgPos,
                imageZoom: imgSize
            })
        })
    }


    return (
        <Grid>
            {
                (useUser.userData.firstTime || (userData && userData.firstTime)) &&
                <Dialog
                    open={chooseProfilePic}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        Make a profile picture
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            You can now choose your profile picture, or if you want make it later.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setChooseProfilePic(false); useUser.setUserData(prevData => ({ ...prevData, firstTime: false })); localStorage.setItem('userData', JSON.stringify(useUser.userData)) }}
                        >Make it later</Button>
                        <Button component="label" variant="text" startIcon={<CloudUploadIcon />}>
                            Upload image
                            <VisuallyHiddenInput type="file" accept="image/*" onChange={handleImageChange} />
                        </Button>
                    </DialogActions>
                </Dialog>

            }

            {
                imagePreview &&
                <Grid>
                    <Box width={{ xs: '200px', sm: '250px', md: '350px' }} height={{ xs: '200px', sm: '250px', md: '350px' }} style={{
                        margin: 'auto',
                        backgroundImage: `url(${imagePreview})`,
                        border: '1px solid #000',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundSize: `${imgSize}%`,
                        backgroundPosition: `${imgPos.x}% ${imgPos.y}%`


                        // Ensure the image stays within the rounded borders
                    }} />


                    <Stack direction='column'>

                        <Slider
                            size="small"
                            defaultValue={50}
                            min={0}
                            max={100}

                            aria-label="Small"
                            style={{
                                width: '200px',
                                margin: 'auto'
                            }}
                            valueLabelDisplay="auto"
                            onChange={(e) => setImgPos(prevPos => ({ ...prevPos, y: e.target.value }))}
                        />
                        <Slider
                            style={{
                                width: '200px',
                                margin: 'auto'
                            }}
                            size="small"
                            defaultValue={50}
                            min={0}
                            max={100}
                            aria-label="Small"
                            valueLabelDisplay="auto"
                            onChange={(e) => setImgPos(prevPos => ({ ...prevPos, x: e.target.value }))}
                        />
                        <Slider
                            style={{
                                width: '200px',
                                margin: 'auto'
                            }}
                            size="small"
                            defaultValue={100}
                            min={100}
                            max={1000}
                            aria-label="Small"
                            valueLabelDisplay="auto"
                            onChange={(e) => setImgSize(e.target.value)}
                        />
                    </Stack>
                    <Box textAlign='center'>
                        <Button type="button" variant="outlined" onClick={saveProfilePicture}>Save</Button>
                    </Box>

                </Grid>

            }


        </Grid>
    )
}