import React from 'react'
import { i18n } from '../../config'
import SubsectionElement from './SubsectionElement'
import { Field, Text } from '../Form'

export default class SectionComments extends SubsectionElement {
  constructor (props) {
    super(props)
    this.update = this.update.bind(this)
    this.updateComments = this.updateComments.bind(this)
  }

  update (queue) {
    this.props.onUpdate({
      Comments: this.props.Comments,
      ...queue
    })
  }

  updateComments (values) {
    this.update({
      Comments: values
    })
  }

  title () {
    return (
      <span>
        {this.props.title}
        <span className="optional">(Optional)</span>
      </span>
    )
  }

  render () {
    return (
      <Field title={this.title()}
             titleSize="h4"
             className="section-comment">
        <Text name="Comments"
              {...this.props.Comments}
              onUpdate={this.updateComments}
              />
      </Field>
    )
  }
}

SectionComments.defaultProps = {
  title: '',
  Comments: {},
  onUpdate: (queue) => {},
  onError: (value, arr) => { return arr },
  section: 'identification',
  subsection: 'comments',
  dispatch: () => {},
  validator: (state, props) => {
    return true
  },
  defaultState: true
}