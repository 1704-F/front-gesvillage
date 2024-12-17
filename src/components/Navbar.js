import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Supprimez le token du stockage local
    alert('Déconnexion réussie ! Vous serez redirigé vers la page de connexion.');
    navigate('/'); // Redirigez vers la page de connexion ou d'accueil
    window.location.reload(); // Recharge la page pour réinitialiser les états liés à l'utilisateur
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Accueil</Link>
        </li>
        {/* Navigation conditionnelle basée sur le rôle */}
        {role === 'SuperAdmin' && (
          <>
            <li>
              <Link to="/dashboard/superadmin">Tableau de bord SuperAdmin</Link>
            </li>
            <li>
              <Link to="/services">Gérer les Services</Link>
            </li>
            <li>
              <Link to="/services/new">Créer un Service</Link>
            </li>
            <li>
              <Link to="/admins/new">Créer un Admin</Link>
            </li>
            <li>
              <Link to="/service-billing">Factures Services</Link>
            </li>
            <li>
              <Link to="/settings">Paramètres</Link> 
            </li>
          </>
        )}
        {role === 'Admin' && (
          <>
            <li>
              <Link to="/dashboard/admin">Tableau de bord Admin</Link>
            </li>
            <li>
              <Link to="/users">Gérer les Utilisateurs</Link>
            </li>
            <li>
              <Link to="/consumers">Gérer les Consommateurs</Link>
            </li>
            <li>
              <Link to="/meters">Gérer les Compteurs</Link>
            </li>
            <li>
              <Link to="/readings">Gérer les Consommations</Link>
            </li>
            <li>
              <Link to="/invoices">Gérer les Factures</Link>
            </li>
          </>
        )}
        {role === 'Superviseur' && (
          <li>
            <Link to="/dashboard/superviseur">Tableau de bord Superviseur</Link>
          </li>
        )}
        {role === 'Consommateur' && (
  <>
    <li>
      <Link to="/dashboard/consommateur">Tableau de bord Consommateur
      </Link>
    </li>
    <li>
      <Link to="/ConsumerProfiles"> Mon Profil</Link>
    </li>
    <li>
      <Link to="/ConsumerMeters">Mes Compteurs</Link>
    </li>
    <li>
      <Link to="/ConsumerConsumptions">Mes Consommations</Link>
    </li>
    <li>
      <Link to="/ConsumerInvoices">Mes Factures </Link>
    </li>

  </>
)}
      
        <li>
          <button onClick={handleLogout}>Déconnexion</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;