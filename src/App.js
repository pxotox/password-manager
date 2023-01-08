import { Backdrop, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Fab, TextField } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NavigationBar from './components/NavigationBar';
import GoogleCredentials from './components/GoogleCredentials';
import { useEffect, useState } from 'react';
import GoogleLibraries from './components/GoogleLibraries';
import GoogleLogin from './components/GoogleLogin';
import GoogleDriveSelectFile from './components/GoogleDriveSelectFile';
import MasterPassword from './components/MasterPassword';
import CryptoJS from 'crypto-js'
import { v4 as uuid } from 'uuid';
import PasswordList from './components/PasswordList';
import DetailView from './components/DetailView';
import EditView from './components/EditView';
import { Add } from '@mui/icons-material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [currentView, setCurrentView] = useState(null)
  const [googleLibrariesLoaded, setGoogleLibrariesLoaded] = useState(false)
  const [googleCredentials, setGoogleCredentials] = useState(JSON.parse(localStorage.getItem("googleCredentials")))
  const [googleAccessToken, setGoogleAccessToken] = useState(JSON.parse(localStorage.getItem("googleAccessToken")))
  const [userProfile, setUserProfile] = useState(null)
  const [loginCallback, setLoginCallback] = useState(null)
  const [googleDriveFile, setGoogleDriveFile] = useState(JSON.parse(localStorage.getItem("googleDriveFile")))
  const [encryptedPasswords, setEncryptedPasswords] = useState(null)
  const [masterPassword, setMasterPassword] = useState(null)
  const [passwordList, setPasswordList] = useState(null)
  const [detailViewItem, setDetailViewItem] = useState(null)
  const [editViewItem, setEditViewItem] = useState(null)
  const [updateList, setUpdateList] = useState([])
  const [uploadingList, setUploadingList] = useState(false)
  const [isChangeMasterPasswordOpen, setIsChangeMasterPasswordOpen] = useState(false)
  const [newMasterPassword, setNewMasterPassword] = useState('')
  const [newMasterPasswordConfirmation, setNewMasterPasswordConfirmation] = useState('')

  useEffect(() => {
    if (googleCredentials === null) setCurrentView("GOOGLE_CREDENTIALS")
    else if (googleLibrariesLoaded) {
      if (googleAccessToken === null) setCurrentView("GOOGLE_LOGIN")
      else if (userProfile === null) fetchUser()
      else if (googleDriveFile === null) setCurrentView("SELECT_FILE")
      else if (encryptedPasswords === null) readFileFromDrive(googleDriveFile)
      else if (masterPassword === null) setCurrentView("INPUT_PASSWORD")
      else if (passwordList === null) decryptPasswords()
      else if (editViewItem !== null) setCurrentView("EDIT_VIEW")
      else if (detailViewItem !== null) setCurrentView("DETAIL_VIEW")
      else setCurrentView("PASSWORD_LIST")
    }
    else setCurrentView(null)
  }, [googleCredentials, googleAccessToken, googleLibrariesLoaded, userProfile, googleDriveFile, encryptedPasswords, masterPassword, passwordList, detailViewItem, editViewItem])

  useEffect(() => {
    localStorage.setItem("googleCredentials", JSON.stringify(googleCredentials))
  }, [googleCredentials])

  useEffect(() => {
    localStorage.setItem("googleAccessToken", JSON.stringify(googleAccessToken))
  }, [googleAccessToken])

  useEffect(() => {
    localStorage.setItem("googleDriveFile", JSON.stringify(googleDriveFile))
  }, [googleDriveFile])

  const fetchUser = async () => {
    console.log("[fetchUser] Checking if access token is valid")
    try {
      const response = await window.gapi.client.drive.about.get({
        'fields': 'user'
      });
      if (response.status === 200) {
        setUserProfile(response.result.user)
      }
    } catch (err) {
      console.log("[fetchUser] Failed to get user")
      setGoogleAccessToken(null)
    }
  }

  const readFileFromDrive = async (fileId) => {
    try {
      console.log("[readFileFromDrive] Readring file", fileId)
      const response = await window.gapi.client.drive.files.get({
        'fileId': fileId,
        'alt': 'media'
      });

      setEncryptedPasswords(response.body)
    } catch (err) {
      setGoogleDriveFile(null)
      console.log("[readFileFromDrive] Error reading file from Google Drive", err)
    }
  }

  const updateFileContent = (fileId, contentBlob, callback) => {
    console.log("Uploading content")
    var xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    xhr.onreadystatechange = () => {
      if (xhr.readyState != XMLHttpRequest.DONE) return
      callback(xhr.response)
    }
    xhr.open('PATCH', 'https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media')
    xhr.setRequestHeader('Authorization', 'Bearer ' + window.gapi.auth.getToken().access_token)
    xhr.send(contentBlob)
  }

  const updateFileInDrive = () => {
    if (uploadingList || updateList.length === 0) return
    console.log("Updating list in drive")
    setUploadingList(true)

    const data = updateList.shift()
    setUpdateList(updateList)

    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data, null, 4), masterPassword)
    const contentBlob = new Blob([encryptedData.toString(CryptoJS.enc.base64)], {'type': 'text/plain'})
    updateFileContent(googleDriveFile, contentBlob, (res) => {
      console.log("File updated successfully")
      setUploadingList(false)
      updateFileInDrive()
    })
  }

  useEffect(() => {
    if (updateList.length > 0) {
      updateFileInDrive()
    }
  }, [updateList])

  const decryptPasswords = () => {
    try {
      const decryptedData = CryptoJS.AES.decrypt(encryptedPasswords, masterPassword)
      const passwordList = JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8))
      if (Array.isArray(passwordList)) setPasswordList(passwordList)
      else setMasterPassword(null)
    } catch (error) {
      setMasterPassword(null)
    }
  }

  const resetAll = () => {
    setGoogleAccessToken(null)
    setGoogleCredentials(null)
    setGoogleLibrariesLoaded(false)
    setPasswordList(null)
    setMasterPassword(null)
    setEncryptedPasswords(null)
    setGoogleDriveFile(null)
    setGoogleAccessToken(null)
    setUserProfile(null)
    setDetailViewItem(null)
    setEditViewItem(null)
  }

  const saveGoogleCredentials = (apiKey, clientId) => setGoogleCredentials({apiKey: apiKey, clientId: clientId})
 
  const onLibrariesLoaded = (callback) => {
    setLoginCallback({ fn: callback })
    setGoogleLibrariesLoaded(true)
  }
  const onLibrariesError = () => resetAll()
  const onAccessTokenChange = (accessToken) => setGoogleAccessToken(accessToken)
  const handleLoginOnClick = () => loginCallback.fn()
  const handleSelectFile = (fileId) => setGoogleDriveFile(fileId)
  const handleMasterPasswordChange = (password) => setMasterPassword(password)
  const handleItemClick = (item) => setDetailViewItem(item)
  const handleDetailViewBack = () => setDetailViewItem(null)
  const handleEditClick = () => setEditViewItem(detailViewItem)
  const handleDeleteClick = (item) => {
    const newPasswordList = passwordList.filter((listItem) => item.id !== listItem.id)
    setPasswordList(newPasswordList)
    //setUpdateList([...updateList, newPasswordList])
    setDetailViewItem(null)
  }
  const handleEditViewCancel = () => setEditViewItem(null)
  const handleEditViewSave = (item) => {
    let found = false
    const newPasswordList = passwordList.map((listItem) => {
      if (listItem.id === item.id) {
        found = true
        return item
      }
      return listItem
    })
    if (!found) newPasswordList.push(item)

    setPasswordList(newPasswordList)
    setUpdateList([...updateList, newPasswordList])
    setDetailViewItem(item)
    setEditViewItem(null)
  }

  const handleAdd = () => {
    setEditViewItem({id: uuid(), Name: "", Username: "", _Password: "" })
  }

  const logout = () => {
    setGoogleAccessToken(null)
    setUserProfile(null)
    setPasswordList(null)
    setMasterPassword(null)
    setEncryptedPasswords(null)
    setGoogleDriveFile(null)
    setDetailViewItem(null)
    setEditViewItem(null)    
  }

  const handleChangeMasterPassword = () => {
    if (newMasterPassword === newMasterPasswordConfirmation) {
      setIsChangeMasterPasswordOpen(false)
      setMasterPassword(newMasterPassword)
      setUpdateList([...updateList, passwordList])
    }
  }

  const handleChangeMasterPasswordClick = () => {
    setNewMasterPassword('')
    setNewMasterPasswordConfirmation('')
    setIsChangeMasterPasswordOpen(true)
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container>
        <NavigationBar userProfile={userProfile} onLogoutClick={logout} onResetClick={resetAll} onChangeMasterPasswordClick={handleChangeMasterPasswordClick} />

        <Fab color="secondary" onClick={handleAdd} sx={{ margin: 0, top: 'auto', right: 20, bottom: 20, left: 'auto', position: 'fixed' }}>
          <Add />
        </Fab>

        {currentView === "GOOGLE_CREDENTIALS" && <GoogleCredentials onSaveCredentials={saveGoogleCredentials} />}
        {currentView === "GOOGLE_LOGIN" && <GoogleLogin onClick={handleLoginOnClick} />}
        {currentView === "SELECT_FILE" && <GoogleDriveSelectFile onSelectFile={handleSelectFile} />}
        {currentView === "INPUT_PASSWORD" && <MasterPassword onSubmit={handleMasterPasswordChange} />}
        {currentView === "PASSWORD_LIST" && <PasswordList list={passwordList} onItemClick={handleItemClick} />}
        {currentView === "DETAIL_VIEW" && detailViewItem && <DetailView item={detailViewItem} onBack={handleDetailViewBack} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />}
        {currentView === "EDIT_VIEW" && editViewItem && <EditView item={editViewItem} onCancel={handleEditViewCancel} onSave={handleEditViewSave} />}

        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={currentView === null}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Dialog open={isChangeMasterPasswordOpen} onClose={() => setIsChangeMasterPasswordOpen(false)}>
          <DialogTitle>Change master password</DialogTitle>
          <DialogContent>
            <TextField
              onChange={(e) => setNewMasterPassword(e.target.value)}
              type="password"
              margin="dense"
              value={newMasterPassword}
              autoFocus
              label="New master password"
              fullWidth
            />
            <TextField
              onChange={(e) => setNewMasterPasswordConfirmation(e.target.value)}
              type="password"
              margin="dense"
              value={newMasterPasswordConfirmation}
              autoFocus
              label="New master password confirmation"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsChangeMasterPasswordOpen(false)}>Cancel</Button>
            <Button onClick={handleChangeMasterPassword}>Save</Button>
          </DialogActions>
        </Dialog>

        {googleCredentials && <GoogleLibraries credentials={googleCredentials} accessToken={googleAccessToken} onLoad={onLibrariesLoaded} onError={onLibrariesError} onAccessTokenChange={onAccessTokenChange} />}

      </Container>
    </ThemeProvider>
  );
}

export default App;
