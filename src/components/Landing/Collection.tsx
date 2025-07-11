"use client";
import React, { useState } from 'react';
import { Search, CheckCircle, Edit, MessageSquare, Target, BarChart3 } from 'lucide-react';

export default function GrowCollectionSection() {
    const [activeItem, setActiveItem] = useState(0);

    const menuItems = [
        { icon: Search, text: "Bibendum tellus", color: "text-blue-500" },
        { icon: CheckCircle, text: "Cras eget", color: "text-gray-600" },
        { icon: Edit, text: "Dolor pharetra", color: "text-gray-600" },
        { icon: MessageSquare, text: "Amet, fringilla", color: "text-gray-600" },
        { icon: Target, text: "Amet nibh", color: "text-gray-600" },
        { icon: BarChart3, text: "Sed velit", color: "text-gray-600" }
    ];

    return (
        <div className="max-w-7x1 mx-auto bg-gradient-to-br p-10 from-blue-50 to-purple-100 relative overflow-hidden">
            {/* Purple Wave Background */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1200 400" className="w-full h-auto">
                    <path
                        d="M0,300 C300,200 600,350 900,250 C1050,200 1150,300 1200,250 L1200,400 L0,400 Z"
                        fill="url(#gradient)"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="relative z-10  px-4 py-16 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                                Grow Your Collection
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Enim neque massa porta adipiscing elit. Sem libero id faucibus nibh amet dictum pellentesque sed. Eu non turpis risus odio sapien, fames sit rhoncus. Nec magna sed interdum sit purus tellus. Et volutpat proin neque placerat at bibendum quam lectus.
                            </p>
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-3">
                            {menuItems.map((item, index) => {
                                const IconComponent = item.icon;
                                const isActive = index === activeItem;

                                return (
                                    <div
                                        key={index}
                                        onClick={() => setActiveItem(index)}
                                        className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${isActive
                                                ? 'bg-blue-50 border border-blue-200 shadow-sm'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100'
                                            }`}>
                                            <IconComponent className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'
                                                }`} />
                                        </div>
                                        <span className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'
                                            }`}>
                                            {item.text}
                                        </span>
                                        {isActive && (
                                            <div className="ml-auto">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Browser Windows */}
                    <div className="relative">
                        {/* Back Browser Window */}
                        <div className="absolute top-8 left-4 w-full max-w-md transform rotate-3 z-10">
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                {/* Browser Header */}
                                <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    </div>
                                </div>
                                {/* Browser Content */}
                                <div className="h-64 bg-gradient-to-br from-orange-200 to-pink-200">
                                    <img
                                        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=300&fit=crop&crop=center"
                                        alt="Workspace"
                                        className="w-full h-full object-cover mix-blend-overlay"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Front Browser Window */}
                        <div className="relative z-20 w-full max-w-lg ml-auto">
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                {/* Browser Header */}
                                <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Video Call Interface */}
                                <div className="relative h-80">
                                    <img
                                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop&crop=center"
                                        alt="Person in video call"
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Video Call UI Elements */}
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                                </div>
                                                <span className="text-white text-sm font-medium">00:45:32</span>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors">
                                                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                                                </button>
                                                <button className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors">
                                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Small video thumbnail */}
                                    <div className="absolute top-4 right-4 w-24 h-16 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                                        <img
                                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop&crop=center"
                                            alt="Self view"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg opacity-80 animate-pulse"></div>
                        <div className="absolute bottom-12 -left-8 w-12 h-12 bg-gradient-to-br from-pink-400 to-red-400 rounded-full shadow-lg opacity-60 animate-bounce" style={{ animationDelay: '1s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}