import React from "react";
import { useUserData } from "./userDataContext";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from "@mui/material";
import { styled } from '@mui/material/styles'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'



export default function Chat() {


    const useUser = useUserData();
    const userDatalocalStorage = localStorage.getItem('userData');
    const [chooseProfilePic, setChooseProfilePic] = React.useState(true)
    let userData;
    if (userDatalocalStorage) {
        userData = JSON.parse(userDatalocalStorage)
    }

    console.log(userData)


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


    return (
        <Grid>
            {
                (useUser.userData.firstTime || (userData && userData.firstTime)) &&
                <Dialog
                    open={chooseProfilePic}
                    onClose={() => setChooseProfilePic(false)}
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
                        <Button onClick={() => setChooseProfilePic(false)}
                        >Make it later</Button>
                        <Button component="label" variant="text" startIcon={<CloudUploadIcon />}>
                            Upload image
                            <VisuallyHiddenInput type="file" accept="image/*" />
                        </Button>
                    </DialogActions>
                </Dialog>

            }
        </Grid>
    )
}