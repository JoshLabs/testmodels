console.log('Inside app.js');

var URL = window.webkitURL || window.URL;
const canvas = document.getElementById('canvas');
const canvasElement = document.getElementById('canvasOut');
const canvasCtx = canvasElement.getContext('2d');

const options = {
    selfieMode: true,
    maxNumFaces: 2,
    minDetectionConfidence: 0.5
};

var t0, t1;

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

function onResults(results) {

    const p = document.getElementById('result');

    console.log(results.multiFaceLandmarks);
    var text = "The face detection completed in " + (t1 - t0) + " ms and detected "+ (results.multiFaceLandmarks||[]).length +" faces.";
    text += "<br>"
    p.innerHTML = text;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION,
                       {color: '#C0C0C070', lineWidth: 1});
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#FF3030'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#30FF30'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
        drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});
      }
    }
    canvasCtx.restore();
  }

const detectFace = async () => {
    const p = document.getElementById('result');

    p.innerHTML = "Detecting ...";
    console.log('Loading model...');
    const faceMesh = new FaceMesh({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }});
      faceMesh.setOptions(options);

    console.log('Loaded model...');

    faceMesh.onResults(function(){});
    // Warmup runs
    for (j = 0; j < 3; j++) {
        // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
        // array of detected faces from the MediaPipe graph.
        await faceMesh.send({image: canvas});
    }

    //Final run with timing & render results.
    t0 = performance.now();
    faceMesh.onResults(onResults);
    await faceMesh.send({image: canvas});
    t1 = performance.now();
}
