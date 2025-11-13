import React, { useState, useEffect } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import '../styles/CloudinaryUpload.css';

const CloudinaryUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');

  // Configuración de Cloudinary
  const cloudName = 'dp4n2foim';
  const uploadPreset = 'prueba';
  
  const cld = new Cloudinary({ cloud: { cloudName } });

  // Cargar el script del widget de Cloudinary
  useEffect(() => {
    // Verificar si el script ya está cargado
    if (window.cloudinary) return;

    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup si es necesario
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const openUploadWidget = () => {
    // Verificar que el widget esté disponible
    if (!window.cloudinary) {
      setError('El widget de carga aún no está disponible. Intenta de nuevo en un momento.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        folder: 'fotos-videos',
        sources: ['local', 'camera'], // Permitir subir desde galería o cámara
        multiple: true, // Permitir múltiples archivos
        maxFileSize: 100000000, // 100MB en bytes
        maxFiles: 10, // Máximo 10 archivos por sesión
        clientAllowedFormats: ['image', 'video'], // Solo imágenes y videos
        resourceType: 'auto', // Detectar automáticamente el tipo
        cropping: false, // Sin recorte
        showSkipCropButton: true,
        language: 'es', // Interfaz en español
        text: {
          es: {
            or: 'O',
            back: 'Atrás',
            close: 'Cerrar',
            menu: {
              files: 'Mis archivos',
              camera: 'Cámara'
            },
            local: {
              browse: 'Explorar',
              dd_title_single: 'Arrastra tu archivo aquí',
              dd_title_multi: 'Arrastra tus archivos aquí',
              drop_title_single: 'Suelta el archivo para subirlo',
              drop_title_multiple: 'Suelta los archivos para subirlos'
            },
            queue: {
              title: 'Cola de subida',
              title_uploading_with_counter: 'Subiendo {{num}} archivos',
              done: 'Listo',
              mini_title: 'Subidos',
              mini_title_uploading: 'Subiendo',
              abort_all: 'Cancelar todo'
            }
          }
        }
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          console.log('Archivo subido:', result.info);
          setUploadedFiles(prev => [...prev, result.info]);
          setError('');
        }
        if (error) {
          console.error('Error en widget:', error);
          setError('Error al subir el archivo. Intenta de nuevo.');
        }
      }
    );

    widget.open();
  };

  return (
    <div className="cloudinary-upload">
      {error && (
        <div className="upload-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      <div className="upload-info">
        <p>📌 Tamaño máximo por archivo: <strong>100MB</strong></p>
        <p className="upload-tip">Tip: Para videos largos, usa calidad HD (1080p) en lugar de 4K</p>
      </div>
      
      <div className="action-buttons">
        <button 
          className="action-btn upload-btn"
          onClick={openUploadWidget}
          type="button"
        >
          <span className="btn-icon">📷</span>
          <span className="btn-text">Sube tu recuerdo</span>
        </button>
      </div>

      {/* Galería de archivos subidos */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-gallery">
          <h3>Tus recuerdos subidos ✨</h3>
          <div className="gallery-grid">
            {uploadedFiles.map((file, index) => {
              const publicId = file.public_id;
              
              // Si es video, mostrar un placeholder o thumbnail
              if (file.resource_type === 'video') {
                return (
                  <div key={index} className="gallery-item video-item">
                    <div className="video-placeholder">
                      <span className="video-icon">🎥</span>
                      <p>Video subido</p>
                    </div>
                  </div>
                );
              }
              
              // Si es imagen, usar AdvancedImage
              const image = cld.image(publicId);
              return (
                <div key={index} className="gallery-item">
                  <AdvancedImage cldImg={image} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;
