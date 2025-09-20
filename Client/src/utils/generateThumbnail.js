export const generateThumbnail = async (file) => {
    console.log("file:",file)
    const thumbnail = file.type.includes("image/") ? await getImageThumbnail(file) : getFileIconUrl(file.type);
    return thumbnail;
};

const getImageThumbnail = (file) => {

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // 计算缩略图尺寸
        const maxSize = 20;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * scale;
        const height = img.height * scale;
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 1));
        
        // 清理内存
        img.src = '';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// 获取文件图标
const getFileIconUrl = (fileType) => {
  const fileIcons = {
    "application/pdf": "pdf.svg",
    "application/x-zip-compressed": "zip.svg",
  };
  
  const iconName = fileIcons[fileType] || "doc.svg";
  return `/src/assets/icons/${iconName}`;
};