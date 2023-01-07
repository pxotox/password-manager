import './App.css';
import 'bulma/css/bulma.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faUserLock } from '@fortawesome/fontawesome-free-solid'
import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import CryptoJS from 'crypto-js'
import Card from './components/Card'
import Edit from './components/Edit'

function App() {
  const [searchTerm, settSearchTerm] = useState('')
  const [editItem, setEditItem] = useState()
  const [list, setList] = useState([])
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false)
  const [googleGsiLoaded, setGoogleGsiLoaded] = useState(false)
  const [accessToken, setAccessToken] = useState(JSON.parse(window.localStorage.getItem("googleToken")))
  const [fileList, setFileList] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [encryptedPasswords, setEncryptedPasswords] = useState(null)
  const [needUpdate, setNeedUpdate] = useState(false)
  const [tokenClient, setTokenClient] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isFechingUser, setIsFecthingUser] = useState(false)
  const [needLogin, setNeedLogin] = useState(false)
  const [masterPasswordValue, setMasterPasswordValue] = useState(null)
  const [masterPassword, setMasterPassword] = useState(null)

  const CLIENT_ID = '736779789478-rhpu58147alophaijnf4s2j0kuf59g9l.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyB_IdvfkFK4Ehvbz4tuuVUrUVDXKkNIMIU';

  function updateFileContent(fileId, contentBlob, callback) {
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

  useEffect(() => {
    if (user !== null && selectedFile === null) {
      getFilesFromDrive()
    }
  }, [user])

  useEffect(() => {
    if (needUpdate) {
      console.log("Updating file in Google Drive")
      let encryptedData = CryptoJS.AES.encrypt(JSON.stringify(list, null, 4), masterPassword)
      let contentBlob = new  Blob([encryptedData.toString(CryptoJS.enc.base64)], {
        'type': 'text/plain'
      })
      updateFileContent(selectedFile.id, contentBlob, (res) => {
        console.log("File updated successfully")
      })
      setNeedUpdate(false)
    }
  }, [needUpdate])

  useEffect(() => {
    if (document.querySelector('script#gapi-script') === null) {
      console.log("[GAPI] Injecting Google API client library")
      const script = document.createElement('script')
      script.id = 'gapi-script'
      script.src = 'https://apis.google.com/js/api.js'
      script.async = true
      script.defer = true
      script.onload = () => {
        window.gapi.load('client', () => {
          window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          }).then(() => {
            if (accessToken) {
              console.log("[GAPI] Access token already available, setting in client")
              window.gapi.client.setToken(accessToken)
            }
            console.log("[GAPI] Library fully injected")
            setGoogleApiLoaded(true)  
          })
        });
      }
      document.body.append(script)
    }

    if (document.querySelector('script#gsi-script') === null) {
      console.log("[GSI] Injecting Google authentication library")
      const script = document.createElement('script')
      script.id = 'gsi-script'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        const tc = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive',
          callback: (resp) => {
            if (resp.error !== undefined) {
              console.log("[GSI] ", resp.error)
            } else {
              window.localStorage.setItem("googleToken", JSON.stringify(window.gapi.client.getToken()))
              setAccessToken(window.gapi.client.getToken())
              fetchUser()
            }
          }
        });
  
        setTokenClient(tc)
        console.log("[GSI] Library fully injected")
        setGoogleGsiLoaded(true)
      }
      document.body.append(script)
    }
  }, []);

  useEffect(() => {
    setIsLoading(!(googleApiLoaded && googleGsiLoaded))
  }, [googleApiLoaded, googleGsiLoaded])


  const fetchUser = async () => {
    if (accessToken === null) {
      setNeedLogin(true)
    } else {
      console.log("[fetchUser] Checking if access token is valid")
      try {
        setIsFecthingUser(true)
        const response = await window.gapi.client.drive.about.get({
          'fields': 'user'
        });
        setIsFecthingUser(false)
        if (response.status === 200) {
          setUser(response.result.user)
          setSelectedFile(JSON.parse(window.localStorage.getItem("selectedFile")))
          console.log("[fetchUser] User successfully fetched")
          setNeedLogin(false)
        } else {
          setNeedLogin(true)
        }
      } catch (err) {
        setIsFecthingUser(false)
        setNeedLogin(true)
      }
    }
  }

  useEffect(() => {
    if (!isLoading && user === null && isFechingUser === false) {
      fetchUser()
    }
  }, [isLoading])

  useEffect(() => {
    if (window.gapi) {
      window.gapi.client.setToken(accessToken)
      fetchUser()
    }
  }, [accessToken])

  useEffect(() => {
    if (selectedFile) {
      window.localStorage.setItem("selectedFile", JSON.stringify(selectedFile))
      readFileFromDrive(selectedFile.id)
    }
  }, [selectedFile])

  useEffect(() => {
    if (masterPassword && encryptedPasswords) {
      const decryptedData = CryptoJS.AES.decrypt(encryptedPasswords, masterPassword)
      setList(JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8)))
    }
  }, [masterPassword])

  const readFileFromDrive = async (fileId) => {
    try {
      console.log("[readFileFromDrive] Readring file", fileId)
      const response = await window.gapi.client.drive.files.get({
        'fileId': fileId,
        'alt': 'media'
      });

      setEncryptedPasswords(response.body)
    } catch (err) {
      setSelectedFile(null)
      console.log("[readFileFromDrive]", err)
    }
  }

  const findItemById = (id) => {
    let indexfound = null

    list.every((item, index) => {
      if (item.id === id) {
        indexfound = index
        return false
      }
      return true
    })

    return [indexfound !== null ? list[indexfound] : null, indexfound]
  }

  const handleChangeItem = (item) => {
    let data = [...list]

    let [listItem, index] = findItemById(item.id)
    if (listItem) data[index] = item
    else data.push(item)

    setList(data)
    setEditItem(null)
    setNeedUpdate(true)
  }

  const handleCancel = () => {
    setEditItem(null)
  }

  const addNewItem = () => {
    if (!editItem) setEditItem({id: uuid(), Name: "", Username: "", _Password: "" })
  }

  const handleEditItem = (id) => {
    list.forEach((listItem, index) => {
      if (listItem.id === id) {
        setEditItem(list[index])
      }
    })
  }

  const handleDeleteItem = (id) => {
    setList(list.filter((listItem, index) => listItem.id !== id))
    setNeedUpdate(true)
  }

  const handleSearch = (e) => {
    settSearchTerm(e.target.value.toLowerCase())
  }

  const getFilterestList = () => {
    return list.filter((item) => {
      return (searchTerm.length <= 0) || (('Name' in item) && item.Name.toLowerCase().includes(searchTerm))
    })
  }

  const getFilesFromDrive = async () => {
    try {
      console.log("[getFilesFromDrive] Getting file list from Google Drive")
      const response = await window.gapi.client.drive.files.list({
        'pageSize': 10
      });
      const files = response.result.files;
      setFileList(files)
    } catch (err) {
      console.log("[getFilesFromDrive]", err)
    }
  }

  const handleLoginClick = () => {
    tokenClient.requestAccessToken({prompt: ''});
  }

  const logout = () => {
    setAccessToken(null)
    setUser(null)
    setSelectedFile(null)
    setList([])
    setFileList([])
    setEncryptedPasswords(null)
    setMasterPassword(null)
    window.localStorage.removeItem("googleToken")
    window.localStorage.removeItem("selectedFile")
    setNeedLogin(true)
  }

  const handlePasswordChange = (e) => {
    setMasterPasswordValue(e.target.value)
  }

  const handlePasswordSubmit = (e) => {
    setMasterPassword(masterPasswordValue)
    e.preventDefault()
  }

  return (
    <div className="App container">
      { isLoading && <div className="block has-text-centered">Loading...</div> }
      { isFechingUser && <div className="block has-text-centered">Fetching user...</div> }


      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item" href="#">
            Manager
          </a>

          <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div id="navbarBasicExample" className="navbar-menu">
          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                { masterPassword && <button className="button is-primary" onClick={addNewItem}>
                  <strong>New</strong>
                </button> }
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      { needLogin && <button onClick={handleLoginClick}>Log in</button> }
      
      { user && !selectedFile &&
        <table className="table">
          <tbody>
          {fileList.map((file, k) => {
            return <tr key={file.id}>
              <td>{file.id}</td>
              <td>{file.name}</td>
              <td><button onClick={() => setSelectedFile(file)}>Use</button></td>
            </tr>
          })}
          </tbody>
        </table>
      }

      { editItem && masterPassword && <Edit item={editItem} onChange={handleChangeItem} onCancel={handleCancel} /> }
      
      { encryptedPasswords && !masterPassword && <form className="field" onSubmit={handlePasswordSubmit}>
        <p className="control has-icons-right">
          <input className="input" type="password" placeholder="Type your master password" onChange={handlePasswordChange} />
          <span className="icon is-small is-right">
            <FontAwesomeIcon icon={faUserLock} />
          </span>
        </p>
      </form> }


      { list && list.length > 0 && <div className="field">
        <p className="control has-icons-right">
          <input className="input" type="email" placeholder="Search..." onChange={(e) => handleSearch(e)} />
          <span className="icon is-small is-right">
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </p>
      </div> }

      {getFilterestList().map((item, k) => <Card key={k} item={item} onEditClick={handleEditItem} onDeleteClick={handleDeleteItem} />)}

      { selectedFile &&
        <div>
          <p>{selectedFile.name} - {selectedFile.id}</p>
        </div>
      }
      { user &&
        <div>
          <p>Logged as {user.displayName} ({user.emailAddress}) <button onClick={logout}>Logout</button></p>
        </div>
      }
    </div>
  );
}

export default App;
