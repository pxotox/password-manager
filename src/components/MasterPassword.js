import { Password } from "@mui/icons-material";
import { Alert, Avatar, Box, Button, Card, CardContent, CardHeader, TextField } from "@mui/material";
import { Component } from "react";

class MasterPassword extends Component {
  constructor(props) {
    super(props)
    this.state = {
      password: ""
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  handleChange(e) {
    this.setState({password: e.target.value})
  }

  handleKeyDown(e) {
    if (e.key === "Enter") this.handleClick()
  }

  handleClick() {
    this.props.onSubmit(this.state.password)
  }

  render() {
    return <Card>
    <CardHeader
      avatar={
        <Avatar><Password /></Avatar>
      }
      title="Enter your master password"
    />
    <CardContent>
      <TextField label="Master password" type="password" autoFocus fullWidth value={this.state.password} onKeyDown={this.handleKeyDown} onChange={this.handleChange} />
      <Box align="right" sx={{ mt: 2 }}>
        <Button variant="contained" onClick={this.handleClick}>Submit</Button>
      </Box>
    </CardContent>
  </Card>
  }
}

export default MasterPassword
