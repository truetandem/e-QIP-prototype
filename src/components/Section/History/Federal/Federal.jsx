import React from 'react'
import { i18n } from '../../../../config'
import { ValidationElement, Branch, Show, Collection, Help, HelpIcon, DateRange, Text, Address } from '../../../Form'
import { dateSummary } from '../HistoryCollection/summaries'

/**
 * Convenience function to send updates along their merry way
 */
const sendUpdate = (fn, name, props) => {
  if (fn) {
    fn({
      name: name,
      ...props
    })
  }
}

export default class Federal extends ValidationElement {
  constructor (props) {
    super(props)
    this.state = {
      HasFederalService: props.HasFederalService,
      List: props.List || [],
      errorCodes: []
    }

    this.onUpdate = this.onUpdate.bind(this)
    this.updateBranch = this.updateBranch.bind(this)
    this.updateCollection = this.updateCollection.bind(this)
  }

  /**
   * Handle the validation event.
   */
  handleValidation (event, status, error) {
    if (!event) {
      return
    }

    let codes = super.mergeError(this.state.errorCodes, super.flattenObject(error))
    let complexStatus = null
    if (codes.length > 0) {
      complexStatus = false
    } else if (this.isValid()) {
      complexStatus = true
    }

    this.setState({error: complexStatus === false, valid: complexStatus === true, errorCodes: codes}, () => {
      let e = { [this.props.name]: codes }
      let s = { [this.props.name]: { status: complexStatus } }
      if (this.state.error === false || this.state.valid === true) {
        super.handleValidation(event, s, e)
        return
      }

      super.handleValidation(event, s, e)
    })
  }

  /**
   * Determine if all items in the collection are considered to be in
   * a valid state.
   */
  isValid () {
    if (!this.state.HasFederalService) {
      return false
    }

    if (this.state.HasFederalService === 'No') {
      return true
    }

    if (this.state.HasFederalService === 'Yes' && this.state.List.length === 0) {
      return false
    }

    for (let item of this.state.List) {
      if (!item.Name || parseInt(item.Name.value) < 1) {
        return false
      }

      if (!item.Position || !item.Position.value) {
        return false
      }

      if (!item.Dates || !item.Dates.from || (!item.Dates.to && !item.Dates.present)) {
        return false
      }

      if (!item.Address) {
        return false
      }

      const address = item.Address
      switch (address.addressType) {
        case 'United States':
          if (!address.address || !address.city || !address.state || !address.zipcode) {
            return false
          }
          break

        case 'International':
          if (!address.address || !address.city || !address.country) {
            return false
          }
          break

        case 'APOFPO':
          if (!address.address || !address.apoFpo || !address.apoFpoType || !address.zipcode) {
            return false
          }
          break

        default:
          return false
      }
    }

    return true
  }

  onUpdate (name, values) {
    this.setState({ [name]: values }, () => {
      sendUpdate(this.props.onUpdate, this.props.name, this.state)
    })
  }

  updateBranch (value, event) {
    this.onUpdate('HasFederalService', value)

    // If there is no history clear out any previously entered data
    if (value === 'No') {
      this.onUpdate('List', [])
    }

    // Force validation checks
    this.handleValidation(event, null, null)
  }

  updateCollection (collection) {
    this.onUpdate('List', collection)
  }

  /**
   * Assists in rendering the summary section.
   */
  summary (item, index) {
    const agency = item && item.Name && item.Name.value
          ? item.Name.value
          : i18n.t('history.federal.collection.summary.unknown')
    const dates = dateSummary(item)

    return (
      <div className="table">
        <div className="table-cell index">{i18n.t('history.federal.collection.summary.item')} {index + 1}:</div>
        <div className="table-cell">{agency}</div>
        <div className="table-cell dates">{dates}</div>
      </div>
    )
  }

  render () {
    return (
      <div className="federal">
        <h3>{i18n.t('history.federal.heading.branch')}</h3>
        <Branch name="has_federalservice"
                className="eapp-field-wrap"
                value={this.state.HasFederalService}
                help="history.federal.help.branch"
                onUpdate={this.updateBranch}>
        </Branch>
        <Show when={this.state.HasFederalService === 'Yes'}>
          <Collection minimum="1"
                      items={this.state.List}
                      dispatch={this.updateCollection}
                      summary={this.summary}
                      summaryTitle={i18n.t('history.federal.collection.summary.title')}
                      appendLabel={i18n.t('history.federal.collection.append')}>
            <h3>{i18n.t('history.federal.heading.dates')}</h3>
            <div className="eapp-field-wrap">
              <Help id="history.federal.help.dates">
                <DateRange name="Dates"
                           onValidate={this.handleValidation}
                           />
                <HelpIcon />
              </Help>
            </div>

            <h3>{i18n.t('history.federal.heading.name')}</h3>
            <div className="eapp-field-wrap">
              <Help id="history.federal.help.name">
                <Text name="Name"
                      className="text"
                      onValidate={this.handleValidation}
                      />
                <HelpIcon />
              </Help>
            </div>

            <h3>{i18n.t('history.federal.heading.position')}</h3>
            <div className="eapp-field-wrap">
              <Help id="history.federal.help.position">
                <Text name="Position"
                      className="text"
                      onValidate={this.handleValidation}
                      />
                <HelpIcon />
              </Help>
            </div>

            <h3>{i18n.t('history.federal.heading.address')}</h3>
            <div className="eapp-field-wrap">
              <Help id="history.federal.help.address">
                <Address name="Address"
                         onValidate={this.handleValidation}
                         />
                <HelpIcon />
              </Help>
            </div>
          </Collection>
        </Show>
      </div>
    )
  }
}