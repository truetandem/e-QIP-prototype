import React from 'react'
import { i18n } from '../../../../../config'
import { Accordion, ValidationElement, Branch, Show } from '../../../../Form'
import { ForeignIndirectActivityValidator } from '../../../../../validators'
import IndirectInterest from './IndirectInterest'

export default class IndirectActivity extends ValidationElement {
  constructor (props) {
    super(props)

    this.state = {
      errorCodes: []
    }

    this.update = this.update.bind(this)
    this.updateHasInterests = this.updateHasInterests.bind(this)
    this.updateList = this.updateList.bind(this)
    this.isValid = this.isValid.bind(this)
  }

  update (field, values) {
    if (this.props.onUpdate) {
      this.props.onUpdate({
        HasInterests: this.props.HasInterests,
        List: this.props.List,
        [field]: values
      })
    }
  }

  updateList (values) {
    this.update('List', values)
  }

  updateHasInterests (values) {
    this.update('HasInterests', values)
  }

  isValid () {
    return new ForeignIndirectActivityValidator(null, this.props).isValid()
  }

  handleValidation (event, status, error) {
    let codes = super.mergeError(this.state.errorCodes, super.flattenObject(error))
    let complexStatus = null
    if (codes.length > 0) {
      complexStatus = false
    } else if (this.isValid()) {
      complexStatus = true
    }

    this.setState({error: complexStatus === false, valid: complexStatus === true, errorCodes: codes}, () => {
      const errorObject = { [this.props.name]: codes }
      const statusObject = { [this.props.name]: { status: complexStatus } }
      super.handleValidation(event, statusObject, errorObject)
    })
  }

  summary (item, index) {
    const o = (item || {}).IndirectInterest || {}
    const firstname = (o.Firstname || {}).value ? o.Firstname.value : ''
    const lastname = (o.Lastname || {}).value ? o.Lastname.value : ''
    const name = `${firstname} ${lastname}`.trim()
    const interestType = (o.InterestType || {}).value ? o.InterestType.value : ''
    const cost = (o.Cost || {}).value ? '$' + o.Cost.value : ''
    const type = i18n.t('foreign.activities.indirect.collection.itemType')

    const summary = [interestType, name].reduce((prev, next) => {
      if (prev && next) {
        return prev + ' - ' + next
      }
      return prev
    })

    return (
      <span className="content">
        <span className="index">{type} {index + 1}:</span>
        <span className="interest">
          <strong>{summary || i18n.t('foreign.activities.indirect.collection.summary')}</strong>
        </span>
        <span className="cost">{cost}</span>
      </span>
    )
  }

  render () {
    return (
      <div className="indirect">
        <Branch name="has_interests"
          label={i18n.t('foreign.activities.indirect.heading.title')}
          labelSize="h3"
          value={this.props.HasInterests}
          onValidate={this.handleValidation}
          onUpdate={this.updateHasInterests}>
        </Branch>

        <Show when={this.props.HasInterests === 'Yes'}>
          <Accordion minimum="1"
            defaultState={this.props.defaultState}
            items={this.props.List}
            onUpdate={this.updateList}
            summary={this.summary}
            onValidate={this.handleValidation}
            description={i18n.t('foreign.activities.indirect.collection.description')}
            appendTitle={i18n.t('foreign.activities.indirect.collection.appendTitle')}
            appendMessage={i18n.m('foreign.activities.indirect.collection.appendMessage')}
            appendLabel={i18n.t('foreign.activities.indirect.collection.appendLabel')}>
            <IndirectInterest name="IndirectInterest"
              bind={true}
            />
          </Accordion>
        </Show>
      </div>
    )
  }
}

IndirectActivity.defaultProps = {
  name: 'indirect',
  HasInterests: '',
  List: [],
  defaultState: true
}