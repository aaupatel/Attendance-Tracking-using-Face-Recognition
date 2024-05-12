document.addEventListener('DOMContentLoaded', () => {
  const modalElements = {
    chooseImageBtn: document.getElementById('chooseImageBtn'),
    chooseImageModal: document.getElementById('chooseImageModal'),
    uploadFromGalleryBtn: document.getElementById('uploadFromGalleryBtn'),
    captureFromCameraBtn: document.getElementById('captureFromCameraBtn'),
    captureImageModal: document.getElementById('captureImageModal'),
    cameraVideo: document.getElementById('cameraVideo'),
    imagePreviewContainer: document.getElementById('imagePreviewContainer'),
    registerBtn: document.getElementById('registerBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    captureImageButton: document.getElementById('captureImageButton'),
    cancelCaptureBtn: document.getElementById('cancelCaptureBtn'),
    nextButton: document.getElementById('nextButton'),
    prevButton: document.getElementById('prevButton')
  };

  let imageCount = 0;
  const selectedImages = [];
  let currentImageIndex = 0;
  
  function nextImage(){
    if(imageCount > 1){
      currentImageIndex = (currentImageIndex + 1) % imageCount;
      showImage(currentImageIndex);
    }
  }

  function prevImage(){
    if(imageCount > 1){
      currentImageIndex = (currentImageIndex - 1) % imageCount;
      showImage(currentImageIndex);
    }
  }

  modalElements.nextButton.addEventListener('click', (event) => {
    event.preventDefault();
    nextImage();
  });

  modalElements.prevButton.addEventListener('click', (event) => {
    event.preventDefault();
    prevImage();
  });

  function showImage(index) {
    const images = modalElements.imagePreviewContainer.querySelectorAll('img');
    if (images.length > 0) {
      images.forEach((img, idx) => {
        if (idx === index) {
          img.style.display = 'block';
        } else {
          img.style.display = 'none';
        }
      });
      currentImageIndex = index;
    }
  }
  
  function showModal(modal) {
    modal.style.display = 'flex';
  }

  function hideModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
  }

  modalElements.chooseImageBtn.addEventListener('click', () => {
    showModal(modalElements.chooseImageModal);
  });

  modalElements.uploadFromGalleryBtn.addEventListener('click', () => {
    const remainingImages = 3 - imageCount;
    if (remainingImages > 0) {
      const imageInput = document.createElement('input');
      imageInput.type = 'file';
      imageInput.accept = 'image/*';
      imageInput.multiple = true;
      imageInput.style.display = 'none';
      imageInput.addEventListener('change', handleImageUpload);
      document.body.appendChild(imageInput);
      imageInput.click();
    } else {
      alert('You can upload a maximum of ' + remainingImages + ' images.');
    }
  });

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

  modalElements.captureImageButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = modalElements.cameraVideo.videoWidth;
    canvas.height = modalElements.cameraVideo.videoHeight;
    ctx.drawImage(modalElements.cameraVideo, 0, 0, canvas.width, canvas.height);
    const imageDataURL = canvas.toDataURL('image/jpeg');
    showImagePreview(imageDataURL);
  });

  modalElements.cancelCaptureBtn.addEventListener('click', () => {
    hideModals();
    if (modalElements.cameraVideo.srcObject) {
      modalElements.cameraVideo.srcObject.getTracks().forEach(track => track.stop());
    }
  });

  function showImagePreview(imageDataURL) {
    const imgElement = document.createElement('img');
    imgElement.src = imageDataURL;
    imgElement.classList.add('block', 'mx-auto', 'mb-2','absolute', 'w-full', 'h-full', 'object-cover');
    const imageId = `image-${imageCount}`;
    imgElement.id = imageId;
    modalElements.imagePreviewContainer.appendChild(imgElement);
    selectedImages.push(imageDataURL);
    imageCount++;
    if(imageCount ===1){
      modalElements.imagePreviewContainer.style.display = 'block';
    } else {
      imgElement.style.display = 'none';
    }
    if (imageCount >= 3) {
      modalElements.registerBtn.style.display = 'block';
      modalElements.chooseImageBtn.style.display = 'none';
      modalElements.cancelBtn.style.display = 'block';
    }
    hideModals();
    if (modalElements.cameraVideo.srcObject) {
      modalElements.cameraVideo.srcObject.getTracks().forEach(track => track.stop());
    }
  }

  modalElements.cancelBtn.addEventListener('click', () => {
    hideModals();
    modalElements.imagePreviewContainer.innerHTML = '';
    selectedImages.length = 0;
    imageCount = 0;
    modalElements.registerBtn.style.display = 'none';
    modalElements.chooseImageBtn.style.display = 'block';
    modalElements.cancelBtn.style.display = 'none';
    modalElements.imagePreviewContainer.style.display = 'none';
  });

  function handleImageUpload(event) {
    const files = event.target.files;
    const remainingImages = 3 - imageCount;
    
    if (files && files.length > 0) {
      const uploadCount = Math.min(files.length, remainingImages);
      for (let i = 0; i < uploadCount; i++) {
        const file = files[i];
        if (file.size > (10 * 1024 * 1024)) { // server-side limit (10 MB)
          alert('File size exceeds maximum allowed (10 MB). Please choose a smaller file.');
          continue; 
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          showImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  modalElements.registerBtn.addEventListener('click', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('name', document.querySelector('input[name="name"]').value);
    formData.append('enrollmentNo', document.querySelector('input[name="enrollmentNo"]').value);

    selectedImages.forEach((dataURL, index) => {
        const blob = dataURLtoBlob(dataURL);
        formData.append(`studentImages`, blob, `studentImage${index + 1}.jpg`);
    });

    try {
        const response = await fetch('/registerstudent', {
            method: 'POST',
            body: formData,
            redirect: 'follow'
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log(responseData.message);
            alert('Student registered successfully!');
            document.querySelector('input[name="name"]').value = '';
            document.querySelector('input[name="enrollmentNo"]').value = '';
            modalElements.imagePreviewContainer.innerHTML = '';
            selectedImages.length = 0;
            imageCount = 0;
            modalElements.registerBtn.style.display = 'none';
            modalElements.chooseImageBtn.style.display = 'block';
            modalElements.cancelBtn.style.display = 'none';
            modalElements.imagePreviewContainer.style.display = 'none';
        } else {
            throw new Error('Failed to register student.');
        }
    } catch (error) {
        console.error('Error registering student:', error);
        alert('Error registering student. Please try again.');
    }
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
