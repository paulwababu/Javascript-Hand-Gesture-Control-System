const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const slide = document.getElementById("slide");
const ctx = canvas.getContext("2d");

const totalSlides = 8;
let currentSlide = 1;
let lastDetectionTime = new Date().getTime();
const detectionDelay = 5000; // 5 seconds
let prevGesture = null;

const init = async () => {
    await setupCamera();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const handposeModel = await handpose.load();
    detectHands(handposeModel);
};

const setupCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    return new Promise((resolve) => video.onloadedmetadata = resolve);
};

function showAlert(message) {
    const alertPlaceholder = document.getElementById('alert-placeholder');
    const alertHtml = `<div class="alert alert-info alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`;
    alertPlaceholder.innerHTML = alertHtml;
    setTimeout(() => {
        $('.alert').alert('close');
    }, 3000);
}

const detectHands = async (handposeModel) => {
    const handEstimates = await handposeModel.estimateHands(video);
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    if (handEstimates.length > 0) {
        const hand = handEstimates[0];
        const landmarks = hand.landmarks;

        landmarks.forEach(landmark => {
            ctx.beginPath();
            ctx.arc(landmark[0], landmark[1], 5, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
        });

        const currentTime = new Date().getTime();
        if (currentTime - lastDetectionTime > detectionDelay) {
            const isThumbUp = landmarks[3][1] < landmarks[2][1] && landmarks[4][1] < landmarks[2][1];
            const isThumbDown = landmarks[3][1] > landmarks[2][1] && landmarks[4][1] > landmarks[2][1];

            if (isThumbUp && prevGesture !== 'thumbUp') {
                prevGesture = 'thumbUp';
                console.log("Next");
                if (currentSlide < totalSlides) {
                    currentSlide++;
                    slide.src = `slides/slide${currentSlide}.png`;
                    lastDetectionTime = currentTime;
                    showAlert("Next");
                }
            } else if (isThumbDown && prevGesture !== 'thumbDown') {
                prevGesture = 'thumbDown';
                console.log("Previous");
                if (currentSlide > 1) {
                    currentSlide--;
                    slide.src = `slides/slide${currentSlide}.png`;
                    lastDetectionTime = currentTime;
                    showAlert("Previous");
                }
            } else {
                prevGesture = null;
            }
        }
    }

    requestAnimationFrame(() => detectHands(handposeModel));
};

init();
