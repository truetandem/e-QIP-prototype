import React from 'react'
import { sidebar } from './sidebar'

export default class Sticky extends React.Component {
  componentDidMount () {
    this.sidebar = new sidebar(this.props.container, this.props.content, this.props.options)
    this.sidebar.on()
  }

  componentWillUnmount () {
    if (this.sidebar) {
      this.sidebar.off()
    }
  }

  render () {
    const log = this.props.options.log
          ? <div className={`sidebar-log ${this.props.options.log.replace('.', '')}`}></div>
          : null
    return (
      <div>
        <div className="sticky">
          <div className="contents">
            {this.props.children}
          </div>
        </div>
        {log}
      </div>
    )
  }
}

Sticky.defaultProps = {
  container: '.eapp-core .sticky > .contents',
  content: '.sticky > .contents',
  options: {}
}
