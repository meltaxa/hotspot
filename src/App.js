import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'

import RemoteFhirResource from './RemoteFhirResource.js'
import { containsFormatParam, removeFormatParam } from './fhir/common.js'

import agencyLogo from './img/agency.svg'
import csiroLogo from './img/csiro.svg'
import './css/App.css'

class App extends Component {
  static propTypes = {
    config: PropTypes.object,
  }

  static defaultProps = {
    config: {
      fhirServer: 'https://ontoserver.csiro.au/stu3-latest',
      fhirVersion: '3.0.1',
      stripFormatParam: false,
    },
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  checkForFormatParam(location, render) {
    const { config: { stripFormatParam } } = this.props
    return stripFormatParam && containsFormatParam(location.search) ? (
      <Redirect to={location.pathname + removeFormatParam(location.search)} />
    ) : (
      render
    )
  }

  handleLoad(metadata) {
    // Update the document title with the title and version of the loaded FHIR
    // resource.
    const { title, version } = metadata
    document.title = version ? `${title} (${version})` : title
  }

  render() {
    const { config } = this.props

    return (
      <div className="app">
        <header>
          <a href="https://www.digitalhealth.gov.au/">
            <img
              src={agencyLogo}
              className="agency"
              alt="Australian Digital Health Agency"
              height={70}
            />
          </a>
          <a href="https://www.csiro.au/">
            <img src={csiroLogo} className="csiro" alt="CSIRO" />
          </a>
          <h1>
            <a href="https://www.healthterminologies.gov.au/">
              National Clinical Terminology Service
            </a>
          </h1>
        </header>
        <main>
          <Router>
            <Switch>
              <Route
                path="/:path"
                render={({ location }) =>
                  this.checkForFormatParam(
                    location,
                    <RemoteFhirResource
                      path={location.pathname}
                      query={location.search}
                      onLoad={this.handleLoad}
                      {...config}
                    />,
                  )
                }
              />
              <Route
                render={() => (
                  <div className="fhir-resource">
                    <p>
                      Please provide a path to a valid FHIR resource within the
                      URL.
                    </p>
                  </div>
                )}
              />
            </Switch>
          </Router>
        </main>
      </div>
    )
  }
}

export default App
