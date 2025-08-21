// ReceiveEquipmentModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { QrCode2 } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import QRScanner from '../../Component/QRScanner';

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

interface ReceiveEquipmentModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  orderId: string;
  equipment: string;
}

const ReceiveEquipmentModal: React.FC<ReceiveEquipmentModalProps> = ({ open, onClose }) => {
  const [equipment, setEquipment] = useState('');
  const [openScanner, setOpenScanner] = useState<boolean>(true);
  const [orderId, setOrderId] = useState<string>();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
    reset();
    onClose();
  };

  const onSubmit = async (data: any) => {

  }

  // const handleSubmit = () => {
  //   if (serial && order) {
  //     onSubmit();
  //     setSerial('');
  //     setOrder('');
  //     onClose();
  //   }
  // };
  const handleInputChange = async (e: any) => {

  }
  return (
    <>



      <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2}>📥 รับเครื่อง</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', }}>
            <TextField
              name="equipment"
              onChange={(e) => { handleInputChange(e) }}
              variant="outlined"
              placeholder="Enter OrderID"
              sx={{
                height: 50,
                fontWeight: 500,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                maxWidth: '100%',
                width: 300,
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                  '& fieldset': {
                    borderColor: '#ddd',
                  },
                },
                '& input': {
                  padding: '12px 14px',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" size="small" onClick={() => setOpenScanner(true)}>
                      <QrCode2 />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
              <Button variant="outlined" onClick={() => { reset(); onClose(); }}>ยกเลิก</Button>
              <Button variant="contained" onClick={handleSubmit(onFormSubmit)}>บันทึก</Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      
            {openScanner && (
              <QRScanner
                open={openScanner}
                onClose={() => setOpenScanner(false)}
                onScan={(value) => {
                  handleInputChange({ target: { name: 'orderId', value } });
                }}
              />
            )}
    </>
  );
};

export default ReceiveEquipmentModal;
