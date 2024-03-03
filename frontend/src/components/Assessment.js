import React from 'react';


const AnimatedGrid = () => {
    const gridStyle = {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
    };

    const itemStyle = {
        width: '30%',
        minHeight: '500px',
        backgroundColor: 'rgba(103, 58, 183, 0.5)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '10px',
        animation: 'riseFall 3s infinite alternate',
        padding: '40px',
        boxSizing: 'border-box',
        backdropFilter: 'blur(10px)',
    };

    const headingStyle = {
        fontSize: '4rem', 
        margin: '0 0 20px 0', 
    };

    const paragraphStyle = {
        fontSize: '1.6rem', 
        margin: '0 0 10px 0',
    };

    return (
        <>
        <div style={gridStyle}>
            <div style={itemStyle}>
                <h2 style={headingStyle}>Welcome To WordWave!</h2>
                <p style={paragraphStyle}>Your AI-powered partner in mastering English listening and speaking.</p>
            </div>
            <div style={itemStyle}>
                <h3 style={headingStyle}>Features</h3>
                <ul style={paragraphStyle}>
                    <li>Real-time speech recognition to enhance your pronunciation</li>
                    <li>Interactive listening exercises tailored to your skill level</li>
                    <li>Instant feedback on your performance to accelerate your learning</li>
                    <li>Engaging speaking tasks that simulate real-life conversations</li>
                </ul>
                
            </div>
            
        </div>
        <div>
        <button type="button" class="btn btn-primary">Primary</button>
        </div>
        </>
    );
};

export default AnimatedGrid;
