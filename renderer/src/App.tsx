import { AddAPhotoRounded, Delete, Search, Upload } from '@mui/icons-material';
import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import { memo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';
import { FFAAnalysisPane } from './components/FFAAnalysisPane';
import { ImageCard } from './components/ImageCard';
import { useImageStorage } from './hooks/useImageStorage';
import type { FileWithDate } from './models';

const MemoizedFFAAnalysisPane = memo(FFAAnalysisPane, (prevProps, nextProps) => {
  const areFilesEqual = (a: FileWithDate[], b: FileWithDate[]) => {
    if (a.length !== b.length) return false;
    return a.every((file, index) => file.fileId === b[index].fileId);
  };
  return areFilesEqual(prevProps.files, nextProps.files);
});


function App() {
  const { files, getFileModalProps, addFile, removeFile } = useImageStorage();
  const { getInputProps, getRootProps, open } = useDropzone({
    accept: {
      'image/*': []
    },
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    onDropAccepted: (files) => addFile(files[0])
  });
  const [isUploadMode, setIsUploadMode] = useState(true);

  return (
    <Box sx={{ width: '100vw', height: '100vh', padding: '2rem' }}>
      <Modal {...getFileModalProps()} />
      {isUploadMode ? (
        <Box component="div" {...getRootProps()} sx={{
          flexGrow: 1,
          padding: '2rem',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          marginBottom: '1rem',
          height: 'calc(100% - 1rem)'
        }}>
          <input {...getInputProps()} />
          <Box sx={{ position: 'sticky', top: '1rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Drag and Drop some images here to begin Analysis
            </Typography>
            <Box sx={{ display: 'flex', gap: '1rem', float: 'right' }}>
              <Button focusRipple={false} variant='outlined' size='small' startIcon={<AddAPhotoRounded />} onClick={open}>
                Add Image
              </Button>
              <Button variant='outlined' size='small' onClick={() => setIsUploadMode(prev => !prev)} startIcon={isUploadMode ? <Search /> : <Upload />}>
                {isUploadMode ? 'Begin Analysis' : 'Upload Files'}
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', overflow: 'scroll', paddingTop: '2rem', maxHeight: 'calc(100% - 1rem)' }}>
            {
              files.length > 0 && (
                files.map(({ fileId, file, dateCaptured }) => (
                  <ImageCard
                    sx={{ width: { xs: '100%', sm: 'calc(33.33% - 1rem)', md: 'calc(25% - 1rem)' } }}
                    key={fileId}
                    file={file}
                    dateCaptured={dateCaptured}
                    action={
                      <IconButton size="small" onClick={() => removeFile(fileId)}>
                        <Delete />
                      </IconButton>
                    }
                  />
                ))
              )
            }
          </Box>
        </Box>
      ) : (
        <MemoizedFFAAnalysisPane files={files} onUpload={() => setIsUploadMode(true)} />
      )}
    </Box>
  )
}

export default App;
