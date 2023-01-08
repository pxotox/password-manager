import { Folder, InsertDriveFile } from "@mui/icons-material";
import { Avatar, Card, CardContent, CardHeader, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Component } from "react";

class GoogleDriveSelectFile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      files: null,
      fecthingFiles: false
    }

    this.fetchFiles = this.fetchFiles.bind(this)
  }

  componentDidMount() {
    if (!this.state.fecthingFiles) this.fetchFiles()
  }

  async fetchFiles() {
    try {
      this.setState({fecthingFiles: true})
      console.log("[GoogleDriveSelectFile] Getting file list from Google Drive")
      const response = await window.gapi.client.drive.files.list({
        'pageSize': 10
      });
      const files = response.result.files;
      this.setState({files: files, fecthingFiles: false})
    } catch (error) {
      console.error("[getFilesFromDrive] Error fetching files from Google Drive", error)
    }
  }  

  render() {
    return <Card>
      <CardHeader
        avatar={
          <Avatar><Folder /></Avatar>
        }
        title="Select your password file"
      />
      <CardContent align="center">
        <List>
          {this.state.files && this.state.files.map((file) => {
            return <ListItemButton key={file.id} onClick={() => { this.props.onSelectFile(file.id) }}>
              <ListItemIcon>
                { file.mimeType === "application/vnd.google-apps.folder" ? <Folder /> : <InsertDriveFile /> }
              </ListItemIcon>
              <ListItemText primary={file.name} />
            </ListItemButton>
          })}
        </List>
      </CardContent>
    </Card>
  }
}

export default GoogleDriveSelectFile
