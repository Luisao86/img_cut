document.addEventListener('DOMContentLoaded',function(){
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let img = new Image();
  let startX, startY, endX, endY;
  let isDrawing = false;
  let scaleFactor = 1;

  document.getElementById('upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      img.src = e.target.result;
      img.onload = function() {
        const maxWidth = 800; // Ajusta el ancho máximo según sea necesario
        const maxHeight = 600; // Ajusta la altura máxima según sea necesario

        if (img.width > maxWidth || img.height > maxHeight) {
          const widthRatio = maxWidth / img.width;
          const heightRatio = maxHeight / img.height;
          scaleFactor = Math.min(widthRatio, heightRatio);

          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        document.getElementById('original-size').innerHTML = `<span class="badge bg-info"> Tamaño original: ${(file.size / 1024 / 1024).toFixed(2)} Mb</span>`;
      };
    };

    reader.readAsDataURL(file);
  });

  // Función para obtener las coordenadas correctas en el canvas
  function getCanvasCoords(event) {
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    return {
      x: (clientX - rect.left) / rect.width * canvas.width,
      y: (clientY - rect.top) / rect.height * canvas.height
    };
  }

  canvas.addEventListener('mousedown', function(e) {
    isDrawing = true;
    const coords = getCanvasCoords(e);
    startX = coords.x;
    startY = coords.y;
  });

  canvas.addEventListener('mousemove', function(e) {
    if (isDrawing) {
      const coords = getCanvasCoords(e);
      endX = coords.x;
      endY = coords.y;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.rect(startX, startY, endX - startX, endY - startY);
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });

  canvas.addEventListener('mouseup', function() {
    isDrawing = false;
  });

  canvas.addEventListener('touchstart', function(e) {
    isDrawing = true;
    const coords = getCanvasCoords(e);
    startX = coords.x;
    startY = coords.y;
  });

  canvas.addEventListener('touchmove', function(e) {
    if (isDrawing) {
      const coords = getCanvasCoords(e);
      endX = coords.x;
      endY = coords.y;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.rect(startX, startY, endX - startX, endY - startY);
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    // e.preventDefault(); // Evitar el desplazamiento de la página durante el dibujo
  });

  canvas.addEventListener('touchend', function() {
    isDrawing = false;
  });

  document.getElementById('cropButton').addEventListener('click', function() {
    const width = (endX - startX) / scaleFactor;
    const height = (endY - startY) / scaleFactor;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.drawImage(img, startX / scaleFactor, startY / scaleFactor, width, height, 0, 0, width, height);
    
    const quality = 0.2; // Ajusta la calidad según sea necesario
    const compressedDataUrl = tempCanvas.toDataURL('image/jpeg', quality);

    const compressedImg = document.getElementById('compressed');
    compressedImg.src = compressedDataUrl;

    fetch(compressedDataUrl)
      .then(res => res.blob())
      .then(blob => {
        document.getElementById('compressed-size').innerHTML = `<span class="badge bg-success">Tamaño comprimido: ${(blob.size / 1024 / 1024).toFixed(2)} Mb</span>`;
      });

    // Opción para descargar la imagen comprimida
    const downloadContainer = document.getElementById('download-container');
    const downloadLink = document.createElement('a');
    downloadLink.href = compressedDataUrl;
    downloadLink.download = 'dni_comprimido.jpg';
    downloadLink.textContent = 'Descargar Imagen Recortada y Comprimida';
    downloadLink.className = 'btn btn-outline-success';
    downloadContainer.appendChild(downloadLink);
  });
  document.getElementById('darkModeSwitch').addEventListener('change', function() {
    document.body.classList.toggle('bg-dark');
    document.body.classList.toggle('text-light');
  });
});