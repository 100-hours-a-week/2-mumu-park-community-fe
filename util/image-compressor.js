async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // 최대 크기 지정 (예: 300px)
        const MAX_SIZE = 300;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // 이미지 품질 조정 (0.6 = 60% 품질)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
