import { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faAngleUp, faAngleDown, faEyeSlash, faCopy } from '@fortawesome/fontawesome-free-solid'

class Card extends Component {
  constructor(props) {
    super(props);
    this.state = {isContentVisible: false, showHiddenList: []}

    this.toggleVisibility = this.toggleVisibility.bind(this)
    this.toggleHidden = this.toggleHidden.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }
  
  toggleVisibility() {
    this.setState({isContentVisible: !this.state.isContentVisible, showHiddenList: []})
  }

  toggleHidden(key) {
    let showHiddenList = this.state.showHiddenList
    if (showHiddenList.indexOf(key) > -1) {
      showHiddenList.splice(showHiddenList.indexOf(key), 1);
    } else {
      showHiddenList.push(key)
    }
    this.setState({showHidden: showHiddenList})
  }

  handleEdit() {
    this.props.onEditClick(this.props.item.id)
  }

  handleDelete() {
    this.props.onDeleteClick(this.props.item.id)
  }
  
  render() {
    return <div className="card">
      <header className="card-header">
        <p className="card-header-title">
          <span className="icon mr-1">
            <FontAwesomeIcon icon={faLock} />
          </span>
          {this.props.item.Name}
        </p>
        <button className="card-header-icon" aria-label="more options" onClick={this.toggleVisibility}>
          <span className="icon">
            <FontAwesomeIcon icon={this.state.isContentVisible ? faAngleUp : faAngleDown} />
          </span>
        </button>
      </header>
      <div className={this.state.isContentVisible ? null : 'is-hidden'}>
        <div className="card-content">
          <div className="content">
            <table className="table">
              <tbody>
                {Object.entries(this.props.item).map((value, k) => {
                  if (value[0].startsWith('_')) {
                    return <tr key={k}>
                            <td>{value[0].replace('_', '')}</td>
                            <td style={{"whiteSpace" : "pre-line"}} className={this.state.showHiddenList.indexOf(value[0]) === -1 ? "is-italic has-text-grey-light" : ''}>
                              { this.state.showHiddenList.indexOf(value[0]) === -1 ? 'Content is hidden' : value[1] }
                              <button className="button is-small ml-2" onClick={() => this.toggleHidden(value[0])}>
                                <span className="icon is-small">
                                <FontAwesomeIcon icon={faEyeSlash} />
                                </span>
                                <span>Show</span>
                              </button>
                              <button className="button is-small ml-2" onClick={() => navigator.clipboard.writeText(value[1])}>
                                <span className="icon is-small">
                                <FontAwesomeIcon icon={faCopy} />
                                </span>
                                <span>Copy</span>
                              </button>
                            </td>
                          </tr>
                  }
                  return <tr key={k}>
                          <td>{value[0].replace('_', '')}</td>
                          <td style={{"whiteSpace" : "pre-line"}}>{value[1]}</td>
                        </tr>
                })}
              </tbody>
            </table>
          </div>
        </div>
        <footer className="card-footer">
          <a href="#" className="card-footer-item" onClick={this.handleEdit}>Edit</a>
          <a href="#" className="card-footer-item" onClick={this.handleDelete}>Delete</a>
        </footer>
      </div>
    </div>
  }
}

export default Card
