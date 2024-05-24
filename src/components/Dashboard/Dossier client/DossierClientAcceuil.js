import React from 'react'
import DossierClient from './DossierClient'
import NavbarDossierClient from '../Navbar/NavbarDossierClient'
import Sidebar from '../Sidebar/Sidebar'
function DossierClientAcceuil() {
  return (
    <div className='d-flex'>
        <div className='w-auto'>
            <Sidebar/>
        </div>
        <div className='col'>
            <NavbarDossierClient/>
            <DossierClient/>            
           
        </div>

      </div>
  )
}

export default DossierClientAcceuil