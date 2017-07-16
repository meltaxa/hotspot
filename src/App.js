import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import FhirResource from './FhirResource.js'

import agencyLogo from './img/agency.svg'
import csiroLogo from './img/csiro.svg'
import './css/App.css'

class App extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return false
  }

  render() {
    const { config } = this.props

    return (
      <div className='app'>
        <header>
          <a href='https://www.digitalhealth.gov.au/'>
            <img
              src={agencyLogo}
              height='70'
              className='agency'
              alt='Australian Digital Health Agency'
            />
          </a>
          <a href='https://www.csiro.au/'>
            <img src={csiroLogo} height='70' className='csiro' alt='CSIRO' />
          </a>
          <h1>
            <a href='https://www.healthterminologies.gov.au/'>
              National Clinical Terminology Service
            </a>
          </h1>
        </header>
        <Router>
          <Switch>
            <Route
              path='/:path'
              render={({ location }) =>
                <FhirResource
                  path={location.pathname}
                  query={location.search}
                  {...config}
                />}
            />
            <Route
              render={() =>
                <div className='fhir-resource'>
                  <p>
                    Please provide a path to a valid FHIR resource within the
                    URL.
                  </p>
                </div>}
            />
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App