export default {
	send: (whom,body,payload) => {
		whom.postMessage({
			body: body,
			payload: payload
		});
	},
	is: (msg,body,cb) => {
		if(msg.data.body === body) {
			cb(msg.data.payload)
		}
	}
}
