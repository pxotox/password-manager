import { Key } from "@mui/icons-material";
import { Avatar, Box, Button, Card, CardContent, CardHeader, Link, TextField, Typography } from "@mui/material";
import { Component } from "react";

class GoogleCredentials extends Component {
  constructor(props) {
    super(props)

    this.state = {
      apiKey: '',
      clientId: ''
    }

    this.handleSave = this.handleSave.bind(this)
    this.handleChangeApiKey = this.handleChangeApiKey.bind(this)
    this.handleChangeClientId = this.handleChangeClientId.bind(this)
  }

  handleChangeApiKey(e) {
    console.log("hey")
    this.setState({apiKey: e.target.value})
  }

  handleChangeClientId(e) {
    this.setState({clientId: e.target.value})
  }

  handleSave() {
    this.props.onSaveCredentials(this.state.apiKey, this.state.clientId)
  }

  render() {
    return <Card>
      <CardHeader
        title="Google credentials"
        avatar={<Avatar><Key /></Avatar>}
      />
      <CardContent>
        <Typography mb={2} variant="body2">
          Please provide an API Key and Client ID for the app to consume Google APIs and store your credentials in your Google account. This allows you to have full control over your data.
        </Typography>
        <Typography mb={2} variant="body2">
          To get an API Key and Client ID you need to access the <Link href='https://console.cloud.google.com/apis/credentials' target={"_blank"}>Google Cloud credentials</Link> page.
        </Typography>
        
        <TextField value={this.state.apiKey} onChange={this.handleChangeApiKey} label="API Key" fullWidth  sx={{mb: 2}} />
        <TextField value={this.state.clientId} onChange={this.handleChangeClientId} label="Client ID" fullWidth  sx={{mb: 2}} />
        <Box align="right">
          <Button variant="contained" onClick={this.handleSave}>Test and save</Button>
        </Box>
      </CardContent>
    </Card>
  }
}

export default GoogleCredentials