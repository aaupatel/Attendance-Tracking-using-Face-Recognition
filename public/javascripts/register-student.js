document.addEventListener('DOMContentLoaded', () => {
    const modalElements = {
      chooseImageBtn: document.getElementById('chooseImageBtn'),
      captureFromCameraBtn: document.getElementById('captureFromCameraBtn'),
      uploadFromGalleryInput: document.getElementById('uploadFromGalleryInput'),
      imagePreviewContainer: document.getElementById('imagePreviewContainer'),
      imagePreview: document.getElementById('imagePreview'),
      retakeImageButton: document.getElementById('retakeImageButton'),
      captureImageModal: document.getElementById('captureImageModal'),
      cameraVideo: document.getElementById('cameraVideo'),
      captureImageButton: document.getElementById('captureImageButton'),
      cancelCaptureBtn: document.getElementById('cancelCaptureBtn'),
      studentForm: document.getElementById('studentForm')
    };
  
    function showModal(modal) {
      modal.style.display = 'flex';
    }
  
    function hideModals() {
      document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }
  
    modalElements.chooseImageBtn.addEventListener('click', () => showModal(document.getElementById('imageCaptureModal')));
  
    modalElements.captureFromCameraBtn.addEventListener('click', () => {
      hideModals();
      showModal(modalElements.captureImageModal);
  
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          modalElements.cameraVideo.srcObject = stream;
          modalElements.cameraVideo.play();
        })
        .catch(err => console.error('Error accessing webcam:', err));
    });
  
    modalElements.uploadFromGalleryInput.addEventListener('change', () => {
      const file = modalElements.uploadFromGalleryInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          showImagePreview(e.target.result);
          hideModals();
        };
        reader.readAsDataURL(file);
      }
    });
  
    modalElements.retakeImageButton.addEventListener('click', () => {
      hideModals();
      showModal(modalElements.captureImageModal);
      modalElements.cameraVideo.srcObject = null;
      modalElements.cameraVideo.style.display = 'block';
      modalElements.imagePreviewContainer.style.display = 'none';
  
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          modalElements.cameraVideo.srcObject = stream;
          modalElements.cameraVideo.play();
        })
        .catch(err => console.error('Error accessing webcam:', err));
    });
  
    modalElements.captureImageButton.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = modalElements.cameraVideo.videoWidth;
      canvas.height = modalElements.cameraVideo.videoHeight;
      ctx.drawImage(modalElements.cameraVideo, 0, 0, canvas.width, canvas.height);
      const imageDataURL = canvas.toDataURL('image/jpeg');
      showImagePreview(imageDataURL);
      hideModals();
      modalElements.cameraVideo.style.display = 'none';
      modalElements.imagePreviewContainer.style.display = 'block';
    });
  
    modalElements.cancelCaptureBtn.addEventListener('click', () => {
      hideModals();
      modalElements.cameraVideo.srcObject?.getTracks().forEach(track => track.stop());
      modalElements.cameraVideo.style.display = 'none';
    });
  
    function showImagePreview(imageDataURL) {
      modalElements.imagePreview.src = imageDataURL;
      modalElements.imagePreviewContainer.style.display = 'block';
    }
  
    modalElements.studentForm.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(modalElements.studentForm);
      if (modalElements.imagePreview.src) {
        const blob = dataURLtoBlob(modalElements.imagePreview.src);
        formData.append('studentImage', blob, 'studentImage.jpg');
      }
      fetch('/registerstudent', {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
      .then(result => {
        console.log('Registration result:', result);
        alert('Student registered successfully!');
        modalElements.studentForm.reset();
        modalElements.imagePreviewContainer.style.display = 'none';
      })
      .catch(error => {
        console.error('Registration error:', error);
        alert('Error registering student. Please try again.');
      });
    });
  
    function dataURLtoBlob(dataURL) {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }
      return new Blob([u8arr], { type: mime });
    }
  });
