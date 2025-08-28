import React, { useState } from "react";
import Popover from "@mui/material/Popover";
import { Box } from "@mui/material";

type BitImageProps = {
    img: HTMLImageElement;
};

const BitImage: React.FC<BitImageProps> = ({ img }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    // Convert HTMLImageElement to data URL for rendering
    const getImageSrc = () => {
        if (img.src) return img.src;
        // fallback: create data URL from canvas if needed
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0);
        return canvas.toDataURL();
    };

    const imageSrc = getImageSrc();

    const handleOpen = (e: React.MouseEvent<HTMLImageElement>) => {
        setAnchorEl(e.currentTarget);
    };
    const handleClose = () => setAnchorEl(null);

    const open = Boolean(anchorEl);
    const id = open ? "bit-image-popover" : undefined;

    return (
        <Box sx={{ display: "inline-block", margin: "auto" }}>
            <img
                src={imageSrc}
                alt="BitImage"
                width={30}
                height={30}
                style={{ cursor: "pointer", borderRadius: 4, border: "1px solid #ccc" }}
                onClick={handleOpen}
            />
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
                <div style={{ padding: 8 }} onClick={handleClose}>
                    <img
                        src={imageSrc}
                        alt="FullImage"
                        style={{ maxWidth: 400, maxHeight: 400, display: "block" }}
                    />
                </div>
            </Popover>
        </Box>
    );
};

export default BitImage;