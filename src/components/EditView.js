import { Add, ArrowBack, Cancel, Clear, Key, KeyOff, MoveDown, MoveUp, Save, Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, Button, ButtonGroup, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material";
import { Component } from "react";

class EditView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isDialogOpen: false,
      newFieldName: '',
      values: Object.entries(this.props.item).map((item) => {
        return {
          name: item[0].replace('_', ''),
          value: item[1],
          secure: item[0].startsWith('_'),
          visible: false
        }
      })
    }

    this.toggleSecure = this.toggleSecure.bind(this)
    this.toggleVisibility = this.toggleVisibility.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleAddNewField = this.handleAddNewField.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
    this.handleMoveDown = this.handleMoveDown.bind(this)
    this.handleMoveUp = this.handleMoveUp.bind(this)
  }

  toggleVisibility(index) {
    this.state.values[index].visible = !this.state.values[index].visible
    this.setState({values: this.state.values})
  }

  toggleSecure(index) {
    this.state.values[index].secure = !this.state.values[index].secure
    this.setState({values: this.state.values})
  }

  handleSave() {
    const item = this.state.values.reduce((map, item) => {
      map[(item.secure ? '_' : '')  + item.name] = item.value;
      return map;
    }, {});
    this.props.onSave(item)
  }

  handleChange(e, index) {
    this.state.values[index].value = e.target.value
    this.setState({values: this.state.values})
  }

  handleAddNewField() {
    this.state.values.push({
      name: this.state.newFieldName,
      value: '',
      secure: false,
      visible: false
    })
    this.setState({isDialogOpen: false, values: this.state.values})
  }

  handleRemove(index) {
    delete this.state.values[index]
    this.setState({values: this.state.values})
  }

  handleMoveUp(index) {
    const item = {...this.state.values[index]}
    this.state.values[index] = this.state.values[index-1]
    this.state.values[index-1] = item
    this.setState({values: this.state.values})
  }

  handleMoveDown(index) {
    const item = {...this.state.values[index]}
    this.state.values[index] = this.state.values[index+1]
    this.state.values[index+1] = item
    this.setState({values: this.state.values})
  }

  render() {
    return <Box>
      <Card>
        <CardHeader
            avatar={
              <IconButton onClick={this.props.onCancel}><ArrowBack /></IconButton>
            }
            title="Editing"
          />
        <CardContent>
          {this.state.values.map((item, index) => {
            if (item.name === "id") return

            return <Box key={index}>
              <FormControl sx={{ mb: 2 }} fullWidth>
                <InputLabel>{item.name}</InputLabel>
                <OutlinedInput
                  onChange={(e) => this.handleChange(e, index) }
                  type={item.secure && !item.visible ? 'password' : 'text'}
                  value={item.value}
                  endAdornment={
                    <InputAdornment position="end">
                      {item.secure && <IconButton
                        onClick={() => this.toggleVisibility(index)}
                        sx={{mr: 0.5}}
                        edge="end"
                      >
                        {item.visible ? <Visibility /> : <VisibilityOff /> }
                      </IconButton>}
                      <IconButton
                        onClick={() => this.toggleSecure(index)}
                        edge="end"
                      >
                        {item.secure ? <KeyOff /> : <Key /> }
                      </IconButton>
                    </InputAdornment>
                  }
                  label={item.name}
                />
              </FormControl>
              <Box align="right" sx={{ mb: 2 }}>
                <ButtonGroup>
                  {index !== 1 && <Button onClick={() => this.handleMoveUp(index)}><MoveUp /></Button>}
                  {index !== (this.state.values.length - 1) && <Button onClick={() => this.handleMoveDown(index)}><MoveDown /></Button>}
                  <Button onClick={() => this.handleRemove(index)}><Clear /></Button>
                </ButtonGroup>
              </Box>
            </Box>
          })}

          <Button color="secondary" variant="contained" startIcon={<Add />} onClick={() => this.setState({newFieldName: '', isDialogOpen: true})}>Add new field</Button>

          <Divider sx={{ mb: 2, mt: 2 }} />
          <Box align="right">
            <Button color="error" variant="outlined" startIcon={<Cancel />} onClick={this.props.onCancel}>Cancel</Button>
            <Button variant="outlined" startIcon={<Save />} sx={{ ml: 1 }} onClick={this.handleSave}>Save</Button>
          </Box>
        </CardContent>
      </Card>
      
      <Dialog open={this.state.isDialogOpen} onClose={() => this.setState({isDialogOpen: false})}>
        <DialogTitle>New field</DialogTitle>
        <DialogContent>
          <TextField
            onChange={(e) => this.setState({newFieldName: e.target.value})}
            margin="dense"
            value={this.state.newFieldName}
            autoFocus
            label="Name of the field"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({isDialogOpen: false})}>Cancel</Button>
          <Button onClick={this.handleAddNewField}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  }
}

export default EditView
