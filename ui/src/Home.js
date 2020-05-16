import React from 'react';
import Cookies from 'universal-cookie';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import './Lynx.css';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jobList: [],
    };
    this.listJobs = this.listJobs.bind(this);
    this.selectJob = this.selectJob.bind(this);
    this.deleteJob = this.deleteJob.bind(this);
  }
  componentDidMount() {
    this.listJobs();
  }
  listJobs() {
    const cookies = new Cookies();
    const request = axios({
      method: 'GET',
      url: `${this.props.specs.appUrl}api/list-jobs/`,
      headers: {'Authorization': `Bearer ${cookies.get('lynx_token')}`}
    });
    request.then(response => {
      this.setState({
        jobList: response.data
      });
    },err => {
    });
  }
  selectJob(e, uid) {
    if (!e.target.classList.contains("dropdown-item") && !e.target.classList.contains("btn")) {
      window.location.href = `${this.props.specs.appUrl}job/${uid}`;
    }
  }
  deleteJob(e, uid) {
    const cookies = new Cookies();
    const request = axios({
      method: 'POST',
      url: `${this.props.specs.appUrl}api/delete-job/`,
      data: {
        uid: uid
      },
      headers: {'Authorization': `Bearer ${cookies.get('lynx_token')}`}
    });
    request.then(response => {
      this.listJobs();
    },);
  }
  render() {
    return (
      <div className="app-container">
        <div className="app-header">
          Lynx Developer Interface
        </div>
        <div className="app-table mt-5">
          <table>
            <tr>
              <td>
              </td>
              <td>
              </td>
              <td>
              </td>
            </tr>
            <tr>
              <td>
              </td>
              <td>
              </td>
              <td>
              </td>
            </tr>
          </table>
        </div>
      </div>
    );
  }
}

export default Home;
