import React from 'react';
import { Link } from "react-router-dom";
import { FaPlus, FaDocker, FaRunning } from 'react-icons/fa';
import './Lynx.css';

class Home extends React.Component {
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
                <div className="app-thumbnail">
                  <Link to="function/" style={{display: "block"}}>
                    <FaPlus style={{margin: 50 }} size={100} color="#4A274F" />
                  </Link>
                </div>
              </td>
              <td>
                <div className="app-thumbnail">
                  <Link to="list/" style={{display: "block"}}>
                    <FaRunning style={{margin: 50 }} size={100} color="#4A274F" />
                  </Link>
                </div>
              </td>
              <td>
                <div className="app-thumbnail">
                  <Link to="publish/" style={{display: "block"}}>
                    <FaDocker style={{margin: 50 }} size={100} color="#4A274F" />
                  </Link>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="text-div">
                  Create {"Function"}
                </div>
              </td>
              <td>
                <div className="text-div">
                  Run Job
                </div>
              </td>
              <td>
                <div className="text-div">
                  Publish App
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    );
  }
}

export default Home;
