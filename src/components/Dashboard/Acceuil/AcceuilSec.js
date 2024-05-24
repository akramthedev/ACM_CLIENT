import React from 'react'
import './AcceuilSec.css'
function AcceuilSec() {
  return (
    <div className='p-2 bg-light'>
    <div className='container-fluid'>
        <div className='row'>
            <div className='col-12 col-sm-6 col-md-4 col-lg-3 p-2 bg-light'>
                <div className='d-flex justify-content-between py-4 px-2 align-items-center 
                     bg-white  '>
                    
                    <div>
                        <span>Taches imminentes</span>
                        <h2>10</h2>
                    </div>
                    <div className='icobackgroundimm  px-3 py-2 rounded-4 '>
                    <i className='icotextimm fs-3 bi bi-graph-up-arrow'></i>
                    </div>
                </div>
            </div>
            <div className='col-12 col-sm-6 col-md-4 col-lg-3 p-2 bg-light'>
                <div className='d-flex justify-content-between py-4 px-2 align-items-center 
                     bg-white'>
                    
                    <div>
                        <span>Future taches</span>
                        <h2>23</h2>
                    </div>
                    <div className='icobackgroundfutur  px-3 py-2 rounded-4 '>
                    <i className='icotextfutur fs-3 bi bi-graph-up-arrow'></i>
                    </div>
                </div>
            </div>
            <div className='col-12 col-sm-6 col-md-4 col-lg-3 p-2 bg-light'>
                <div className='d-flex justify-content-between py-4 px-2 align-items-center 
                     bg-white '>
                    
                    <div>
                        <span>Taches déjà effectués</span>
                        <h2>187</h2>
                    </div>
                    <div className='icobackgrounddeja  px-3 py-2 rounded-4 '>
                    <i className='icotextdeja fs-3 bi bi-graph-up-arrow'></i>
                    </div>
                </div>
            </div>
            <div className='col-12 col-sm-6 col-md-4 col-lg-3 p-2 bg-light'>
                <div className='d-flex justify-content-between py-4 px-2 align-items-center 
                     bg-white '>
                    
                    <div>
                        <span>Total des taches</span>
                        <h2>220</h2>
                    </div>
                    
                    <div className='icobackgroundtotal  px-3 py-2 rounded-4 '>
                    <i className='icotexttotal fs-3 bi bi-graph-up-arrow'></i>
                    </div>
                    
                    
                    
                </div>
            </div>
        </div>
    </div>
    </div>
  )
}

export default AcceuilSec