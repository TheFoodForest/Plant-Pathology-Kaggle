// const inputImg = tf.fromPixels( /*fileUpload or deviceCamera*/ );
// activate device camera with button press
// capture image to canvas of size for model
// collect imageData from canvas and predict with TensorFlow

const startCamBtn = document.querySelector('#camera-access');
const stopCamBtn = document.querySelector('#camera-exit');
const cameraOptions = document.querySelector('#camera-select');
const capturedImages = document.querySelector('#captured-images');
const canvasDiv = document.querySelector('#canvas-div');
const loadDiv = document.querySelector('#loading-overlay');
const video = document.querySelector('video');
const capture = document.querySelector('#capture');
let streamStarted = false;

const constraints = {
    video: {
        // facingMode: { 
        //     exact: "environment" 
        // },
        width: {
            ideal: 2048
        },
        height: {
            ideal: 1365
        },
    }
};

const getCameraSelection = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const options = videoDevices.map(videoDevice => {
        return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
    });
    cameraOptions.innerHTML = options.join('');
};

startCamBtn.addEventListener('click', event => {
    if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
        const updatedConstraints = {
            ...constraints,
            deviceId: {
                exact: cameraOptions.value
            }
        };
        startStream(updatedConstraints);
    }

});


const startStream = async (constraints) => {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleStream(stream);
};

const stopStream = (stream) => {
    video.srcObject = null;
    streamStarted = false;
};

const handleStream = (stream) => {
    video.srcObject = stream;
    streamStarted = true;
};

cameraOptions.onchange = () => {
    const updatedConstraints = {
        ...constraints,
        deviceId: {
            exact: cameraOptions.value
        }
    };
    startStream(updatedConstraints);
};

const captureImg = () => {
    canvasDiv.innerHTML += '<canvas id="hidden-canvas" width="2048" height="1365" hidden></canvas>';
    const canvas = document.querySelector('#hidden-canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    imgUrl = canvas.toDataURL('image/webp');
    capturedImages.innerHTML += `<div class="col s12 m6">
        <div class="card">
            <div class="card-image">
                <img src="${imgUrl}">
                <div class="card-content green-text text-darken-4">
                    <span>
                        <p>Prediction will show here.</p>
                    </span>
                </div>
                <a class="btn-floating halfway-fab waves-effect waves-light green"><i class="material-icons">online_prediction</i></a>
            </div>
        </div>
    </div>`;

    // erase canvas to conserve memory
    canvasDiv.innerHTML = null;

};
// Prediction button logic
// onclick draw img to hidden canvas and then get ImageData to pass to TensorFlow
document.arrive('div.card-image', function () {

    const imgEl = this.querySelector('img');
    const spanEl = this.querySelector('span');
    const btnEl = this.querySelector('a');

    btnEl.addEventListener('click', event => {

        // show preloader
        loadDiv.classList.add('loading-overlay');
        loadDiv.innerHTML += `<div class="progress">
                                    <div class="indeterminate"></div>
                                </div>`;

        // get image src and draw to hidden canvas then get ImageData and pass that to prediction functions, 
        canvasDiv.innerHTML += '<canvas id="hidden-canvas" width="2048" height="1365" hidden></canvas>';
        const canvas = document.querySelector('#hidden-canvas');
        const ctx = canvas.getContext("2d");
        const image = new Image;
        image.src = imgEl.getAttribute('src');
        image.onload = () => {
            ctx.drawImage(image, 0, 0);
            imageData = ctx.getImageData(0, 0, 2048, 1365);
            // console.log(imageData);

            // pass imageDATA to TensorFlow here
            predict(imageData, spanEl, imgEl.getAttribute('src'));
        };

        // erase canvas to conserve memory
        canvasDiv.innerHTML = null;

    });
});

capture.onclick = captureImg;
stopCamBtn.onclick = stopStream;
getCameraSelection();