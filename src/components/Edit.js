import { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons';

class Edit extends Component {
    constructor(props) {
      super(props)
      let fields = Object.entries(props.item).map((item) => {
        return {
          name: item[0].replace('_', ''),
          value: item[1],
          secret: item[0].indexOf('_') === 0,
          type: /\r|\n/.exec(item[1]) ? 'textarea' : 'input'
        }
      })
      console.log(fields)
  
      let nameIndex = null
    
      fields.forEach((item, index) => {
        if (item.name === "Name") nameIndex = index
      })    
  
      this.state = {
        id: props.item.id,
        item: props.item,
        nameIndex: nameIndex,
        fields: fields
      }
  
      this.handleSave = this.handleSave.bind(this)
      this.handleCancel = this.handleCancel.bind(this)
      this.handleNameChange = this.handleNameChange.bind(this)
      this.handleValueChange = this.handleValueChange.bind(this)
      this.handleRemove = this.handleRemove.bind(this)
      this.addNewField = this.addNewField.bind(this)
    }
  
    handleSave(e) {
      let itemObject = {}
      this.state.fields.forEach((field) => {
        let fieldName = (field.secret ? '_' : '') + field.name
        itemObject[fieldName] = field.value
      })
      this.props.onChange(itemObject)
      e.preventDefault()
    }
  
    handleCancel(e) {
      this.props.onCancel()
      e.preventDefault()
    }
  
    handleNameChange(e, index) {
      let fields = [...this.state.fields]
      fields[index].name = e.target.value
      this.setState({fields: fields})
    }
  
    handleValueChange(e, index) {
      let fields = [...this.state.fields]
      fields[index].value = e.target.value
      this.setState({fields: fields})
    }
  
    handleRemove(e, index) {
      let fields = [...this.state.fields]
      fields.splice(index, 1)
      this.setState({fields: fields})
    }
    
    addNewField(name, value, secret, type) {
      let fields = [...this.state.fields, {
        name: name,
        value: value,
        secret: secret,
        type: type  
      }]
      this.setState({fields: fields})
    }
    render() {
      return <div className="card mb-2">
        <header className="card-header">
          <p className="card-header-title">
            Editing item
          </p>
        </header>
        <div className="card-content">
          <div className="content">
            <table className="table">
              <tbody>
                <tr>
                  <td>Id</td>
                  <td colSpan="2">{this.props.item.id}</td>
                </tr>
                <tr>
                  <td>Name</td>
                  <td><input className="input" type="text" value={this.state.fields[this.state.nameIndex].value} onChange={(e) => this.handleValueChange(e, this.state.nameIndex)} /></td>
                  <td></td>
                </tr>
                { this.state.fields.map((field, index) => {
                  if (field.name === "id" || field.name === "Name") return null
  
                  return <tr key={index}>
                    <td><input className="input" type="field" value={field.name} onChange={(e) => this.handleNameChange(e, index)} /></td>
                    <td>
                      {field.type === 'textarea' ?
                        <textarea className="textarea" rows="5" onChange={(e) => this.handleValueChange(e, index)}>{field.value}</textarea> :
                        <input className="input" type="input" value={field.value} onChange={(e) => this.handleValueChange(e, index)} />
                      }
                    </td>
                    <td>
                      <button className="button is-pulled-right" onClick={(e) => this.handleRemove(e, index)}>
                        <span className="icon is-small">
                          <FontAwesomeIcon icon={faClose} />
                        </span>
                      </button>
                    </td>
                  </tr>                
                })}
                <tr>
                  <td colSpan="3">
                    <div className="buttons has-addons">
                      <button className="button" onClick={() => this.addNewField('New field', null, false, 'input')}>New field</button>
                      <button className="button" onClick={() => this.addNewField('New field', null, false, 'textarea')}>New textarea</button>
                      <button className="button" onClick={() => this.addNewField('New field', null, true, 'input')}>New secret field</button>
                      <button className="button" onClick={() => this.addNewField('New field', null, true, 'textarea')}>New secret textarea</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <footer className="card-footer">
          <a href="#" className="card-footer-item" onClick={this.handleSave}>Save</a>
          <a href="#" className="card-footer-item" onClick={this.handleCancel}>Cancel</a>
        </footer>
      </div>
    }
  }

  export default Edit