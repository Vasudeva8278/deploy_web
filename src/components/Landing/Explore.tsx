"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
    {
        id: 1,
        title: "Splash",
        image:
            "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop&crop=center",
        bgColor: "bg-gradient-to-br from-red-400 to-pink-400",
    },
    {
        id: 2,
        title: "Colorful Face",
        image:
            "https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=400&h=300&fit=crop&crop=center",
        bgColor: "bg-gradient-to-br from-purple-400 via-pink-400 to-red-400",
    },
    {
        id: 3,
        title: "Lines Styling",
        image:
            "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&crop=center",
        bgColor: "bg-gradient-to-br from-blue-400 to-purple-400",
    },
];

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    // ✅ Auto-slide logic
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000); // change every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-6 mt-2">

            <div className="grid lg:grid-cols-2 gap-1 items-center w-full">
                {/* Left Content */}
                <div className="space-y-8 p-10">
                    <div className="space-y-6">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            Be Incredible
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-md">
                            Nec ultrices eget placerat ultricies eleifend dignissim aliquet
                            sapien. Senectus vestibulum, eget erat sit et congue cursus
                            pretium.
                        </p>
                    </div>

                    <button className="bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl">
                        Explore Xinder
                    </button>
                </div>

                {/* Right Carousel */}
                <div className="relative">
                    <div className="flex items-center justify-center space-x-4">
                        {/* Previous Button */}
                        <button
                            onClick={prevSlide}
                            className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-300 z-10"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-600" />
                        </button>

                        {/* Carousel Container */}
                        <div className="relative w-80 h-96 perspective-1000">
                            {slides.map((slide, index) => {
                                const isActive = index === currentSlide;
                                const isPrev =
                                    index === (currentSlide - 1 + slides.length) % slides.length;
                                const isNext =
                                    index === (currentSlide + 1) % slides.length;

                                let transform =
                                    "translateX(100%) scale(0.8) rotateY(45deg)";
                                let opacity = "0";
                                let zIndex = "0";

                                if (isActive) {
                                    transform = "translateX(0%) scale(1) rotateY(0deg)";
                                    opacity = "1";
                                    zIndex = "30";
                                } else if (isPrev) {
                                    transform = "translateX(-80%) scale(0.8) rotateY(-25deg)";
                                    opacity = "0.7";
                                    zIndex = "20";
                                } else if (isNext) {
                                    transform = "translateX(80%) scale(0.8) rotateY(25deg)";
                                    opacity = "0.7";
                                    zIndex = "20";
                                }

                                return (
                                    <div
                                        key={slide.id}
                                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${slide.bgColor} rounded-2xl shadow-2xl overflow-hidden`}
                                        style={{
                                            transform,
                                            opacity,
                                            zIndex,
                                        }}
                                    >
                                        <div className="relative h-full">
                                            <img
                                                src={slide.image}
                                                alt={slide.title}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                                        <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                                                    </div>
                                                    <h3 className="text-white font-semibold text-lg">
                                                        {slide.title}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={nextSlide}
                            className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-300 z-10"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Dots Indicator */}
                    <div className="flex justify-center space-x-2 mt-8">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                        ? "bg-gray-800 scale-125"
                                        : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}