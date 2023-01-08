import { Login } from "@mui/icons-material";
import { Avatar, Button, Card, CardContent, CardHeader } from "@mui/material";
import { Component } from "react";

class GoogleLogin extends Component {
	render() {
		return <Card>
			<CardHeader
				avatar={
					<Avatar><Login /></Avatar>
				}
				title="Sign in to your Google account"
			/>
			<CardContent align="center">
				<Button variant="contained" onClick={this.props.onClick}>Sign in to Google</Button>
			</CardContent>
		</Card>
	}
}

export default GoogleLogin
