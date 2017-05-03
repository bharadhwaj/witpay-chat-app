import React, { Component } from 'react'
import { connect } from 'react-redux'

@connect((store) => {
	return {
		roomName : store.chatReducer.roomName,
		username : store.chatReducer.username,
		onlineUsers : store.chatReducer.onlineUsers,
		online : store.chatReducer.online,
		nameMapping : store.chatReducer.nameMapping,
	}
})
class Username extends Component {

	componentWillMount() {
		this.setState({ name : '' })
	}

	setUsername(event) {
		event.preventDefault()
		const { socket, username, onlineUsers, online, nameMapping, roomName } = this.props
		const { name } = this.state
		if (this.state.name.trim() !== '') {

			let sessionId = socket.io.engine.id
			localStorage.setItem('uid', sessionId)

			socket.emit('server:joinRoomRequest', { room : roomName, user: sessionId })

			socket.on('client:joinRoomRequestSuccess', response => {
				console.log('JOIN REQUEST SUCCESS')
				socket.emit('server:joinRoom', { room : response.roomName, user : response.userName, inviteJoin : false })
			})

			socket.on('client:joinRoomSuccess', response => {
				console.log('Join Success :)', response)
				this.props.dispatch({ type : 'CURRENT_ONLINE_USERS', payload : response.onlineUsers })
				if(!response.inviteJoin)
					this.props.dispatch({ type : 'CURRENT_ROOMNAME', payload : response.roomName })
				socket.emit('server:setUsername', { id : sessionId, name: name })
				this.props.dispatch({ type : 'SET_USERNAME', payload : { sessionId : sessionId, name : name} })
				this.props.dispatch({ type : 'LOGON_USER'})
			})

			socket.on('client:joinRoomRequestFailure', response => {
				socket.emit('server:createRoom',  { room : response.roomName, user: sessionId })
			})

			socket.on('client:askToJoinRoom', response => {
				console.log('ASK TO JOIN', response)
				if (sessionId === response.user)
					socket.emit('server:joinRoom', { room : response.room, user: response.user, inviteJoin : true })
			})

			socket.on('client:createRoomResponse', response => {
				console.log('CREATE ROOM RESPONSE', response)
				socket.emit('server:joinRoom', { room : response.roomName, user: response.userName, inviteJoin : false })
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
