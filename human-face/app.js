console.log('Inside app.js');


const human = new Human.Human({});

var URL = window.webkitURL || window.URL;
const canvas = document.getElementById('canvas');
const canvasOut = document.getElementById('canvasOut');

console.log('Registered window.onload function ...');
window.onload = async function() {
    var input = document.getElementById('input');
    input.addEventListener('change', handleFiles, false);
    loadImage("../test.jpeg");
}

function handleFiles(e) {
    var url = URL.createObjectURL(e.target.files[0]);
    loadImage(url);
}

function loadImage(url) {
    var ctx = canvas.getContext('2d');
    var ctxOut = canvasOut.getContext('2d');
    var img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0, 320, 240);
    }
    ctxOut.clearRect(0, 0, canvas.width, canvas.height);
    img.src = url;
}

const detectFace = async () => {
    const p = document.getElementById('result');

    p.innerHTML = "Detecting ...";

    console.log('Loading model...');
    const userConfig = {
        backend: 'wasm',
        async: false,
        profile: false,
        warmup: 'full',
        modelBasePath: './models/',
        wasmPath: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@3.8.0/dist/',
        filter: { enabled: false },
        face: { enabled: true,
          detector: { rotation: document.getElementById("rotation").checked, maxDetected: 3 },
          mesh: { enabled: document.getElementById("mesh").checked },
          iris: { enabled: false },
          description: { enabled: false },
          emotion: { enabled: false },
        },
        hand: { enabled: false },
        gesture: { enabled: false },
        body: { enabled: false },
        object: { enabled: false },
    };
    console.log('Loaded model...');

    var predictions;
    var result;
    var t0, t1;

    for (j = 0; j < 5; j++) {
        var t0 = performance.now();
        // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
        // array of detected faces from the MediaPipe graph. If passing in a video
        // stream, a single prediction per frame will be returned.
        result = await human.detect(canvas, userConfig);
        predictions = result.face;
        console.log(predictions);
        var t1 = performance.now()
    }

    var text = "The face detection completed in " + (t1 - t0) + " ms and found " + predictions.length + " faces.<br><br>";

    if (predictions.length > 0) {
        var prediction = predictions[0]
        text += "The face matched with predictions of " + prediction.faceScore + " -  box score - "+ prediction.boxScore;
        text += "<br>"
    }

    var ctxOut = canvasOut.getContext('2d');
    ctxOut.clearRect(0, 0, canvas.width, canvas.height);
    ctxOut.drawImage(canvas, 0, 0);
    human.draw.all(canvasOut, result);
    p.innerHTML = text;
}