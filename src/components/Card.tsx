'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
    title: string;
    image: string;
    hover_image: string;
    link: string;
}

export default function Card(props: Props) {
    let [isHovered, setIsHovered] = useState(false);

    function handleHoverOver() {
        setIsHovered(true);
    }

    function handleHoverOff() {
        setIsHovered(false);
    }

    return (
        <Link className="card" href={props.link} onMouseEnter={handleHoverOver} onMouseLeave={handleHoverOff}>
            <h3 className="card-title">{props.title}</h3>
            <img className="card-image" src={isHovered ? props.hover_image : props.image} alt={props.title} />
        </Link>
    );
}