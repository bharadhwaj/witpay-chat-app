import React, { Component } from 'react'
import { connect } from 'react-redux'

@connect((store) => {
	return {
		roomName : store.chatReducer.roomName,
		username : store.chatReducer.username,
	}
})
class Username extends Component {

	componentWillMount() {
		this.setState({ name : '' })
	}

	setUsername(event) {
		event.preventDefault()
		const { socket, username } = this.props
		const { name } = this.state
		if (this.state.name.trim() !== '') {
			console.log('Name Change from ', username, ' to ', name)
			socket.emit('server:changeUsername', { oldUsername : username, newUsername: name })
			socket.on('client:nameChangeSuccess', response => {
				this.props.dispatch({ type : 'SET_USERNAME', payload : response.username })
			})
			
			this.setState({ name : '' })
		} else {
			Materialize.toast('Name can\'t be blank.', 2000, 'red lighten-1')
		}
	}

	handleTextChange(event) {
		this.setState({ name : event.target.value })
	}

	render() {
		return (
			<div className="card grey lighten-5">
				<div className="card-content">
					<span className="card-title">Hi there, What's your name?</span>
					<hr/> <br/>
					<form>
						<div className="input-field">
							<i className="material-icons prefix">perm_identity</i>
							<label className="left-align" for="name">Enter your name</label>
							<input value={this.state.name} id="name" type="text" className="validate" onChange={this.handleTextChange.bind(this)}/>
						</div>
						<div className="center-align">
							<button className="btn waves-effect btn-large waves-light" type="submit" onClick={this.setUsername.bind(this)}>
								Submit <i className="material-icons right">done</i>
							</button>
						</div>
					</form>
				</div>
			</div>
		)
	}
}

export default Username
