
import './App.css';
import AcceuilST from './components/Dashboard/Acceuil/AcceuilST';
import Login from './components/Login/Login';
import { Routes,Route, Router } from 'react-router-dom';

import DossierClientAcceuil from './components/Dashboard/Dossier client/DossierClientAcceuil';
import AddClient from './components/Dashboard/Dossier client/AddClient';



function App() {
  return (
    <div>
      <Routes>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/' element={<AcceuilST/>}></Route>
        <Route path='/dossierclient' element={<DossierClientAcceuil/>}></Route>
        <Route path='/addclient' element={<AddClient/>}></Route>

      </Routes>
      
    </div>
  );
}

export default App;
