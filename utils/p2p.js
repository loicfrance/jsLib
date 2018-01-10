{
	/**
	 * @class utils.p2p.PeerConnection
	 * A class used to handle P2P connection.
	 * @example
	 * //### USER 1 ###
	 *
	 * peer = new PeerConnection();
	 * channel = peer.createDataChannel();
	 * peer.createOffer()
	 *      .then(sendToRemote)//[user function] send description and candidate to remote
	 *      .then(waitForRemote)//[user function] wait for description and candidate of remote
	 *      .then(({description, candidate})=>peer.onOfferAnswer({description, candidate}))
	 *      .then(()=>new Promise(resolve=>{
	 *          if(channel.readyState == 'open' resolve();
	 *          else channel.onopen = resolve
	 *      }))
	 *      .then(()=>channel.send('Hello World!')) // ready to use
	 *
	 * //### USER 2 ###
	 * peer = new PeerConnection();
	 * var channel = null;
	 * onOffer()
	 *      .then(({description, candidate})=>peer.createAnswer({description, candidate}))
	 *      .then(sendToRemote) //[user function] send description and candidate to remote
	 *      .then(()=>peer.waitDataChannel())
	 *      .then(channel=>{
	 *          channel.onmessage = evt=> console.log(evt.data);
	 *          channel.onopen = _ => {//channel is open and ready to use};
	 *          channel.onclose =  _ => {//channel is closed};
	 *      });
	 *
	 * //### USER 1 ###
	 */
	class PeerConnection {
		/**
		 * @constructor
		 * @param {RTCConfiguration} [pcConfig] - configuration for the RTCPeerConnection
		 */
		constructor(pcConfig) {
			this.pc = new RTCPeerConnection(pcConfig);
		}

		/**
		 *
		 * @param {string} [name=""] - name of the data channel. Default is empty string
		 * @param [config]
		 * @returns {*}
		 */
		createDataChannel(name, config) {
			return this.pc.createDataChannel(name || "", config);
		}

		addTrack(track, ...streams) {
			return this.pc.addTrack(track, ...streams);
		}

		/**
		 * creates a {@link Promise} resolved with a {@link RTCDataChannel} when the 'datachannel' event is fired <!--
		 * -->on the {@link RTCPeerConnection}.
		 * @returns {Promise<RTCDataChannel>} the created {@link Promise}
		 */
		waitDataChannel() {
			return new Promise(resolve => {
				this.pc.ondatachannel = ({channel})=> {
					this.pc.ondatachannel = null;
					resolve(channel);
				};
			})
		}

		/**
		 * creates a {@link Promise} resolved with a {@link RTCTrackEvent} when the the 'track' event is fired <!--
		 * -->on the {@link RTCPeerConnection}.
		 * @returns {Promise<RTCTrackEvent>}
		 */
		waitTrack() {
			return new Promise(resolve => {
				this.pc.ontrack = (evt)=> {
					this.ontrack = null;
					resolve(evt);
				};
			})
		}

		/**
		 * initialize the connection by creating an offer to be answered by a remote peer
		 * @param {RTCOfferOptions} [options] - passed to {@link RTCPeerConnection.createOffer} function
		 * @returns {Promise<{description, candidate}>} resolved when the local peer is ready to accept a <!--
		 * -->remote peer, with the peer's local description and the candidate to pass to the remote peer.
		 */
		createOffer(options) {
			return new Promise((resolve, reject) => {
				this.pc.onicecandidate = (evt)=> {
					if(!evt.candidate) return;
					this.candidate = evt.candidate;
					resolve({description: this.pc.localDescription, candidate: this.candidate});
				}
				this.pc.createOffer(options).then((desc)=>{
					this.pc.setLocalDescription(desc);
				}, reject);
			})
		}

		/**
		 * must be called after {@link createOffer} with the remote description and candidate
		 * @param {Object} remote
		 * @param {RTCCandidate|Object} remote.candidate
		 * @param {RTCSessionDescription|Object} remote.description
		 */
		onOfferAnswer({candidate, description}) {
			this.pc.setRemoteDescription(description);
			this.pc.addIceCandidate(candidate);
		}

		/**
		 * initialize the connection by answering the remote peer's answer
		 * @param {Object} remote
		 * @param {RTCCandidate|Object} remote.candidate
		 * @param {RTCSessionDescription|Object} remote.description
		 * @param {RTCAnswerOptions} [options]
		 * @returns {Promise<{description, candidate}>}
		 */
		createAnswer({candidate, description}, options) {
			this.pc.setRemoteDescription(description);
			this.pc.addIceCandidate(candidate);
			return new Promise((resolve, reject) => {
				let a = false;
				this.pc.onicecandidate = (evt)=> {
					if(!evt.candidate) return;
					this.candidate = evt.candidate;
					resolve({description: this.pc.localDescription, candidate: this.candidate});
				}
				this.pc.createAnswer(options).then((desc)=>{
					this.pc.setLocalDescription(desc);
				}, reject);
			})
		}
	}
	function test3() {
		var peer1 = new PeerConnection();
		peer1.tx = peer1.createDataChannel("peer 1 -> 2");
		var peer2 = new PeerConnection();
		peer2.tx = peer2.createDataChannel("peer 2 -> 1");
		const onMsg = function({data}) {
			alert(`${this.label} >> ${data}`);
		}
		peer1.createOffer()
			.then((desc_cand)=>peer2.createAnswer(desc_cand))
			.then((desc_cand)=>peer1.onOfferAnswer(desc_cand))
			.then(()=>peer1.waitDataChannel())
			.then(channel=>channel.onmessage = onMsg)
			.then(()=>peer2.waitDataChannel())
			.then(channel=>channel.onmessage = onMsg)
			.then(_=>console.log("finish"))
			.then(_=>peer1.tx.readyState == 'open' || utils.tools.waitForEvent(peer1.tx, 'open'))
			.then(peer1.tx.send('Hello'));
	}
	window.utils = window.utils || {};
	window.utils.p2p = {
		PeerConnection
	};
}