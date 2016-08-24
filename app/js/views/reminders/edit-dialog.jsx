import React from 'components/react';
import moment from 'components/moment';

export default class EditDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      display: false,
      id: null,
      reminder: null,
      action: null,
      due: null,
    };

    this.server = props.server;
    this.refreshReminders = props.refreshReminders;

    this.dueDateInput = null;
    this.dueTimeInput = null;

    this.onKeyPress = this.onKeyPress.bind(this);
    this.onChangeAction = this.onChangeAction.bind(this);
    this.onChangeDue = this.onChangeDue.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  componentDidMount() {
    window.document.addEventListener('keydown', this.onKeyPress);
  }

  componentWillUnmount() {
    window.document.removeEventListener('keydown', this.onKeyPress);
  }

  onKeyPress(evt) {
    const display = this.state.display;

    if (!display) {
      return;
    }

    const key = evt.key;
    if (key === 'Escape') {
      this.hide();
    }
  }

  onChangeAction(evt) {
    const action = (evt.target.value).trim();

    if (action) {
      this.setState({ action });
    }
  }

  onChangeDue() {
    const date = this.dueDateInput.value.split('-');
    const time = this.dueTimeInput.value.split(':');

    const dueMoment = moment()
      .year(date[0]).month(date[1] - 1).date(date[2])
      .hour(time[0]).minute(time[1]).second(0);
    const due = Number(dueMoment.toDate());
    this.setState({ due });
  }

  onSave() {
    const reminder = {
      id: this.state.id,
      recipients: this.state.recipients,
      action: this.state.action,
      due: this.state.due,
    };
    this.server.reminders.update(reminder)
      .then(() => {
        this.refreshReminders();
        this.hide();
      })
      .catch((err) => {
        console.error(err);
        this.hide();
        alert('The reminder could not be updated. Try again later.');
      });
  }

  onClose() {
    this.hide();
  }

  show(reminder = null) {
    this.setState({
      display: true,
      id: reminder.id,
      recipients: reminder.recipients,
      action: reminder.action,
      due: reminder.due,
    });
  }

  hide() {
    this.setState({ display: false });
  }

  render() {
    const due = moment(this.state.due);

    if (!this.state.display) {
      return null;
    }

    return (
      <div>
        <div className="dialog-overlay"
             onClick={this.onClose}></div>

        <div className="dialog">
          <div className="dialog-title">
            <h3>Edit reminder</h3>
            <span className="dialog-title__close"
                  onClick={this.onClose}>Close</span>
          </div>

          <div className="dialog-content">
            <div className="dialog-content__section">
              <h4>Recipients</h4>
              <input className="dialog-content__input"
                     value={this.state.recipients}
                     disabled/>
            </div>
            <div className="dialog-content__section">
              <h4>Action</h4>
              <textarea className="dialog-content__input"
                        value={this.state.action}
                        onChange={this.onChangeAction}/>
            </div>
            <div className="dialog-content__section">
              <h4>Due time</h4>
              <input className="dialog-content__input dialog-content__half"
                     type="date"
                     value={due.format('YYYY-MM-DD')}
                     onChange={this.onChangeDue}
                     ref={(t) => this.dueDateInput = t}/>
              <input className="dialog-content__input dialog-content__half"
                     type="time"
                     value={due.format('HH:mm')}
                     onChange={this.onChangeDue}
                     ref={(t) => this.dueTimeInput = t}/>
            </div>
          </div>

          <div className="dialog-buttons">
            <button className="dialog-buttons__save"
                    onClick={this.onSave}>Save
            </button>
            <button className="dialog-buttons__cancel"
                    onClick={this.onClose}>Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}

EditDialog.propTypes = {
  server: React.PropTypes.object.isRequired,
  refreshReminders: React.PropTypes.func.isRequired,
};
