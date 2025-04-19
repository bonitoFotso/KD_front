import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/AppHooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client } from '@/types/client';
import ClientCard from './components/ClientCard';
import KDTable from '@/components/table/KDTable3';

interface ClientManagementProps {
  onClientSelect?: (clientId: number) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({
  onClientSelect
}) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const { clientService } = useServices();

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Erreur lors du chargement des clients');
    } finally {
      setIsLoading(false);
    }
  }, [clientService]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleClientClick = (clientId: number): void => {
    if (onClientSelect) {
      onClientSelect(clientId);
    } else {
      navigate(`/clients/${clientId}`);
    }
  };

  const handleNewClient = () => {
    navigate('/clients/new');
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'table' : 'grid');
  };

  const getFilteredClients = () => {
    const filtered = clients.filter(client =>
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (activeTab) {
      case 'clientsAgrees':
        return filtered.filter(client => 
          client.agree && client.est_client === true
        );
      case 'prospects':
        return filtered.filter(client => 
          client.est_client === false && client.agree === false
        );
      case 'prospectsAgrees':
        return filtered.filter(client => 
          client.est_client === false && client.agree === true
        );
      case 'all':
      default:
        return filtered;
    }
  };

  const filteredClients = getFilteredClients();

  // Configuration des colonnes pour KDTable
  const tableColumns = [
    {
      key: 'c_num' as keyof Client,
      label: 'Numéro',
      sortable: true,
    },
    {
      key: 'nom' as keyof Client,
      label: 'Nom',
      sortable: true,
      render: (client: Client) => (
        <div>
          <div className="font-medium">{client.nom}</div>
          {client.matricule && <div className="text-xs text-gray-500">Mat: {client.matricule}</div>}
          {client.bp && <div className="text-xs text-gray-500">BP: {client.bp}</div>}
        </div>
      ),
    },
    {
      key: 'pays_nom' as keyof Client,
      label: 'Localisation',
      sortable: true,
      render: (client: Client) => {
        return (
          <div>
            <div className="font-medium">{client.pays_nom}</div>
            <div className="text-xs text-gray-500">{client.region_nom}</div>
            <div className="text-xs text-gray-500">{client.ville_nom}</div>
            {client.quartier && <div className="text-xs text-gray-500">{client.quartier}</div>}
          </div>
        )
      },
    },
    {
      key: 'contact' as keyof Client,
      label: 'Contact',
      sortable: true,
      render: (client: Client) => (
        <div>
          <div>{client.email}</div>
          <div>{client.telephone || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'secteur_activite' as keyof Client,
      label: 'Secteur',
      sortable: true,
    },
    {
      key: 'statut' as keyof Client,
      label: 'Statut',
      render: (client: Client) => {
        return client.est_client 
          ? (client.agree ? 'Client Agréé' : 'Client') 
          : (client.agree ? 'Prospect Agréé' : 'Prospect');
      },
      sortable: false,
    },
    {
      key: 'indicators' as keyof Client,
      label: 'Indicateurs',
      sortable: false,
      render: (client: Client) => (
        <div className="flex items-center space-x-2">
          {client.contacts_count > 0 && (
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full" title="Contacts">
              C: {client.contacts_count}
            </div>
          )}
          {client.offres_count > 0 && (
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full" title="Offres">
              O: {client.offres_count}
            </div>
          )}
          {client.affaires_count > 0 && (
            <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full" title="Affaires">
              A: {client.affaires_count}
            </div>
          )}
          {client.factures_count > 0 && (
            <div className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full" title="Factures">
              F: {client.factures_count}
            </div>
          )}
          {client.opportunities_count > 0 && (
            <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full" title="Opportunités">
              Op: {client.opportunities_count}
            </div>
          )}
          {client.courriers_count > 0 && (
            <div className="text-xs bg-rose-100 text-rose-800 px-2 py-1 rounded-full" title="Courriers">
              Co: {client.courriers_count}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'entite' as keyof Client,
      label: 'Entité',
      sortable: true,
    },
    {
      key: 'actions' as keyof Client,
      label: 'Actions',
      render: (client: Client) => (
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-900 p-0"
          onClick={(e) => {
            e.stopPropagation();
            handleClientClick(client.id);
          }}
        >
          Détails
        </Button>
      ),
      sortable: false,
      align: 'right' as const,
    },
  ];

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredClients.map((client: Client) => (
        <ClientCard
          key={client.id}
          client={client}
          onClick={() => handleClientClick(client.id)}
        />
      ))}
    </div>
  );

  const renderTableView = () => (
    <KDTable
      data={filteredClients}
      columns={tableColumns}
      keyExtractor={(client: Client) => client.id}
      searchKeys={['nom', 'email', 'telephone']}
      onRowClick={(client: Client) => handleClientClick(client.id)}
      title={null}
      isLoading={isLoading}
      noResultsMessage="Aucun client trouvé"
      searchPlaceholder="Rechercher un client..."
      pagination={true}
      defaultPageSize={10}
      hoverable={true}
      onRefresh={loadClients}
      groupingOptions={[
        { key: 'pays_nom' as keyof Client, label: 'Pays' },
        { key: 'region_nom' as keyof Client, label: 'Region' },
        { key: 'ville_nom' as keyof Client, label: 'Ville' },
        { key: 'secteur_activite' as keyof Client, label: 'Secteur_Activite' },
        { key: 'est_client' as keyof Client, label: 'Type de client' },
        { key: 'agree' as keyof Client, label: 'Statut d\'agrément' }

      ]}
      language={{
        loading: "Chargement des clients...",
        noResults: "Aucun client trouvé",
        noResultsSearch: "Aucun client ne correspond à votre recherche.",
        clearSearch: "Effacer la recherche",
        resetFilters: "Réinitialiser tous les filtres",
        showingItems: "Affichage {start} à {end} sur {total} clients",
        itemsPerPage: "clients par page",
      }}
    />
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={toggleViewMode}
            className="flex items-center gap-2"
            title={viewMode === 'grid' ? 'Afficher en tableau' : 'Afficher en grille'}
          >
            {viewMode === 'grid' ? (
              <><List className="h-4 w-4" /> Liste</>
            ) : (
              <><Grid className="h-4 w-4" /> Grille</>
            )}
          </Button>
          <Button
            onClick={handleNewClient}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau Client
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">Tous</TabsTrigger>
          <TabsTrigger value="clientsAgrees" className="flex-1">Clients Agréés</TabsTrigger>
          <TabsTrigger value="prospects" className="flex-1">Prospects</TabsTrigger>
          <TabsTrigger value="prospectsAgrees" className="flex-1">Prospects Agréés</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {viewMode === 'grid' && (
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Rechercher un client..."
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      
      {filteredClients.length === 0 && viewMode === 'grid' ? (
        <div className="text-center py-8 text-gray-500">
          Aucun client trouvé
        </div>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderTableView()
      )}
    </div>
  );
};

export default ClientManagement;