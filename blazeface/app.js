console.log('Inside app.js');

var URL = window.webkitURL || window.URL;
const canvas = document.getElementById('canvas');
const canvasOut = document.getElementById('canvasOut');

console.log('Registered window.onload function ...');
window.onload = function() {
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
    console.log('Loading model...')
    const model = await blazeface.load({scoreThreshold: 0.95});
    console.log('Loaded model...')

    var predictions;
    var t0, t1;

    for (j = 0; j < 5; j++) {
        var t0 = performance.now()
        // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
        // array of detected faces from the MediaPipe graph. If passing in a video
        // stream, a single prediction per frame will be returned.
        predictions = await model.estimateFaces(canvas, false);
        console.log(predictions);
        var t1 = performance.now()
    }
    if (predictions.length > 0) {
        var prediction = predictions[0]
        var text = "The face detection completed in " + (t1 - t0) + " ms.<br>The face matched with predictions of " + predictions[0].probability[0];
        text += "<br>"
        text += `<strong>Right Eye:</strong> <br> x = ${prediction.landmarks[0][0]}; y = ${prediction.landmarks[0][1]}<br>`
        text += `<strong>Left Eye:</strong> <br> x = ${prediction.landmarks[1][0]}; y = ${prediction.landmarks[1][1]}<br>`
        text += `<strong>Nose:</strong> <br> x = ${prediction.landmarks[2][0]}; y = ${prediction.landmarks[2][1]}<br>`
        text += `<strong>Mouth:</strong> <br> x = ${prediction.landmarks[3][0]}; y = ${prediction.landmarks[3][1]}<br>`
        text += `<strong>Right Ear:</strong> <br> x = ${prediction.landmarks[4][0]}; y = ${prediction.landmarks[4][1]}<br>`
        text += `<strong>Left Ear:</strong> <br> x = ${prediction.landmarks[5][0]}; y = ${prediction.landmarks[5][1]}<br>`
        renderPrediction(predictions);
    } else {
        var text = "No face found in the image.";
    }
    p.innerHTML = text;
}

const renderPrediction = (predictions) => {
    if (predictions.length > 0) {
        var ctxOut = canvasOut.getContext('2d');
        ctxOut.clearRect(0, 0, canvas.width, canvas.height);
        ctxOut.drawImage(canvas, 0, 0);

        for (let i = 0; i < predictions.length; i++) {
            const start = predictions[i].topLeft;
            const end = predictions[i].bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];
            ctxOut.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctxOut.fillRect(start[0], start[1], size[0], size[1]);

            const landmarks = predictions[i].landmarks;

            ctxOut.fillStyle = "blue";
            for (let j = 0; j < landmarks.length; j++) {
              const x = landmarks[j][0];
              const y = landmarks[j][1];
              ctxOut.fillRect(x, y, 5, 5);
            }
        }
    }
}

const changeBackend = async () => {
    console.log('Changing backend');
    var x = document.getElementById("backend").value;
    
    // Set wasm paths required for tfjs-backend-wasm when using bundlers.
    // This only set the paths for files and does not download them.
    tf.wasm.setWasmPaths({
        'tfjs-backend-wasm.wasm': '/assets/wasm/tfjs-backend-wasm.wasm',
        'tfjs-backend-wasm-simd.wasm': '/assets/wasm/tfjs-backend-wasm-simd.wasm',
        'tfjs-backend-wasm-threaded-simd.wasm': '/assets/wasm/tfjs-backend-wasm-threaded-simd.wasm'
    });
    
    await tf.setBackend(x);
    var p = document.getElementById("backendText");
    p.innerHTML = x + " backend is successfully selected.";
}
