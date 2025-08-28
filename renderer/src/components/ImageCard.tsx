import { Button, ButtonGroup, Card, CardContent, CardHeader, CardMedia, Typography, type CardProps } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useState, type ReactNode } from "react";

type ImageCardProps = CardProps & {
  file?: File | null;
  dateCaptured?: Dayjs | null;
  save?: (date: Dayjs | null) => void;
  action?: ReactNode;
}

export const ImageCard = ({ file, dateCaptured, save, sx, action, ...cardProps }: ImageCardProps) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    dateCaptured ? dateCaptured : dayjs(file?.lastModified)
  );

  return (
    <Card square variant="outlined" sx={{ borderRadius: '10px', ...sx }} {...cardProps}>
      <CardHeader
        title={
          <Typography
            variant="body2"
            noWrap
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}
          >
            {file?.name || 'Unknown Image'}
          </Typography>
        }
        action={action}
      />
      <CardMedia
        component="img"
        sx={{ width: '90%', height: 'auto', aspectRatio: '1/1', borderRadius: '8px', margin: '0px auto' }}
        image={file ? URL.createObjectURL(file) : ""}
        alt={file?.name || 'Unknown Image'}
      />
      <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 'auto', padding: '10px' }}>
        {
          save ? (
            <ButtonGroup>
              <DatePicker
                disableFuture
                disabled={!save}
                label="Date Captured"
                value={selectedDate}
                onChange={setSelectedDate}
              />
              <Button sx={{ width: '20%' }} variant="outlined" onClick={() => save?.(selectedDate)}>Save</Button>
            </ButtonGroup>) : (
            <Typography variant="body2" color="text.secondary">
              Date Captured: {selectedDate ? selectedDate.format('MMMM D, YYYY') : 'Unknown'}
            </Typography>
          )
        }
      </CardContent>
    </Card>
  )
}