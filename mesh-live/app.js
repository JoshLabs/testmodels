console.log('Inside app.js');

var URL = window.webkitURL || window.URL;

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

const canvasOut = document.getElementById('canvasOut');
var ctxOut = canvasOut.getContext('2d');

var shouldFaceUser = true;
var stream = null;
var model = null;
var w = 320;
var h = 240;

window.addEventListener('DOMContentLoaded', function() {
    var isStreaming = false;
    switchcamerabtn = document.getElementById('switch-camera-btn');

    // Wait until the video stream canvas play
    video.addEventListener('canplay', function(e) {
        if (!isStreaming) {
            // videoWidth isn't always set correctly in all browsers
            if (video.videoWidth > 0) h = video.videoHeight / (video.videoWidth / w);
            canvas.setAttribute('width', w);
            canvas.setAttribute('height', h);
            isStreaming = true;
        }
    }, false);

    // Wait for the video to start to play
    video.addEventListener('play', async function() {
        // load models
        console.log('Loading model...')
        model = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, {
                shouldLoadIrisModel: false,
                maxFaces: 3,
                maxContinuousChecks: 0,
            });
        console.log('Loaded model...');

        detectFromVideoFrame();
    });

    // check whether we can use facingMode
    var supports = navigator.mediaDevices.getSupportedConstraints();
    if (supports['facingMode'] === true) {
        switchcamerabtn.disabled = false;
    }

    switchcamerabtn.addEventListener('click', function() {
        if (stream == null)
            return

        stream.getTracks().forEach(t => {
            t.stop();
        });

        shouldFaceUser = !shouldFaceUser;
        capture();
    });

    capture();
});

function capture() {
    var constraints = { audio: false, video: { width: 640, height: 480, facingMode: shouldFaceUser ? 'user' : 'environment' } };
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(mediaStream) {
            var video = document.querySelector('video');
            stream = mediaStream;
            video.srcObject = mediaStream;
            video.onloadedmetadata = function(e) {
                video.play();
            };
        })
        .catch(function(err) {
            console.log(err.message);
        });
}

var detectFromVideoFrameTimeout = null;

function scheduleVideoProctoring() {
    detectFromVideoFrameTimeout = setTimeout(() => {
        detectFromVideoFrame();
    }, 1000);
}

function detectFromVideoFrame() {
    clearTimeout(detectFromVideoFrameTimeout);

    ctxOut.clearRect(0, 0, canvas.width, canvas.height);
    drawVideoSnapshotToCanvas();

    processFaceDetection();
}

function drawVideoSnapshotToCanvas() {
    if (video.paused || video.ended) return;

    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

const processFaceDetection = async () => {
    const p = document.getElementById('result');
    p.innerHTML = "Detecting ...";

    for (j = 0; j < 5; j++) {
        var t0 = performance.now()
        // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
        // array of detected faces from the MediaPipe graph. If passing in a video
        // stream, a single prediction per frame will be returned.
        predictions = await model.estimateFaces({input: canvas, predictIrises: false});
        console.log(predictions);
        var t1 = performance.now()
    }

    var text = "The face detection completed in " + (t1 - t0) + " ms and found " + predictions.length + " faces.<br><br>";

    for (k = 0; k < predictions.length ; k++) {
        var prediction = predictions[k]
        text += `<br><strong>Prediction of Face ${k+1}:</strong><br>`;
        text += `The face matched with predictions of <strong>${prediction.faceInViewConfidence}</strong><br>`;
        text += `<strong>TopLeft:</strong> = ${prediction.boundingBox.topLeft}<br>`;
        text += `<strong>BottomRight:</strong> = ${prediction.boundingBox.bottomRight}<br>`;
        renderPrediction(predictions);
    }
    p.innerHTML = text;

    scheduleVideoProctoring();
}

console.log('Registered window.onload function ...');
window.onload = async function() {
    await changeBackend();
}

const renderPrediction = (predictions) => {    
    ctxOut.clearRect(0, 0, canvas.width, canvas.height);

    if (predictions.length > 0) {
        ctxOut.drawImage(canvas, 0, 0);

        for (let i = 0; i < predictions.length; i++) {
            const start = predictions[i].boundingBox.topLeft;
            const end = predictions[i].boundingBox.bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];
            ctxOut.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctxOut.fillRect(start[0], start[1], size[0], size[1]);
        }
    }
}

const changeBackend = async () => {
    console.log('Changing backend');
    var x = document.getElementById("backend").value;
    
    tf.wasm.setWasmPaths(
        `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tf.wasm.version_wasm}/dist/`);
        
    await tf.setBackend(x);
    var p = document.getElementById("backendText");
    p.innerHTML = x + " backend is successfully selected.";
}
