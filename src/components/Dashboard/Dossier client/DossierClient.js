import React from 'react'
import './DossierClient.css'
import { Link } from 'react-router-dom'
function DossierClient() {
  return (
    <div className='container-fluid'>
        <div className='fs-3 fw-medium m-2'>
            Clients
        </div>
        <div className='m-2'>
        <input type="text" className="formsearch form-control" placeholder="&#x1F50E;&#xFE0E; Vous cherchez quel client ..."/>
        </div>
        <table class="table table-striped">
  <thead>
    <tr>
        <th scope="col">Dossier</th>
      <th scope="col">Noms</th>
      <th scope="col">Prénoms</th>
      <th scope="col">E-mail</th>
      <th scope="col">Téléphone</th>
      <th scope="col">Status</th>
      <th scope="col">Prestation</th>
      <th scope="col">Agent</th>
      <th scope="col">Autre infos</th>
      <th scope="col">Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Mehdi</td>
      <td>Boulloul</td>
      <td>boulloul.123@gmail.com</td>
      <td>0625002504</td>
      <td><span class="badge text-bg-success">Validé</span></td>
      <td><span class="badge text-bg-success">EP</span></td>
      <td>Amadou</td>
      <td>Les infos supplémentaire</td>
      <td><button type="button" class="btn btn-outline-info">Détails</button></td>
    </tr>
    <tr>
    <th scope="row">2</th>
      <td>Mehdi</td>
      <td>Boulloul</td>
      <td>boulloul.123@gmail.com</td>
      <td>0625002504</td>
      <td><span class="badge text-bg-warning">En attente</span></td>
      <td><span class="badge text-bg-success">EF</span></td>
      <td>Amadou</td>
      <td>Les infos supplémentaire</td>
      <td><button type="button" class="btn btn-outline-info">Détails</button></td>
    </tr>
    <tr>
    <th scope="row">3</th>
      <td>Mehdi</td>
      <td>Boulloul</td>
      <td>boulloul.123@gmail.com</td>
      <td>0625002504</td>
      <td><span class="badge text-bg-danger">En attente</span></td>
      <td><span class="badge text-bg-success">EP</span></td>
      <td>Amadou</td>
      <td>Les infos supplémentaire</td>
      <td><button type="button" class="btn btn-outline-info">Détails</button></td>
    </tr>
  </tbody>
</table>
<div className='d-flex justify-content-end'>
  <Link to="/addclient" className='bouttonadd btn btn-primary bi bi-plus' type='submit'>
     Ajouter un client</Link>
</div>



    </div>
  )
}

export default DossierClient