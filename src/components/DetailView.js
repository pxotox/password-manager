import { ArrowBack, Close, Delete, Edit, Visibility, VisibilityOff } from "@mui/icons-material"
import { Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, List, ListItem, ListItemButton, ListItemText, Snackbar } from "@mui/material"
import { Box } from "@mui/system"
import { Component, Fragment } from "react"

class DetailView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      visibilityList: [],
      isDialogOpen: false,
      snackbarOpen: false
    }

    this.copyToClipboard = this.copyToClipboard.bind(this)
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this)
    this.toggleVisibility = this.toggleVisibility.bind(this)
    this.handleConfirmDelete = this.handleConfirmDelete.bind(this)
  }

  toggleVisibility(key) {
    let list = this.state.visibilityList
    if (list.indexOf(key) > -1) list.splice(list.indexOf(key), 1);
    else list.push(key)
    this.setState({visibilityList: list})
  }

  copyToClipboard(value) {
    navigator.clipboard.writeText(value)
    this.setState({snackbarOpen: true})
  }

  handleSnackbarClose(event, reason) {
    if (reason === "clickaway") return
    this.setState({snackbarOpen: false});
  }

  handleConfirmDelete() {
    this.setState({isDialogOpen: false})
    this.props.onDeleteClick(this.props.item)
  }

  render() {
    return <div>
      <Card>
        <CardHeader
          avatar={
            <IconButton onClick={this.props.onBack}><ArrowBack /></IconButton>
          }
          title="Details"
        />
        <CardContent>
          <List>
            {Object.entries(this.props.item).map((value, key) => {
              if (value[0] === "id") return
              const isSecure = value[0].startsWith('_')
              const inVisibilityList = this.state.visibilityList.indexOf(value[0]) === -1
              const content = isSecure &&  inVisibilityList ? 'Content is hidden' : value[1]
              const valueStyle = isSecure &&  inVisibilityList ? {fontStyle: 'italic'} : {whiteSpace: 'pre'}

              return <ListItem
                key={key}
                disablePadding
                secondaryAction={isSecure ?
                  <IconButton edge="end" onMouseDown={(e) => {e.stopPropagation()}} onClick={(e) => { this.toggleVisibility(value[0]) }}>
                    { inVisibilityList ? <Visibility /> : <VisibilityOff />}
                  </IconButton> : null}
                >
                <ListItemButton role={undefined} onClick={() => { this.copyToClipboard(value[1]) }}>
                  <ListItemText secondaryTypographyProps={valueStyle} primary={value[0].replace('_', '')} secondary={content} />                
                </ListItemButton>
                <Divider />
              </ListItem>
            })}
          </List>
          <Box align="right" sx={{ mt: 2 }}>
            <Button variant="outlined" startIcon={<Edit />} onClick={this.props.onEditClick}>Edit</Button>
            <Button variant="outlined" color="error" startIcon={<Delete />} sx={{ ml: 1 }} onClick={() => this.setState({isDialogOpen: true})}>Delete</Button>
          </Box>
        </CardContent>
      </Card>
    
      <Snackbar
        open={this.state.snackbarOpen}
        autoHideDuration={6000}
        onClose={this.handleSnackbarClose}
        message="Copied to clipboard"
        action={
          <Fragment>
            <IconButton color="inherit" onClick={this.handleSnackbarClose}>
              <Close />
            </IconButton>
          </Fragment>
        }
      />
      
      <Dialog open={this.state.isDialogOpen} onClose={() => this.setState({isDialogOpen: false})}>
        <DialogTitle>
          Do you really want to remove this item?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            The item will be removed and the list will be synched, after that the item will not be able to be recovered.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({isDialogOpen: false})}>Cancel</Button>
          <Button onClick={this.handleConfirmDelete} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  }
}

export default DetailView
