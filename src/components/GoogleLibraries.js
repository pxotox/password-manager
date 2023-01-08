import { Component } from "react";


class GoogleLibraries extends Component {
  constructor(props) {
    super(props)

    this.state = {
      gapiLoaded: false,
      gsiLoaded: false,
      fullyLoaded: false,
      tokenClient: null,
    }

    this.onScriptLoad = this.onScriptLoad.bind(this)
    this.onClientLoad = this.onClientLoad.bind(this)
    this.onGsiLoad = this.onGsiLoad.bind(this)
    this.onNewAccessToken = this.onNewAccessToken.bind(this)
    this.loginCallback = this.loginCallback.bind(this)
  }

  componentDidMount() {
    console.log("[GoogleLibraries] Component mounted")

    // Injects GAPI library to the document (used to consume Drive API)
    if (document.querySelector('script#gapi-script') === null) {
      console.log("[GoogleLibraries] Injecting GAPI")
      const script = document.createElement('script')
      script.id = 'gapi-script'
      script.src = 'https://apis.google.com/js/api.js'
      script.async = true
      script.defer = true
      script.onload = this.onScriptLoad
      document.body.append(script)
    }

    // Inject GSI libraty to the document (used to login user)
    if (document.querySelector('script#gsi-script') === null) {
      console.log("[GoogleLibraries] Injecting GSI")
      const script = document.createElement('script')
      script.id = 'gsi-script'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = this.onGsiLoad
      document.body.append(script)
    }
  }

  componentDidUpdate() {
    if (this.state.gsiLoaded && this.state.gapiLoaded && !this.state.fullyLoaded) {
      console.log("[GoogleLibraries] Scripts fully loaded")
      this.setState({fullyLoaded: true})
      this.props.onLoad(this.loginCallback)
    }
  }

  loginCallback() {
    console.log("Someone called callback")
    this.state.tokenClient.requestAccessToken({prompt: ''});    
  }

  onScriptLoad() {
    console.log("[GoogleLibraries] GAPI script loaded, loading client")
    window.gapi.load('client', this.onClientLoad)
  }

  async onClientLoad() {
    try {
      await window.gapi.client.init({
        apiKey: this.props.credentials.apiKey,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      })
      console.log("[GoogleLibraries] GAPI client loaded")

      if (this.props.accessToken !== null) {
        console.log("[GoogleLibraries] Setting access token from props")
        console.log(this.props.accessToken)
        window.gapi.client.setToken(this.props.accessToken)
      }

      this.setState({gapiLoaded: true})
    } catch (error) {
      console.error("[GoogleLibraries] Error loading GAPI client", error)
      this.props.onError()
    }
  }

  onGsiLoad() {
    console.log("[GoogleLibraries] GSI script loadaded, initializing token")
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.props.credentials.clientId,
      scope: 'https://www.googleapis.com/auth/drive',
      callback: this.onNewAccessToken
    });
    this.setState({gsiLoaded: true, tokenClient: tokenClient})
  }

  onNewAccessToken(response) {
    if (response.error !== undefined) {
      console.error("[GoogleLibraries] Error getting access token", response.error)
      this.props.onError()
    } else {
      console.log("[GoogleLibraries] New access token", response)
      this.props.onAccessTokenChange(response)
    }    
  }

  render () {
    return null
  }
}

export default GoogleLibraries