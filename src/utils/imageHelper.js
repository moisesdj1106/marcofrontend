// Helper para manejar rutas de imágenes correctamente en desarrollo y producción

/**
 * Obtiene la ruta correcta para una imagen
 * @param {string} imageName - Nombre del archivo de imagen
 * @returns {string} - Ruta correcta para la imagen
 */
export const getImagePath = (imageName) => {
  if (!imageName) return '';
  const cleanName = imageName
    .replace(/^\/+/, '')
    .replace(/^src\/public\//, '');
  return `/${cleanName}`;
};

/**
 * Obtiene la URL completa para una imagen de producto
 * @param {string} imageUrl - URL de la imagen del producto
 * @param {string} fallbackImage - Nombre de la imagen de respaldo
 * @returns {string} - URL completa de la imagen
 */
export const getProductImage = (imageUrl, fallbackImage = 'moto.jpg') => {
  if (!imageUrl) {
    return getImagePath(fallbackImage);
  }

  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/src/public/')) {
    return getImagePath(imageUrl);
  }

  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  return getImagePath(imageUrl);
};

// Imágenes disponibles
export const IMAGES = {
  LOGO: 'logo.png',
  MOTO: 'moto.jpg',
  BANNER1: 'baner1.png',
  BANNER2: 'baner2.png',
  GEMINI: 'Gemini_Generated_Image_7oobzk7oobzk7oob.png',
  OTRO: 'otro.png',
  PDF: 'horariooctavo.pdf'
};