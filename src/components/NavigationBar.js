import { AccountCircle } from "@mui/icons-material";
import { AppBar, Avatar, Divider, IconButton, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Component } from "react";

class NavigationBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      anchorEl: null
    }

    this.handleMenu = this.handleMenu.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleLogoutClick = this.handleLogoutClick.bind(this)
    this.handleResetClick = this.handleResetClick.bind(this)
    this.handleChangeMasterPasswordClick = this.handleChangeMasterPasswordClick.bind(this)
  }

  handleMenu(event) {
    this.setState({anchorEl: event.currentTarget})
  }

  handleClose() {
    this.setState({anchorEl: null})
  }

  handleLogoutClick() {
    this.handleClose()
    this.props.onLogoutClick()
  }

  handleResetClick() {
    this.handleClose()
    this.props.onResetClick()
  }

  handleChangeMasterPasswordClick() {
    this.handleClose()
    this.props.onChangeMasterPasswordClick()    
  }

  render () {
    return <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        Password manager
      </Typography>
      { this.props.userProfile &&
        <Box>
          <IconButton color="inherit" onClick={this.handleMenu}>
            { this.props.userProfile.photoLink ? <Avatar alt={this.props.userProfile.displayName} src={this.props.userProfile.photoLink} /> : <AccountCircle />}
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={this.state.anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleClose}
          >
            <MenuItem disabled>{this.props.userProfile.displayName}</MenuItem>
            <Divider />
            <MenuItem onClick={this.handleChangeMasterPasswordClick}>Change master password</MenuItem>
            <MenuItem onClick={this.handleLogoutClick}>Logout</MenuItem>
            <MenuItem onClick={this.handleResetClick}>Reset everything</MenuItem>
          </Menu>
        </Box>
      }
    </Toolbar>
  </AppBar>
  }
}

export default NavigationBar