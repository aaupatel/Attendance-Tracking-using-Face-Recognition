document.addEventListener('DOMContentLoaded', async () => {
  const studentElements = document.querySelectorAll('.student');
  const studentData = [];

  for (const studentElement of studentElements) {
    const name = studentElement.querySelector('h3').textContent.trim();
    const student_id = studentElement.querySelector('h2').textContent.trim();
    const enrollmentNo = studentElement.querySelector('p').textContent.split(':')[1].trim();
    const imageElements = studentElement.querySelectorAll('img');
    const images = [];

    imageElements.forEach((imageElement) => {
      const imageSrc = imageElement.getAttribute('src');
      images.push(imageSrc); 
    });

    studentData.push({ name, enrollmentNo, images, student_id });

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
        inputSize: 320,
        scoreThreshold: 0.5
      })).withFaceLandmarks()
      .withFaceDescriptors();

      context.clearRect(0, 0, canvas.width, canvas.height);

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      const labeledDescriptors = studentData.map(async student => {
        const descriptors = await Promise.all(student.images.map(async imageSrc => {
          const image = await faceapi.fetchImage(imageSrc);
          const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();
          return detection.descriptor;
        }));
        return new faceapi.LabeledFaceDescriptors(student.student_id, descriptors);
      });
      
      const resolvedLabelDescriptors = await Promise.all(labeledDescriptors);
      if(resizedDetections.length > 0){
        showInstraction();
        //console.log("Please wait")
      }
      //console.log(`Detected ${resizedDetections.length} face(s)`);
      
      
      resizedDetections.forEach(async detection => {
        const faceMatcher = new faceapi.FaceMatcher(resolvedLabelDescriptors, 0.5);
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        if (bestMatch.label !== 'unknown') {
          const studentId = bestMatch.label;
          const currentDate = new Date().toISOString().split('T')[0];
          const currentTime = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

          const message = await markAttendance(studentId, currentDate,currentTime);
          showMessage(message);
        
        } else {
          showMessage("Unknown Person");
          //console.log(`Unknown Person`);
        }
      });

    } catch (error) {
      console.error('Error detecting faces:', error);
    }
  }, 500); // Adjust interval as needed
}

async function markAttendance(studentId, currentDate, currentTime) {
  try {
    const response = await fetch('/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studentId, currentDate, currentTime })
    });

    if (!response.ok) {
      throw new Error(`Failed to mark attendance: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.message === 'Attendance already marked') {
      return `${studentId} has already marked present at ${data.time}`;
    } else {
      return data.message;
    }
  } catch (error) {
    console.error('Error marking attendance:', error.message);
  }
}

function showMessage(message) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000); // Adjust the duration as needed
}

function showInstraction() {
  const InstractionDiv = document.getElementById('Instraction');
  InstractionDiv.style.display = 'block';
  setTimeout(() => {
    InstractionDiv.style.display = 'none';
  }, 1000); // Adjust the duration as needed
}