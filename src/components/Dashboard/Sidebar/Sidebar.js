import React from 'react'
import './SidebarCSS.css'
import { Link } from 'react-router-dom';
function Sidebar() {
  return (
    <div className='sidebar d-flex justify-content-between flex-column  link-light py-3 ps-3 pe-5 vh-100'>
        <div>
            <div className='logo'>

            
            <a href='#' >
            <img src={require('../../Assets/Logo_acm.png')} height={80} width={120}/> 
            </a>
            </div>
            <hr className='text-light'/>
            <ul className='nav nav-pills flex-column mt-2'>
            <Link to="/" style={{textDecoration:'none'}}>
                <li className='nav-item  p-1'>
                    
                    
                    <span className=' link-light link-opacity-75-hover link-underline-opacity-0 '>
                        <i className=' bi bi-house-door-fill me-3'></i>
                        <span >Acceuil</span>
                    </span>
                    
                </li>
                </Link>
                <Link to="/dossierclient" style={{textDecoration:'none'}}>
                <li className='nav-item mt-3 p-1'>
                    
                    <a className='link-light link-opacity-50-hover link-underline-opacity-0' >
                        <i className='bi bi-folder-fill  me-3'></i>
                        <span>Dossier client</span>
                    </a>
                    
                    
                </li>
                </Link>
                <li className='nav-item mt-3 p-1'>
                    <a className='link-light link-opacity-50-hover link-underline-opacity-0' >
                        <i className='bi bi-calendar-event-fill me-3'></i>
                        <span>Agenda</span>
                    </a>
                </li>
                <li className='nav-item mt-3 p-1'>
                    <a className='link-light link-opacity-50-hover link-underline-opacity-0' >
                        <i className='bi bi-cast me-3'></i>
                        <span>Prestation</span>
                    </a>
                </li>
                <li className='nav-item mt-3 p-1'>
                    <a className='link-light link-opacity-50-hover link-underline-opacity-0' >
                        <i className='bi bi-receipt me-3'></i>
                        <span>Facturation</span>
                    </a>
                </li>
                <li className='nav-item mt-3 p-1'>
                    <a className=' link-light link-opacity-50-hover link-underline-opacity-0' >
                        <i className='bi bi-gear-wide-connected me-3'></i>
                        <span>Paramétrage</span>
                    </a>
                </li>
            </ul>
        </div>
        <div>
            <hr className='text-light'/>
            <div className='nav-item'>
                <a className='link-light link-opacity-50-hover link-underline-opacity-0'>
                    <i className='bi bi-person-circle me-3 fs-4'></i>
                    <span className='fs-5'>Boulloul el mahdi</span>
                </a>

            </div>
        </div>
      </div>
      
  )
}

export default Sidebar