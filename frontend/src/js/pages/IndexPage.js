import React, { Component } from 'react'
import io from 'socket.io-client'
import { connect } from 'react-redux'

import PreLoader from '../components/PreLoader'
import Navbar from '../components/Navbar'
import ChatMessages from '../components/ChatMessages'
import ChatBox from '../components/ChatBox'
import OnlineUsers from '../components/OnlineUsers'
import LeaveChat from '../components/LeaveChat'

const socket = io('http://localhost:4000')
let sessionId = null

@connect((store) => {
	return {
		loading : store.pageReducer.loading,
		roomName : store.chatReducer.roomName,
		onlineUsers : store.chatReducer.onlineUsers,
		online : store.chatReducer.online,
	}
})
class Index extends Component {
	componentWillMount() {
		console.log('CURRENT USER', localStorage.getItem('uid'))
		const { roomName, loading, onlineUsers, online } = this.props
		socket.on('connect', () => {
			socket.emit('server:connect')

			sessionId = socket.io.engine.id
			localStorage.setItem('uid', sessionId)

			socket.emit('server:joinRoomRequest', { room : roomName, user: sessionId })

			this.props.dispatch({ type : 'SET_USERNAME', payload : sessionId })


			socket.on('client:joinRoomRequestSuccess', response => {
				console.log('JOIN REQUEST SUCCESS')
				socket.emit('server:joinRoom', { room : response.roomName, user : response.userName, inviteJoin : false })
			})

			socket.on('client:joinRoomSuccess', response => {
				console.log('Join Success :)', response)
				this.props.dispatch({ type : 'CURRENT_ONLINE_USERS', payload : response.onlineUsers })
				if(!response.inviteJoin)
					this.props.dispatch({ type : 'CURRENT_ROOMNAME', payload : response.roomName })
				this.props.dispatch({ type : 'LOADED' })
			})

			socket.on('client:joinRoomRequestFailure', response => {
				socket.emit('server:createRoom',  { room : roomName, user: sessionId })
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

			socket.on('client:userJoined', response => {
				this.props.dispatch({ type : 'CURRENT_ONLINE_USERS', payload : response })
			})	

			// socket.on('client:nameChangeSuccessBroadcast', response => {
			// 	this.props.dispatch({ type : 'CURRENT_ONLINE_USERS', payload : response })
			// })	
			
			socket.on('client:userLeft', response => {
				console.log('USER LEFT')
				this.props.dispatch({ type : 'CURRENT_ONLINE_USERS', payload : response })
			})
			
			window.addEventListener('beforeunload', event => {
				event.preventDefault()
				socket.emit('server:disconnect', { room : roomName, user: sessionId })
			})

		})

	}


	render() {
		socket.on('connect', () => {
			socket.on('client:newMessage', response => {
				console.log("Got message", response.user, sessionId, response.message)
				this.props.dispatch({ type : 'ADD_THREAD', payload : response })
			})
		})
		console.log('CURRENT ROOM : ', this.props.roomName)
		return (
			(this.props.loading) 
				? 	<div className="loader-class preloader-wrapper big active">
						<PreLoader color="blue"/>
						<PreLoader color="red"/>
						<PreLoader color="yellow"/>
						<PreLoader color="green"/>
					</div>
				:	<div>
						<Navbar/>
						<div className="row">
							<div className="card-panel col s9">
								<ChatMessages socket={socket}/>
							</div>
							<div className="col s3">
								<OnlineUsers socket={socket}/>
							</div>
						</div>
						{
							this.props.online 
							? 	<div className="bottom-stick row card-panel teal lighten-5">
									<div className="col m11">
										<ChatBox socket={socket}/>
									</div>
									<div className="col m1">
										<LeaveChat socket={socket}/>
									</div>
								</div>
							: 	null
						}
						
						
					</div>
		)
	}
}

export default Index