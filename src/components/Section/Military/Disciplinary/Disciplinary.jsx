import React from 'react'
import { i18n } from '../../../../config'
import { MilitaryDisciplinaryValidator } from '../../../../validators'
import SubsectionElement from '../../SubsectionElement'
import { Branch, Show, Accordion } from '../../../Form'
import Procedure from './Procedure'

export default class Disciplinary extends SubsectionElement {
  constructor (props) {
    super(props)

    this.update = this.update.bind(this)
    this.updateDisciplinary = this.updateDisciplinary.bind(this)
    this.updateList = this.updateList.bind(this)
  }

  update (queue) {
    if (this.props.onUpdate) {
      let obj = {
        HasDisciplinary: this.props.HasDisciplinary,
        List: this.props.List,
        ListBranch: this.props.ListBranch
      }

      for (const q of queue) {
        obj = { ...obj, [q.name]: q.value }
      }

      this.props.onUpdate(obj)
    }
  }

  updateDisciplinary (value, event) {
    // If there is no history clear out any previously entered data
    this.update([
      { name: 'HasDisciplinary', value: value },
      { name: 'List', value: value === 'Yes' ? this.props.List : [] },
      { name: 'ListBranch', value: value === 'Yes' ? this.props.ListBranch : '' }
    ])
  }

  updateList (values) {
    this.update([
      { name: 'List', value: values.items },
      { name: 'ListBranch', value: values.branch }
    ])
  }

  /**
   * Assists in rendering the summary section.
   */
  summary (item, index) {
    const itemProperties = (item || {}).Item || {}
    const service = itemProperties.Name && itemProperties.Name.value
          ? itemProperties.Name.value
          : i18n.t('military.disciplinary.collection.summary.unknown')
    const dates = itemProperties.Date && itemProperties.Date.date
          ? `${itemProperties.Date.month}/${itemProperties.Date.year}`
          : ''

    return (
      <span>
        <span className="index">{i18n.t('military.disciplinary.collection.summary.item')} {index + 1}:</span>
        <span><strong>{service}</strong></span>
        <span className="dates"><strong>{dates}</strong></span>
      </span>
    )
  }

  render () {
    return (
      <div className="disciplinary">
        <Branch name="has_disciplinary"
                value={this.props.HasDisciplinary}
                weight={true}
                onUpdate={this.updateDisciplinary}
                onError={this.handleError}>
        </Branch>

        <Show when={this.props.HasDisciplinary === 'Yes'}>
          <Accordion minimum="1"
                     items={this.props.List}
                     defaultState={this.props.defaultState}
                     branch={this.props.ListBranch}
                     onUpdate={this.updateList}
                     onError={this.handleError}
                     summary={this.summary}
                     description={i18n.t('military.disciplinary.collection.summary.title')}
                     appendTitle={i18n.t('military.disciplinary.collection.appendTitle')}
                     appendMessage={i18n.m('military.disciplinary.collection.appendMessage')}
                     appendLabel={i18n.t('military.disciplinary.collection.append')}>
            <Procedure name="Item"
                       bind={true}
                       />
          </Accordion>
        </Show>
      </div>
    )
  }
}

Disciplinary.defaultProps = {
  onError: (value, arr) => { return arr },
  section: 'military',
  subsection: 'disciplinary',
  dispatch: () => {},
  validator: (state, props) => {
    return new MilitaryDisciplinaryValidator(props, props).isValid()
  },
  defaultState: true
}
