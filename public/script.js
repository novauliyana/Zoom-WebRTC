const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const screenCapture = document.getElementById('capture');
const start = document.getElementById('share_screen');
const capt = document.getElementById('capt');

var peer = new Peer();

let screenShareStream;

let myVideoStream;
const myVideo = document.createElement('video');
myVideo.muted = false;
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', userId => {
        connecToNewUser(userId, stream);
        console.log('new user joined', userId)
    })

    //input
    let text = $('input')
    //press enter
    $('html').keydown(function (e) {
        if (e.which == 13 && text.val().length !== 0) {
            console.log(text.val())
            socket.emit('message', text.val());
            text.val('')
        }
    });

    socket.on('createMessage', message => {
        console.log(message)
        $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`)
        scrollToBottom()
    })
})


var displayMediaOptions = {
    video: {
        cursor: 'always'
    },
    audio: true
}

start.addEventListener("click", function (e) {
    startCapture();
}, false)

async function startCapture() {
    capt.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
}

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
    console.log(userId, ' leave')
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
    console.log('id ', id)
})


function connecToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    })

    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {

    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}
const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

// mute our video
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-volume-up"></i
    <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-volume-mute"></i>
    <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}



const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}