import React, { useRef, useEffect } from 'react';

const CanvasThumbnail = ({ name }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const shortName = name.substring(0, 5);

        // Generate a random background color
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        ctx.fillStyle = randomColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set text properties
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(shortName, canvas.width / 2, canvas.height / 2);
    }, [name]);

    return (
        <canvas
            ref={canvasRef}
            width="160"
            height="160"
            style={{ border: '10px solid white', margin: '10px' }}
        ></canvas>
    );
};

const CanvasThumbnails = ({ names }) => {
    return (
        <div id="canvasContainer" style={{ display: 'flex', flexWrap: 'wrap' }}>
            
                <CanvasThumbnail name={names} />
            
        </div>
    );
};

export default CanvasThumbnails;
