import React from 'react'
import '../styles/Sidebar.css'
import photo from '../assets/photo.png'
import { MdArrowDropDown } from "react-icons/md";
import { GoHome } from "react-icons/go";
import { FaRegFolderOpen } from "react-icons/fa";
import { RiLayout4Line } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
// import { Route, Routes } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate()
  return (
    <div>
      <div className="profile-container">
      <img src={photo} alt="Profile" className="profile-image" />
      <div className="profile-text">
        <div className="profile-name">Kevin Rangel</div>
        <div className="profile-role">Admin</div>
      </div>
      <MdArrowDropDown   className='arrow-icon'/>
    </div>
    <div className='home-container'>
    <div className='home'>
    <GoHome className='home-icon'/>
    <div className='home-text'  onClick={()=>navigate('/Neo')}>Home</div>
        </div>
        <div className='project-container'>
    <FaRegFolderOpen className='project-icon'/>
    <div className='project-text'>Project</div>
    </div>
    <div className='template-container'>
    <RiLayout4Line className='template-icon'/>
    <div className='template-text'>Template</div>
    </div>
    </div>
    </div>
  )
}

export default Sidebar