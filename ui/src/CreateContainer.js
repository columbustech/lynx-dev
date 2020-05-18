import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import CDrivePathSelector from './CDrivePathSelector';
import './Lynx.css';

class CreateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      driveObjects: [],
      contextName: "",
      context: "",
      contextSelector: false,
      processFunction: "",
      functionSelector: false,
      requirements: "",
      requirementsSelector: false,
      packages: "",
      packagesSelector: false,
      modules: "",
      modulesPathSelector: false,
      execStatus: "",
      execMessage: ""
    };
    this.getDriveObjects = this.getDriveObjects.bind(this);
    this.createBuildContext = this.createBuildContext.bind(this);
    this.clearInputs = this.clearInputs.bind(this);
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
  createBuildContext() {
    this.setState({execStatus: "Running"});
    const cookies = new Cookies();
    var data = {
      contextName: this.state.contextName,
      context: this.state.context,
      processFunction: this.state.processFunction,
    };
    if (this.state.requirements !== "") {
      data['requirements'] = this.state.requirements;
    }
    if (this.state.packages !== "") {
      data['packages'] = this.state.packages;
    }
    if (this.state.modules !== "") {
      data['modules'] = this.state.modules;
    }
    const request = axios({
      method: 'POST',
      url: `${this.props.specs.appUrl}api/create-image-context/`,
      data: data,
      headers: {
        'Authorization': `Bearer ${cookies.get('lynx_token')}`,
      }
    });
    request.then(
      response => {
        this.setState({execStatus: "Complete"});
      },
    );
  }
  clearInputs() {
    this.setState({
      contextName: "",
      context: "",
      processFunction: "",
      requirements: "",
      packages: "",
      modules: ""
    });
  }
  render() {
    let context, processFunction, requirements, packages, modules;
    function getName(cDrivePath) {
      if (cDrivePath === "") {
        return ""
      }
      return cDrivePath.substring(cDrivePath.lastIndexOf("/") + 1);
    }
    context = getName(this.state.context);
    processFunction = getName(this.state.processFunction);
    requirements = getName(this.state.requirements);
    packages = getName(this.state.packages);
    modules = getName(this.state.modules);
    let execButton, clearButton;
    if (this.state.execStatus !== "Running") {
      execButton = (
        <button className="btn btn-lg btn-primary blocker-btn" onClick={this.createBuildContext} >
          Create
        </button>
      );
    } else {
        execButton = (
          <button className="btn btn-lg btn-primary blocker-btn" disabled>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span className="ml-2">Create</span>
          </button>
        );
    }
    clearButton = (
      <button className="btn btn-lg btn-secondary blocker-btn" onClick={this.clearInputs} >
        Clear
      </button>
    );
    return (
      <div className="app-container">
        <div className="app-header">
          Create and Push {"Function"} Container
        </div>
        <CDrivePathSelector show={this.state.contextSelector} toggle={() => this.setState({contextSelector : false})}
        action={path => this.setState({context: path})} title="Select Output Folder"  actionName="Select"
        driveObjects={this.state.driveObjects} type="folder" />
        <CDrivePathSelector show={this.state.functionSelector} toggle={() => this.setState({functionSelector : false})}
        action={path => this.setState({processFunction: path})} title="Select File Containing Process Function"  actionName="Select"
        driveObjects={this.state.driveObjects} type="file" />
        <CDrivePathSelector show={this.state.requirementsSelector} toggle={() => this.setState({requirementsSelector : false})}
        action={path => this.setState({requirements: path})} title="Select Pip Requirements File"  actionName="Select"
        driveObjects={this.state.driveObjects} type="file" />
        <CDrivePathSelector show={this.state.packagesSelector} toggle={() => this.setState({packagesSelector : false})}
        action={path => this.setState({packages: path})} title="Select Packages Folder"  actionName="Select this folder"
        driveObjects={this.state.driveObjects} type="folder" />
        <CDrivePathSelector show={this.state.modulesSelector} toggle={() => this.setState({modulesSelector : false})}
        action={path => this.setState({modules: path})} title="Select Modules"  actionName="Select this folder"
        driveObjects={this.state.driveObjects} type="folder" />
        <table className="mx-auto">
          <tr>
            <td>
              <span className="m-3">Image Name:</span>
            </td>
            <td>
              <input type="text" placeholder="Image Name" value={this.state.contextName} className="p-2 m-3 cdrive-input-item" onChange={e => this.setState({contextName:e.target.value})} />
            </td>
            <td>
              <span className="m-3">Output Path:</span>
            </td>
            <td>
              <button className="btn btn-secondary m-3" onClick={() => this.setState({contextSelector : true})} >
                Browse
              </button>
              <span className="m-3">{context}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="m-3">Process {"Function"}:</span>
            </td>
            <td>
              <button className="btn btn-secondary m-3" onClick={() => this.setState({functionSelector : true})} >
                Browse
              </button>
              <span className="m-3">{processFunction}</span>
            </td>
            <td>
              <span className="m-3">Requirements:</span>
            </td>
            <td>
              <button className="btn btn-secondary m-3" onClick={() => this.setState({requirementsSelector : true})} >
                Browse
              </button>
              <span className="m-3">{requirements}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span className="m-3">Local Packages:</span>
            </td>
            <td>
              <button className="btn btn-secondary m-3" onClick={() => this.setState({packagesSelector : true})} >
                Browse
              </button>
              <span className="m-3">{packages}</span>
            </td>
            <td>
              <span className="m-3">Modules:</span>
            </td>
            <td>
              <button className="btn btn-secondary m-3" onClick={() => this.setState({modulesSelector : true})} >
                Browse
              </button>
              <span className="m-3">{modules}</span>
            </td>
          </tr>
          <tr>
            <td colSpan={4}>
              <div className="input-div text-center">
                {execButton}
                {clearButton}
              </div>
            </td>
          </tr>
        </table>
      </div>
    );
  }
}

export default CreateContainer;
