

const socket = io(); //init connection , we get an object in return



//event names
const SERVER_LOCATION_EVENT = "serverLocationMsgEvent";
const CLIENT_LOCATION_EVENT = "clientLocationEvent";
const SERVER_NORMAL_EVENT = "serverNormalMsgEvent";
const CLIENT_NORMAL_EVENT = "clientNormalMsgEvent";
const JOIN_EVENT = "join";
const ROOM_DATA_CHANGE_EVENT = "changed";




//DOM Elements
const $message_form = document.querySelector('#message-form');
const $message_form_input = $message_form.querySelector('input');
const $message_form_btn = $message_form.querySelector('button');
const $send_location_btn = document.querySelector('#send-location-btn');
const $message_container = document.querySelector('#message-container');//parend div ,where all msgs will be rendered
const $sidebar_container = document.querySelector('#sidebar-container');//parend div ,where all msgs will be rendered


//DOM Templates
const $message_template = document.querySelector('#text-message-template').innerHTML; //template of a single msg
const $location_template = document.querySelector('#location-message-template').innerHTML; //template of a single msg
const $sidebar_template = document.querySelector('#sidebar-template').innerHTML; //template of a single msg




//parsing query params from url
function getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

const username = getQueryStringValue("username");
const room = getQueryStringValue("room");



//only for text/normal msgs received from server
socket.on(SERVER_NORMAL_EVENT, (msgObj) => {
    // console.log(msg);

    //form a html to be rendered
    const html = Mustache.render($message_template, {
        senderName: msgObj.senderName,
        renderedMsg: msgObj.text,
        createdAt: moment(msgObj.createdAt).format('h:mm A')
    });
    //the put at the last in this div
    $message_container.insertAdjacentHTML('beforeend', html);
    autoscroll();
});



//only for location based msgs from server
socket.on(SERVER_LOCATION_EVENT, (locMsg) => {

    //form a html to be rendered
    const html = Mustache.render($location_template, {
        senderName: locMsg.senderName,
        locationHref: locMsg.url,
        createdAt: moment(locMsg.createdAt).format('h:mm A')
    });
    //the put at the last in this div
    $message_container.insertAdjacentHTML('beforeend', html);
    autoscroll();
});


//when room data changes
socket.on(ROOM_DATA_CHANGE_EVENT, (changeObj) => {

    //form a html to be rendered
    const html = Mustache.render($sidebar_template, {
        room: changeObj.roomName,
        users: changeObj.users,
    });
    //the put at the last in this div
    $sidebar_container.innerHTML = html;

});




//1st argument is event name
//follwed by username , room and callback
socket.emit(JOIN_EVENT, username, room, (err) => {

    if (err) {
        alert(err);
        location.href = '/';
    }

});





$message_form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $message_form_input.value;
    if (msg.length == 0) {
        return;
    }

    //disable send button
    $message_form_btn.setAttribute('disabled', 'disabled');

    //acknowledgement function as final argument
    socket.emit(CLIENT_NORMAL_EVENT, msg, (serverAck) => {

        //re-enable send button
        $message_form_btn.removeAttribute('disabled');
        $message_form_input.value = '';
        $message_form_input.focus();

        console.log('server has received the msg ! ' + serverAck);
    });
});


$send_location_btn.addEventListener('click', () => {

    if (!navigator.geolocation) {
        alert("Your browser does not supports this feature !")
    }

    //disabled button
    $send_location_btn.setAttribute('disabled', 'disabled');


    navigator.geolocation.getCurrentPosition((location) => {

        const myLocation = {
            lat: location.coords.latitude,
            lon: location.coords.longitude
        }

        socket.emit(CLIENT_LOCATION_EVENT, myLocation, () => {

            //re-enable button
            $send_location_btn.removeAttribute('disabled');

            console.log('Location Shared !');
        });

    });

});



const autoscroll = () => {
    // New message element
    const $newMessage = $message_container .lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $message_container.offsetHeight

    // Height of messages container
    const containerHeight = $message_container.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $message_container.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $message_container.scrollTop = $message_container.scrollHeight
    }
}