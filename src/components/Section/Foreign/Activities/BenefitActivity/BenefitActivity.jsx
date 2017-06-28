import React from 'react'
import { i18n } from '../../../../../config'
import { Accordion, Branch, Show } from '../../../../Form'
import { ForeignBenefitActivityValidator } from '../../../../../validators'
import SubsectionElement from '../../../SubsectionElement'
import Benefit from './Benefit'

export default class BenefitActivity extends SubsectionElement {
  constructor (props) {
    super(props)

    this.update = this.update.bind(this)
    this.updateHasBenefits = this.updateHasBenefits.bind(this)
    this.updateList = this.updateList.bind(this)
  }

  update (queue) {
    if (this.props.onUpdate) {
      let obj = {
        List: this.props.List,
        ListBranch: this.props.ListBranch,
        HasBenefits: this.props.HasBenefits
      }

      for (const q of queue) {
        obj = { ...obj, [q.name]: q.value }
      }

      this.props.onUpdate(obj)
    }
  }

  updateList (values) {
    this.update([
      { name: 'List', value: values.items },
      { name: 'ListBranch', value: values.branch }
    ])
  }

  updateHasBenefits (values) {
    this.update([
      { name: 'HasBenefits', value: values },
      { name: 'List', value: values === 'Yes' ? this.props.List : [] },
      { name: 'ListBranch', value: values === 'Yes' ? this.props.ListBranch : '' }
    ])
  }

  summary (item, index) {
    const o = (item || {}).Benefit || {}
    return benefitSummary(o, index)
  }

  render () {
    return (
      <div className="benefit-activity">
        <Branch name="has_benefit"
                className="has-benefits"
                label={i18n.t('foreign.activities.benefit.heading.title')}
                labelSize="h3"
                value={this.props.HasBenefits}
                warning={true}
                onError={this.handleError}
                onUpdate={this.updateHasBenefits}>
        </Branch>

        <Show when={this.props.HasBenefits === 'Yes'}>
          <Accordion minimum="1"
                     defaultState={this.props.defaultState}
                     items={this.props.List}
                     branch={this.props.ListBranch}
                     summary={this.summary}
                     onUpdate={this.updateList}
                     onError={this.handleError}
                     description={i18n.t('foreign.activities.benefit.collection.description')}
                     appendTitle={i18n.t('foreign.activities.benefit.collection.appendTitle')}
                     appendLabel={i18n.t('foreign.activities.benefit.collection.appendLabel')}>
            <Benefit name="Benefit"
                     bind={true}
                     />
          </Accordion>
        </Show>
      </div>
    )
  }
}

BenefitActivity.defaultProps = {
  name: 'benefit',
  HasBenefits: '',
  List: [],
  ListBranch: '',
  defaultState: true,
  onError: (value, arr) => { return arr },
  section: 'foreign',
  subsection: 'activities/benefits',
  dispatch: () => {},
  validator: (state, props) => {
    return new ForeignBenefitActivityValidator(state, props).isValid()
  }
}

export const benefitSummary = (item, index) => {
  const benefit = {}
  const who = (item.InterestTypes || []).join(', ')
  const type = i18n.t('foreign.activities.benefit.collection.itemType')
  let b = null
  switch (item.BenefitFrequency) {
    case 'OneTime':
      b = (item.OneTimeBenefit || {})
      benefit.Country = (b.Country || {}).value
      benefit.Date = (b.Received || {}).date ? `${b.Received.month}/${b.Received.year}` : ''
      break
    case 'Future':
      b = (item.FutureBenefit || {})
      benefit.Country = (b.Country || {}).value
      benefit.Date = (b.Begin || {}).date ? `${b.Begin.month}/${b.Begin.year}` : ''
      break
    case 'Continuing':
      b = (item.ContinuingBenefit || {})
      benefit.Country = (b.Country || {}).value
      benefit.Date = (b.Began || {}).date ? `${b.Began.month}/${b.Began.year}` : ''
      break
  }

  const summary = [who, benefit.Country].reduce((prev, next) => {
    if (prev && next) {
      return prev + ' - ' + next
    }
    return prev
  })

  return (
    <span className="content">
      <span className="index">{type}: {index + 1}</span>
      <span className="benefit-summary">
        <strong>{ summary || i18n.t('foreign.activities.benefit.collection.summary')}</strong>
      </span>
      <span className="date"><strong>{benefit.Date}</strong></span>
    </span>
  )
}
