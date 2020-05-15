import {PeerConnection} from "../../utils/p2p.mod.js";
import {delay, waitForEvent} from "../../utils/tools.mod.js";

var peer1 = new PeerConnection();
peer1.tx = peer1.createDataChannel("peer 1 -> 2");
var peer2 = new PeerConnection();
peer2.tx = peer2.createDataChannel("peer 2 -> 1");
const onMsg = function({data}) {
    alert(`${this.label} >> ${data}`);
};
let x = 0;
function step() {
    console.log(x++);
    return delay(1000);
}

delay(1000).then(step).then(step).then(step);

peer1.waitDataChannel()
    .then(channel=>channel.onmessage = onMsg);
peer2.waitDataChannel()
    .then(channel=>channel.onmessage = onMsg);

peer1.createOffer()
    .then((desc_cand)=>peer2.createAnswer(desc_cand))
    .then((desc_cand)=>peer1.onOfferAnswer(desc_cand))
    .then(()=>console.log("finish"))
    .then(()=>peer1.tx.readyState === 'open' || waitForEvent(peer1.tx, 'open'))
    .then(()=>peer1.tx.send('Hello'));