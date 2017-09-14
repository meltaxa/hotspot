import React, { Component } from 'react'
import PropTypes from 'prop-types'

import FhirResource from './FhirResource.js'
import {
  extractEntriesFromJsonBundle,
  rawFromJsonResource,
} from './fhir/json.js'
import { extractEntriesFromXmlBundle, rawFromXmlResource } from './fhir/xml.js'

import './css/Bundle.css'

// Provides a human-friendly rendering of a FHIR Bundle resource.
class Bundle extends Component {
  static propTypes = {
    fhirServer: PropTypes.string.isRequired,
    fhirVersion: PropTypes.string.isRequired,
    bundle: PropTypes.oneOfType([
      PropTypes.object, // parsed JSON document fragment
      PropTypes.instanceOf(Node), // parsed XML document fragment
    ]).isRequired,
    format: PropTypes.string.isRequired,
    onError: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      entries: [],
    }
    this.extractEntries = this.extractEntries.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  extractEntries(bundle) {
    const extractEntriesImpl =
      bundle instanceof Node
        ? extractEntriesFromXmlBundle
        : extractEntriesFromJsonBundle
    extractEntriesImpl(bundle)
      .then(entries => this.setState(() => ({ entries })))
      .catch(error => this.handleError(error))
  }

  handleError(error) {
    if (this.props.onError) {
      this.props.onError(error)
    }
  }

  componentWillMount() {
    this.extractEntries(this.props.bundle)
  }

  componentWillReceiveProps(nextProps) {
    this.extractEntries(nextProps.bundle)
  }

  render() {
    const { fhirServer, fhirVersion, format } = this.props
    const { entries } = this.state
    if (!entries) return <div className='bundle' />

    return (
      <div className='bundle'>
        {entries.map((entry, i) => {
          const raw =
            entry.resource instanceof Node
              ? rawFromXmlResource(entry.resource)
              : rawFromJsonResource(entry.resource)
          return (
            <div key={i} className='entry'>
              <FhirResource
                fhirServer={fhirServer}
                fhirVersion={fhirVersion}
                resource={entry.resource}
                fullUrl={entry.fullUrl}
                format={format}
                raw={raw}
                className='fhir-resource fhir-resource-inline'
                noTabSelectedAtLoad
                onError={this.handleError}
              />
            </div>
          )
        })}
      </div>
    )
  }
}

export default Bundle