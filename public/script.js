const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const user = prompt("Enter your name");


var peer = new Peer()

let screenShareStream;

let myVideoStream;
const myVideo = document.createElement('video');
myVideo.muted = true;
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
        //setTimeout(connecToNewUser, 1000, userId, stream)
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

    socket.on('createMessage', (message, userName) => {
        console.log(message)
        $("ul").append(`<li class="message"><b>${userName === user ? "me" : userName
            }</b><br/>${message}</li>`)
        scrollToBottom()
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
    console.log(userId, ' leave')
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, user);
    console.log('id ', id);
    console.log('user', user)
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
        const html = `
    <i class="fas fa-volume-up"></i
    
    `
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
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


const shareScreen = async () => {
    const socket = io('/')
    //const videoGrid = document.getElementById('capture')
    const videoGrid = document.getElementById('video-grid');
    var myPeer = new Peer()
    const peers = {}
    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    }).then(stream => {
        myPeer.on('call', call => {
            call.answer(stream)
            //const video2 = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video2, userVideoStream)
            })
        })

        socket.on('user-connected', userId => {
            //setTimeout(connecToNewUser, 1000, userId, stream)
            connecToNewUser(userId, stream);
        })

    })

    socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close()
    })

    myPeer.on('open', id => {
        socket.emit('join-room', ROOM_ID, id)
    })

    function addVideoStream(video2, stream) {
        video2.srcObject = stream
        video2.addEventListener('loadedmetadata', () => {
            video2.play()
        })
        videoGrid.append(video2)
    }
};

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
function closeBtnClicked() {
    const konfirm = confirm("Apakah kamu yakin akan meninggalkan room ini?");
    if (konfirm) {
        window.close();
        if (peers[userId]) peers[userId].close()
        console.log(userId, ' leave')
    }
}