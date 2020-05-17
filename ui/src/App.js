import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import JobStatus from './JobStatus';
import CreateJob from './CreateJob';
import ListJobs from './ListJobs';
import CreateContainer from './CreateContainer';
import PublishApp from './PublishApp';
import Home from './Home';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      uid: "",
      specs: {},
      isLoggedIn: false
    };
    this.initPage = this.initPage.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
  }
  authenticateUser() {
    const cookies = new Cookies();
    var accessToken = cookies.get('lynx_token');
    if (accessToken !== undefined) {
      this.setState({isLoggedIn: true});
      return;
    }
    var url = new URL(window.location.href);
    var code = url.searchParams.get("code");
    if (code == null) {
      window.location.href = `${this.state.specs.authUrl}o/authorize/?response_type=code&client_id=${this.state.specs.clientId}&redirect_uri=${this.state.specs.appUrl}&state=1234xyz`;
    } else {
      const request = axios({
        method: 'POST',
        url: `${this.state.specs.appUrl}api/access-token/`,
        data: {
          code: code,
          redirect_uri: this.state.specs.appUrl
        }
      });
      request.then(
        response => {
          cookies.set('lynx_token', response.data.access_token);
          window.location.href = this.state.specs.appUrl;
        }, err => {
        }
      );
    }
  }
  initPage() {
    const request = axios({
      method: 'GET',
      url: `${process.env.PUBLIC_URL}/api/specs/`
    });
    request.then(
      response => {
        this.setState({"specs": response.data});
      },
    );
  }
  render() {
    if (Object.keys(this.state.specs).length === 0) {
      this.initPage();
      return (null);
    } else if (!this.state.isLoggedIn) {
      this.authenticateUser();
      return (null);
    } else {
      var url = new URL(process.env.PUBLIC_URL);
      return (
        <Router basename={url.pathname} >
          <Switch>
            <Route path="/job/:uid" component={JobStatus} />
            <Route 
              path="/list/" 
              render={(props) => <ListJobs {...props} specs={this.state.specs} />} 
            />
            <Route 
              path="/create/" 
              render={(props) => <CreateJob {...props} specs={this.state.specs} />} 
            />
            <Route 
              path="/function/" 
              render={(props) => <CreateContainer {...props} specs={this.state.specs} />} 
            />
            <Route 
              path="/publish/" 
              render={(props) => <PublishApp {...props} specs={this.state.specs} />} 
            />
            <Route 
              path="/" 
              render={(props) => <Home {...props} specs={this.state.specs} />} 
            />
          </Switch>
        </Router>
      );
    }
  }
}

export default App;
