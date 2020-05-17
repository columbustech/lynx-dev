import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import CDrivePathSelector from './CDrivePathSelector';
import './Lynx.css';

class FunctionSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selector: false
    };
  }
  render() {
    let componentBody;
    if(this.props.expand) {
      let fileName;
      function getName(cDrivePath) {
        if (cDrivePath === "") {
          return ""
        }
        return cDrivePath.substring(cDrivePath.lastIndexOf("/") + 1);
      }
      fileName = getName(this.props.functionPath);
      componentBody = (
        <div className="lynx-panel-body">
          <CDrivePathSelector show={this.state.selector} toggle={() => this.setState({selector : false})}
            action={this.props.updatePath} title="Select Python Function File"  actionName="Select"
            driveObjects={this.props.driveObjects} type="file" />
          <button className="btn btn-secondary m-3" onClick={() => this.setState({selector : true})} >
            Browse
          </button>
          <span className="m-3">{fileName}</span>
        </div>
      );
    }
    return(
      <div className="lynx-panel">
        <div className="lynx-panel-header" onClick={this.props.changeComponent}>
          {"Function"} File
        </div>
        {componentBody}
      </div>
    );
  }
}
class RequirementsSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selector: false
    };
  }
  render() {
    let componentBody;
    if(this.props.expand) {
      let fileName;
      function getName(cDrivePath) {
        if (cDrivePath === "") {
          return ""
        }
        return cDrivePath.substring(cDrivePath.lastIndexOf("/") + 1);
      }
      fileName = getName(this.props.requirementsPath);
      componentBody = (
        <div className="lynx-panel-body">
          <CDrivePathSelector show={this.state.selector} toggle={() => this.setState({selector : false})}
            action={this.props.updatePath} title="Select Pip Requirements File"  actionName="Select"
            driveObjects={this.props.driveObjects} type="file" />
          <button className="btn btn-secondary m-3" onClick={() => this.setState({selector : true})} >
            Browse
          </button>
          <span className="m-3">{fileName}</span>
        </div>
      );
    }
    return(
      <div className="lynx-panel">
        <div className="lynx-panel-header" onClick={this.props.changeComponent}>
          Requirements File
        </div>
        {componentBody}
      </div>
    );
  }
}
class PackagesSelector extends React.Component {
  render() {
    let componentBody;
    if(this.props.expand) {
      componentBody = (
        <div className="lynx-panel-body">
        </div>
      );
    }
    return(
      <div className="lynx-panel">
        <div className="lynx-panel-header" onClick={this.props.changeComponent}>
          Local Packages
        </div>
        {componentBody}
      </div>
    );
  }
}
class DirectoriesSelector extends React.Component {
  render() {
    let componentBody;
    if(this.props.expand) {
      componentBody = (
        <div className="lynx-panel-body">
        </div>
      );
    }
    return(
      <div className="lynx-panel">
        <div className="lynx-panel-header" onClick={this.props.changeComponent}>
          Directories
        </div>
        {componentBody}
      </div>
    );
  }
}

class CreateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      component: FunctionSelector,
      driveObjects: [],
      functionPath: "",
      requirementsPath: "",
      localPackages: [],
      directories: []
    };
    this.getDriveObjects = this.getDriveObjects.bind(this);
  }
  componentDidMount() {
    this.getDriveObjects();
  }
  getDriveObjects() {
    if(!this.props.specs) {
      return(null);
    }
    const cookies = new Cookies();
    var auth_header = 'Bearer ' + cookies.get('lynx_token');
    const request = axios({
      method: 'GET',
      url: this.props.specs.cdriveApiUrl + "list-recursive/?path=users",
      headers: {'Authorization': auth_header}
    });
    request.then(
      response => {
        this.setState({
          driveObjects: response.data.driveObjects,
        });
      }, err => {
        if(err.response.status === 401) {
          cookies.remove('lynx_token');
          window.location.reload(false);
        } else {
        }
      }
    );
  }
  render() {
    return (
      <div className="app-container">
        <div className="app-header">
          Create and Push {"Function"} Container
        </div>
        <FunctionSelector expand={this.state.component === FunctionSelector} 
          changeComponent={() => this.setState({component: FunctionSelector})}
          driveObjects={this.state.driveObjects} 
          updatePath={path => this.setState({functionPath: path})} 
          functionPath={this.state.functionPath} />
        <RequirementsSelector expand={this.state.component === RequirementsSelector} 
          changeComponent={() => this.setState({component: RequirementsSelector})}
          driveObjects={this.state.driveObjects} 
          updatePath={path => this.setState({requirementsPath: path})} 
          requirementsPath={this.state.requirementsPath} />
        <PackagesSelector expand={this.state.component === PackagesSelector} 
          changeComponent={() => this.setState({component: PackagesSelector})} />
        <DirectoriesSelector expand={this.state.component === DirectoriesSelector}
          changeComponent={() => this.setState({component: DirectoriesSelector})} />
      </div>
    );
  }
}

export default CreateContainer;
