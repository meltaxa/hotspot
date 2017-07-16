import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highlight from 'react-highlight'

import 'highlight.js/styles/docco.css'

// Renders the raw content of an XML or JSON FHIR resource, pretty-printed and
// with syntax highlighting.
class Raw extends Component {
  static propTypes = {
    content: PropTypes.string.isRequired,
    format: PropTypes.oneOf([ 'json', 'xml' ]).isRequired,
    onError: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {}
    if (props.content && props.format) {
      try {
        this.state = {
          ...this.state,
          prettyContent: Raw.prettifyContent(props.content, props.format),
        }
      } catch (error) {
        if (props.onError) {
          props.onError(error)
        }
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.content && nextProps.format) {
      try {
        this.setState(() => ({
          prettyContent: Raw.prettifyContent(
            nextProps.content,
            nextProps.format
          ),
        }))
      } catch (error) {
        if (this.props.onError) {
          this.props.onError(error)
        }
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.content !== nextProps.content ||
      this.props.format !== nextProps.format ||
      this.state.prettyContent !== nextState.prettyContent
    )
  }

  render() {
    const { format } = this.props
    const { prettyContent } = this.state

    return (
      <div className='raw'>
        <Highlight className={format}>
          {prettyContent}
        </Highlight>
      </div>
    )
  }

  static prettifyContent(content, format) {
    if (format === 'json') {
      return Raw.prettifyJSONContent(content)
    } else if (format === 'xml') {
      return Raw.prettifyXMLContent(content)
    } else {
      throw new Error('Unsupported content type.')
    }
  }

  static prettifyJSONContent(content) {
    return JSON.stringify(JSON.parse(content), null, 2)
  }

  static prettifyXMLContent(content) {
    const xslt = `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
 <xsl:output omit-xml-declaration="yes" indent="yes"/>
    <xsl:template match="node()|@*">
      <xsl:copy>
        <xsl:apply-templates select="node()|@*"/>
      </xsl:copy>
    </xsl:template>
</xsl:stylesheet>`

    const parser = new DOMParser()
    const xsltDoc = parser.parseFromString(xslt, 'application/xml')
    const xmlDoc = parser.parseFromString(content, 'application/xml')
    const processor = new XSLTProcessor()
    processor.importStylesheet(xsltDoc)
    const transformed = processor.transformToDocument(xmlDoc)

    return new XMLSerializer().serializeToString(transformed)
  }
}

export default Raw