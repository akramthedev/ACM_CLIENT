import React, { Component } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Sidebar from '../Sidebar/Sidebar'
import DossierClient from '../Dossier client/DossierClient'
import AcceuilSec from './AcceuilSec'
import Navbar from '../Navbar/Navbar'
import NavbarDossierClient from '../Navbar/NavbarDossierClient'
import Login from '../../Login/Login'

export default class AcceuilST extends Component {
  render() {
    return (
        
      <div className='d-flex'>
        <div className='w-auto'>
            <Sidebar/>
        </div>
        <div className='col'>
            <Navbar/>
            <AcceuilSec/>            
           
        </div>

      </div>
      
    )
  }
}
