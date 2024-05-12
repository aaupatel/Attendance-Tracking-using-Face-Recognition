document.addEventListener('DOMContentLoaded', async () => {
  const studentElements = document.querySelectorAll('.student');
  const studentData = [];

  for (const studentElement of studentElements) {
    const name = studentElement.querySelector('h3').textContent.trim();
    const enrollmentNo = studentElement.querySelector('p').textContent.split(':')[1].trim();
    const imageElements = studentElement.querySelectorAll('img');
    const images = [];

    imageElements.forEach((imageElement) => {
      const imageSrc = imageElement.getAttribute('src');
      images.push(imageSrc); 
    });

    studentData.push({ name, enrollmentNo, images });

    // images.forEach((imageSrc, index) => {
    //   console.log(`Student Name: ${name}, Enrollment No: ${enrollmentNo}, Image ${index + 1}: ${imageSrc}`);
    // });
  }

  await startVideo(studentData);
});

async function startVideo(studentData) {
  const video = document.getElementById('video');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
    await video.play();

    await faceapi.nets.tinyFaceDetector.loadFromUri('/weights');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/weights');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/weights');
    await faceapi.nets.faceExpressionNet.loadFromUri('/weights');
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/weights');
    detectFaces(video, studentData);
  } catch (error) {
    console.error('Error accessing webcam or loading models:', error);
  }
}

async function detectFaces(video, studentData) {
  const canvas = document.createElement('canvas');
  canvas.willReadFrequently = true; 
  document.body.appendChild(canvas);

  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  canvas.width = displaySize.width;
  canvas.height = displaySize.height;

  const context = canvas.getContext('2d');

  setInterval(async () => {
    try {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.5
      })).withFaceLandmarks()
      .withFaceDescriptors();

      context.clearRect(0, 0, canvas.width, canvas.height);

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      const labeledDescriptors = studentData.map(async student => {
        const descriptors = await Promise.all(student.images.map(async imageSrc => {
          const image = await faceapi.fetchImage(imageSrc);
          const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
          return detection.descriptor;
        }));
        return new faceapi.LabeledFaceDescriptors(student.name, descriptors);
      });
      
      const resolvedLabelDescriptors = await Promise.all(labeledDescriptors);
      
      console.log(`Detected ${resizedDetections.length} face(s)`);
      
      resizedDetections.forEach(detection => {
        const faceMatcher = new faceapi.FaceMatcher(resolvedLabelDescriptors, 0.5);
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        if (bestMatch.label !== 'unknown') {

          function displayCurrentTime() {
            let currentDate = new Date();
            let date = currentDate.toDateString();
            let time = currentDate.toLocaleTimeString();
            let dateTimeString = `Current Date and Time: ${date}, ${time}`;
            console.log(dateTimeString);
        }
        displayCurrentTime();
        
        console.log(`Match found: ${bestMatch.label}`);
        } else {
          console.log(`Unknown Person`);
        }
      });

    } catch (error) {
      console.error('Error detecting faces:', error);
    }
  }, 1000); // Adjust interval as needed
}
