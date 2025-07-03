import React, { useEffect, useRef, useState } from 'react';
import { Card, CardMedia, Dialog, DialogContent, Skeleton } from '@mui/material';
import callApi from '../../Services/callApi';

const LazyImageCard = ({ item }: any) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const ref = useRef(null);

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    // console.log('observer',observer);
    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // useEffect(() => {
  //   onloadImage()
  // }, [])

  // useEffect(() => {
  //   if (isVisible && !imageSrc) {
  //     onloadImage()
  //   }
  // }, [isVisible, item, imageSrc]);

  const onloadImage = async () => {
    const result = await callApi('/image?type=get&source=checkin&source_id=' + item.id)
    if (result.data) {
      setImageSrc(result.data)
    }
  }

  return (
    <>
      {item ? (<>
        <img onClick={handleOpen} src={'http://www.worklift.dnatechnology99.com/image/checkin_'+item.id+'.jpg'} alt={item.id} style={{ width: '50px', height: '50px', marginRight: '16px', borderRadius: '8px' }} />
        <Dialog open={open} onClose={handleClose} maxWidth="md">
          <DialogContent sx={{ p: 0 }}>
            <img src={'http://www.worklift.dnatechnology99.com/image/checkin_'+item.id+'.jpg'} alt="Full Size" style={{ width: '100%', height: 'auto' }} />
          </DialogContent>
        </Dialog>
      </>
      ) : (
        <img src={'/user.png'} alt={item.id} style={{ width: '50px', height: '50px', marginRight: '16px', borderRadius: '8px' }} />
      )}



    </>
  );
};

export default LazyImageCard;
