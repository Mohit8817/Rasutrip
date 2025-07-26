import React from 'react';

const styles = {
  loader: {
    textAlign: 'center',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    maxWidth: '35rem',
    height: '30rem',
    margin: '0 auto',
    fontFamily: 'Roboto, sans-serif',
  
  },
  wait: {
    margin: '5rem 0',
  },
  iata_code: {
    fontSize: '6rem',
    opacity: 0.3,
    top: '52%',
    position: 'absolute',
    color: '#0099cc',
  },
  departure_city: {
    left: 0,
  },
  arrival_city: {
    right: '1.5rem',
  },
  plane: {
    position: 'absolute',
    margin: '0 auto',
    width: '100%',
  },
  planeImg: {
    animation: 'spin 2.5s linear infinite',
  },
  earthWrapper: {
    position: 'absolute',
    margin: '0 auto',
    width: '100%',
    paddingTop: '2.7rem',
  },
  earth: {
    width: '160px',
    height: '160px',
    background: 'url("https://zupimages.net/up/19/34/6vlb.gif")',
    borderRadius: '100%',
    backgroundSize: '340px',
    animation: 'earthAnim 12s infinite linear',
    margin: '0 auto',
    border: '1px solid #CDD1D3',
  },
  keyframes: `
    @keyframes spin {
      100% {
        transform: rotate(360deg);
      }
    }
    @keyframes earthAnim {
      0% {background-position-x: 0;}
      100% {background-position-x: -340px;}
    }
  `,
};

const FlightLoader = ({message}=null,color="black") => {
  return (
    <>
      <style>{styles.keyframes}</style>
      <div style={styles.loader}>

       
        <div style={styles.plane}>
          <img
            src="https://zupimages.net/up/19/34/4820.gif"
            style={styles.planeImg}
            alt="plane"
          />
         
        </div>
         
        <div style={styles.earthWrapper}>
          <div style={styles.earth}></div>
        </div>
       
       <span>{message}</span>
      </div>
      
    </>
  );
};

export default FlightLoader;
