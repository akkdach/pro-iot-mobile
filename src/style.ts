import React from 'react';
import { makeStyles, createStyles } from '@mui/styles';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      backgroundColor: 'lightblue',
      padding: '20px',
      borderRadius: '8px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
    },
    btn:{
        padding:5,
        borderRadius:15
    },btnPrimary:{
        background:'#fff',
        color:'#000'
    }
  })
);

export default useStyles;



