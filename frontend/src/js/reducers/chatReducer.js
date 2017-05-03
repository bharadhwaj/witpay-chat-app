export default function reducer(state = { 
	chat : [ ],
	online : false,
	username : null,
	sessionId : null,
	roomName : 'GENERAL',
	onlineUsers : [ ],
	nameMapping : { },
}, action) {
	
	switch(action.type) {

		case "ADD_THREAD": {
			return {
				...state,
				chat : [...state.chat, action.payload],
			}
		}

		case "ADD_MAPPING": {
			return {
				...state,
				nameMapping : action.payload,
			}
		}


		case "CURRENT_ONLINE_USERS": {
			return {
				...state,
				onlineUsers : action.payload,
			}
		}

		case "CURRENT_ROOMNAME": {
			return {
				...state,
				roomName : action.payload,
			}
		}
		
		case "SET_USERNAME": {
			return {
				...state,
				username : action.payload.name,
				sessionId : action.payload.sessionId,
			}
		}

		case "MARK_READ": {
			return {
				...state,
				chat : [...state.chat.map(thread => { if (thread.room === action.payload) { thread.read = true; } return thread }) ]
			}
		}

		case "LOGOUT_USER": {
			return {
				...state,
				online : false,
			}
		}

		case "LOGON_USER": {
			return {
				...state,
				online : true,
			}
		}
		
		default: {
			return {...state}
		}
	}

	return state;
}