import React, { Component } from 'react'
import './LoginCss.css'
export default class Login extends Component {
  render() {
    return (
        <div className='container-fluid'>
      <div className='loginformlogo row'>
        <div className='col-7 gradient'>
            <div className='logo'>
            <img src={require('../Assets/Logo_acm.png')} height={200} width={250}/> 
            </div>
            
        </div>
        <div className='loginform col-5'> 
          <form>
            <div className='titlelogin'>
            <h3>Bienvenue</h3>
            <p>Connectez-vous</p>
            </div>
            <div className='contenulogin'>
            <div className="mb-3">
              
              <input
                type="email"
                className="forminput form-control"
                placeholder="   &#xf0e0; Email"
                
              />
            </div>
            <div className="mb-3">
              
              <input
                type="password"
                className="forminput form-control"
                placeholder="   &#xf023; Mot de passe"
              />
            </div>
           
            <div className="d-grid">
              <button type="submit" className="boutton btn btn-primary">
                Se connecter
              </button>
            </div>
            <p className="forgot-password text-right">
            <a className='forgot-pasword' href="#">Mot de passe oublié?</a>
            </p>
            </div>
            
          </form>
        </div>
      </div>
      </div>
    );
  }
}
