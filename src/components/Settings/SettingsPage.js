import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { fetchSettings, updateSetting, createSetting } from "../../utils/api";

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    try {
      const response = await fetchSettings();
      setSettings(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des paramètres :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key, newValue) => {
    try {
      await updateSetting(key, { value: newValue });
      fetchSettings(); // Recharge les paramètres après mise à jour
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paramètre :", error);
    }
  };

  const handleCreateSetting = async () => {
    try {
      await createSetting({ key: newKey, value: newValue });
      setNewKey("");
      setNewValue("");
      fetchAllSettings(); // Recharger les paramètres après la création
    } catch (error) {
      console.error("Erreur lors de la création du paramètre :", error);
    }
  };

  if (loading) {
    return <Typography>Chargement des paramètres...</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Paramètres
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Clé</TableCell>
              <TableCell>Valeur</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {settings.map((setting) => (
              <TableRow key={setting.id}>
                <TableCell>{setting.id}</TableCell>
                <TableCell>{setting.key}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    value={setting.value}
                    onChange={(e) =>
                      setSettings((prevSettings) =>
                        prevSettings.map((s) =>
                          s.id === setting.id
                            ? { ...s, value: e.target.value }
                            : s
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUpdateSetting(setting.key, setting.value)}
                  >
                    Enregistrer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" style={{ marginTop: "20px" }}>
        Ajouter un nouveau paramètre
      </Typography>
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <TextField
          label="Clé"
          variant="outlined"
          fullWidth
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
        />
        <TextField
          label="Valeur"
          variant="outlined"
          fullWidth
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleCreateSetting}>
          Ajouter
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
