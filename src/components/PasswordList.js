import { Password } from "@mui/icons-material";
import { Avatar, List, ListItemAvatar, ListItemButton, ListItemText, TextField, Card, CardContent } from "@mui/material";
import { Component } from "react";

class PasswordList extends Component {
	constructor(props) {
		super(props)

		this.state ={
			list: this.props.list,
			searchTerm: ''
		}

		this.getFilterestList = this.getFilterestList.bind(this)
		this.handleChange = this.handleChange.bind(this)
	}

  getFilterestList() {
    return this.state.list.filter((item) => {
      return (this.state.searchTerm.length <= 0) || (('Name' in item) && item.Name.toLowerCase().includes(this.state.searchTerm.toLocaleLowerCase()))
    })
  }

	handleChange(e) {
		this.setState({searchTerm: e.target.value})
	}


	render() {
		return <Card>
			<CardContent>
        <TextField fullWidth label="Type to search" value={this.state.searchTerm} onChange={this.handleChange} />
        <List>
          {this.getFilterestList().map((item) => {
            return <ListItemButton key={item.id} sx={{ width: "100%" }} onClick={() => { this.props.onItemClick(item) }}>
              <ListItemAvatar>
                <Avatar>
                  <Password />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={item.Name} secondary={item.Username} />
            </ListItemButton>
          })}
        </List>
			</CardContent>
		</Card>
	}
}

export default PasswordList
