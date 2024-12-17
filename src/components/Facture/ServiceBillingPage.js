import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
} from "@mui/material";
import {
  fetchInvoices,
  exportInvoicePDF,
  generateAllInvoices,
  updateInvoice,
  deleteInvoice,
} from "../../utils/api";

const ServiceBillingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // Page courante pour la pagination
  const [rowsPerPage, setRowsPerPage] = useState(5); // Nombre de lignes par page

  useEffect(() => {
    fetchInvoicesData();
  }, [statusFilter, startDate, endDate]);

  const fetchInvoicesData = async () => {
    try {
      const response = await fetchInvoices({ status: statusFilter, startDate, endDate });
      setInvoices(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des factures :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleGenerateInvoices = async () => {
    try {
      await generateAllInvoices();
      fetchInvoicesData(); // Recharge les factures après génération
    } catch (error) {
      console.error("Erreur lors de la génération des factures :", error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateInvoice(id, { status });
      fetchInvoicesData();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      try {
        await deleteInvoice(id);
        fetchInvoicesData(); // Recharge les factures après suppression
      } catch (error) {
        console.error("Erreur lors de la suppression de la facture :", error);
      }
    }
  };

  const handleExportPDF = async (id) => {
    try {
      const response = await exportInvoicePDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `facture_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Erreur lors du téléchargement du PDF :", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredInvoices = invoices
    .filter((invoice) => {
      const matchesSearch =
        invoice.service?.name?.toLowerCase().includes(search.toLowerCase()) ||
        invoice.id.toString().includes(search) ||
        invoice.reference?.toLowerCase().includes(search);

      const matchesStatus = !statusFilter || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage); // Appliquer la pagination

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Factures des Services
      </Typography>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <TextField
          label="Rechercher une facture"
          variant="outlined"
          fullWidth
          value={search}
          onChange={handleSearch}
        />
        <FormControl fullWidth>
          <InputLabel>Filtrer par statut</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="pending">En attente</MenuItem>
            <MenuItem value="paid">Payé</MenuItem>
            <MenuItem value="overdue">En retard</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Date de début"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Date de fin"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" color="primary" onClick={handleGenerateInvoices}>
          Générer Factures
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Référence</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Compteurs</TableCell>
              <TableCell>Total à payer</TableCell>
              <TableCell>Date d'échéance</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.reference}</TableCell>
                <TableCell>{invoice.service?.name || "Inconnu"}</TableCell>
                <TableCell>{invoice.total_meters}</TableCell>
                <TableCell>{invoice.total_due} FCFA</TableCell>
                <TableCell>
                  {new Date(invoice.due_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Select
                    value={invoice.status}
                    onChange={(e) => handleUpdateStatus(invoice.id, e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="pending">En attente</MenuItem>
                    <MenuItem value="paid">Payé</MenuItem>
                    <MenuItem value="overdue">En retard</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleExportPDF(invoice.id)}
                    style={{ marginRight: "10px" }}
                  >
                    Télécharger PDF
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDeleteInvoice(invoice.id)}
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={invoices.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default ServiceBillingPage;
