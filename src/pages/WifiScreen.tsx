import React from 'react';

const WifiScreen = () => {
  return (
    <div style={styles.container}>
      <iframe
        src="https://icloud.indionetworks.com/wifilan/cust/"
        title="WiFi Management Portal"
        style={styles.iframe}
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
};

export default WifiScreen;