import { IconButton, type ModalProps } from "@mui/material";
import type { Dayjs } from "dayjs";
import type { FileWithDate } from "../models";
import { v4 as uuidv4 } from 'uuid';

import { useCallback, useState } from "react";
import { ImageCard } from "../components/ImageCard";
import { Close } from "@mui/icons-material";

export const useImageStorage = () => {
    const [files, setFiles] = useState<FileWithDate[]>([]);

    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const addFileWithDate = useCallback(async (file: File, date: Dayjs) => {
        const fileWithDate: FileWithDate = {
            file,
            dateCaptured: date,
            fileId: uuidv4()
        };
        try {
            await setFiles((prevFiles) => [...prevFiles, fileWithDate].sort((a, b) => a.dateCaptured.valueOf() - b.dateCaptured.valueOf()));
        } catch (err) {
            console.error('Failed to add file:', err);
        }
    }, []);

    const savePendingFile = useCallback((date: Dayjs | null) => {
        if (pendingFile && date) {
            addFileWithDate(pendingFile, date);
        }
        setPendingFile(null);
    }, [pendingFile]);

    const handleModalClose = useCallback(() => {
        setPendingFile(null);
    }, []);

    const getFileModalProps = (): ModalProps => ({
        open: pendingFile !== null,
        onClose: handleModalClose,
        children: (
            <ImageCard
                file={pendingFile}
                save={savePendingFile}
                square={true}
                sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400 }}
                action={
                    <IconButton onClick={handleModalClose}>
                        <Close />
                    </IconButton>
                }
            />
        ),
    })

    const addFile = (file: File) => {
        setPendingFile(file);
    }

    const removeFile = (fileId: string) => {
        setFiles((prevFiles) => prevFiles.filter((f) => f.fileId !== fileId));
    }

    return {
        files,
        getFileModalProps,
        addFile,
        removeFile
    }
}