console.log("Script loaded");

document.addEventListener('DOMContentLoaded', async () => {
  const studentElements = document.querySelectorAll('.student');
  const studentData = [];

  for (const studentElement of studentElements) {
    const name = studentElement.querySelector('h3').textContent.trim();
    const enrollmentNo = studentElement.querySelector('p').textContent.split(':')[1].trim();
    const imageSrc = studentElement.querySelector('img').getAttribute('src');

    studentData.push({ name, enrollmentNo, imageSrc });
    console.log(imageSrc);
  };
  // Start the video stream and initiate face detection
  await startVideo();
});

// Load face-api.js models and start video stream
async function startVideo() {
  const video = document.getElementById('video');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
    await video.play();

    // Load face detection, landmark, recognition, and expression models
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');

    // Initiate face detection loop
    detectFaces(video);
  } catch (error) {
    console.error('Error accessing webcam or loading models:', error);
  }
}

// Detect faces, landmarks, and descriptors on the video stream
function detectFaces(video) {
  const canvas = document.createElement('canvas');
  canvas.willReadFrequently = true; // Set the attribute to optimize read operations
  document.body.appendChild(canvas);

  // Match canvas dimensions to video stream dimensions
  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  canvas.width = displaySize.width;
  canvas.height = displaySize.height;
  
  const context = canvas.getContext('2d');

  // Start face detection loop
  setInterval(async () => {
    try {
      // Detect faces with landmarks and descriptors
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.5
      })).withFaceLandmarks()
        .withFaceDescriptors();

      // Clear canvas before drawing new detections
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bounding boxes and landmarks for detected faces
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      // Log the number of detected faces
      console.log(`Detected ${resizedDetections.length} face(s)`);
    } catch (error) {
      console.error('Error detecting faces:', error);
    }
  }, 500); // Adjust interval as needed
}
