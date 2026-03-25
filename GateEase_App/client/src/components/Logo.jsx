import React from 'react';

const Logo = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* මේකෙන් අර Ribbon එක නැවිලා තියෙන ලස්සන 3D පෙනුම එනවා */}
        <path d="M20 4L4 32H14L20 21L26 32H36L20 4Z" fill="#CFFF04"/>
        <path d="M14 32L20 21L26 32H14Z" fill="#99CC00"/>
        <path d="M4 32L14 32L10 25L4 32Z" fill="#E6FF4D"/>
    </svg>
);

export default Logo;